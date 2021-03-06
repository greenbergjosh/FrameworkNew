using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mime;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Utility;
using Utility.DataLayer;
using Utility.EDW.Reporting;
using Utility.Entity;
using Utility.OpgAuth;

namespace GenericApi
{
    public class Startup
    {
        private FrameworkWrapper _fw;
        private ILogger<Startup> _logger;
        private Guid _rsConfigId;
        private string _instanceName;

        public void ConfigureServices(IServiceCollection services) => services.AddCors(options => options.AddPolicy("CorsPolicy", builder =>
                builder.AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
                .SetIsOriginAllowed(x => true)
            )).Configure<CookiePolicyOptions>(options =>
            {
                options.CheckConsentNeeded = _ => false;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            }).Configure<ForwardedHeadersOptions>(options =>
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto);

        public void UnobservedTaskExceptionEventHandler(object sender, UnobservedTaskExceptionEventArgs args)
        {
            if (_fw != null)
            {
                _ = _fw.Error("UnobservedTaskException", $"{args.Exception}");
            }

            if (_logger != null)
            {
                _logger.LogError("UnobservedTaskException: {exception}", args.Exception);
            }
            else
            {
                File.AppendAllText("GenericApi.log", $"{DateTime.Now}::{args}{Environment.NewLine}");
            }
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                _ = app.UseDeveloperExceptionPage();
            }

            _logger = app.ApplicationServices.GetService<ILogger<Startup>>();

            _fw = Program.FrameworkWrapper;
            _rsConfigId = Program.RsConfigId;
            _instanceName = Program.InstanceName;

            TaskScheduler.UnobservedTaskException += UnobservedTaskExceptionEventHandler;

            app.UseCors("CorsPolicy").UseForwardedHeaders().Run(HandleRequest);
        }

        private async Task HandleRequest(HttpContext context)
        {
            try
            {
                foreach (var requestHandler in Program.RequestHandlers)
                {
                    var handled = await _fw.EvaluateEntity(requestHandler.handlerEntityId, _fw.Entity.Create(new
                    {
                        context,
                        requestHandler.handlerName,
                        requestHandler.handlerParameters
                    }));

                    if (await handled.EvalB("@"))
                    {
                        return;
                    }
                }

                var requestBody = await context.GetRawBodyStringAsync();

                var edwEvent = new EdwBulkEvent();
                var requestRsId = Guid.NewGuid();
                var requestRsTimestamp = DateTime.UtcNow;

                Entity request = null;
                Exception parseException = null;

                try
                {
                    request = await _fw.Entity.Parse("application/json", requestBody);
                }
                catch (JsonException ex)
                {
                    _ = await DropEvent(requestRsId, requestRsTimestamp, new
                    {
                        et = "MalformedBody",
                        ex.Message,
                        ex.Path,
                        ex.LineNumber,
                        ex.BytePositionInLine
                    }, null, _fw.Error);

                    parseException = ex;
                }

                edwEvent.AddReportingSequence(requestRsId, requestRsTimestamp, new
                {
                    RemoteIpAddress = context.Connection.RemoteIpAddress.ToString(),
                    context.Request.Path,
                    context.Request.QueryString,
                    Body = request ?? (object)requestBody
                }, _rsConfigId);

                _ = await DropEvent(requestRsId, requestRsTimestamp, new
                {
                    et = "RequestReceived",
                    RemoteIpAddress = context.Connection.RemoteIpAddress.ToString(),
                    context.Request.Path,
                    context.Request.QueryString,
                    Body = request ?? (object)requestBody
                }, edwEvent);

                if (parseException != null)
                {
                    context.Response.StatusCode = 400;
                    await context.Response.WriteAsync($"Malformed request: {parseException}");
                    return;
                }

                var results = new Dictionary<string, object>()
                {
                    ["requestInfo"] = new { r = 0, requestRsId, requestRsTimestamp, instanceName = _instanceName }
                };

                var identity = await request.EvalS("i", defaultValue: null);

                foreach (var kvp in await request.EvalD("@"))
                {
                    if (kvp.Key == "i")
                    {
                        continue;
                    }

                    _ = await DropEvent(requestRsId, requestRsTimestamp, new
                    {
                        et = "RequestMethodReceived",
                        Method = kvp.Key,
                        Request = kvp.Value
                    });

                    try
                    {
                        var method = kvp.Key;

                        async Task<bool> CheckAuth()
                        {
                            if (!await Auth.HasPermission(identity, kvp.Key.Replace(":", ".")))
                            {
                                _ = await DropEvent(requestRsId, requestRsTimestamp, new
                                {
                                    et = "RequestMethodUnauthorized",
                                    Method = kvp.Key,
                                    Identity = identity
                                });

                                results[kvp.Key] = new
                                {
                                    r = 106
                                };

                                return false;
                            }

                            return true;
                        }

                        Entity result = null;
                        var processed = false;

                        var parts = method.Split(":");
                        if (parts.Length == 2)
                        {
                            var connectionName = parts[0];
                            var command = parts[1];

                            if (Data.ContainsFunction(connectionName, command))
                            {
                                if (!await CheckAuth())
                                {
                                    continue;
                                }

                                var args = await kvp.Value.Eval("args").FirstOrDefault();
                                var payload = (await kvp.Value.Eval("payload").FirstOrDefault())?.ToString();
                                if (args == null && payload == null)
                                {
                                    args = kvp.Value;
                                }

                                result = await Data.CallFn(connectionName, command, args, payload);
                                processed = true;
                            }
                        }

                        if (!processed && Program.Lbms.TryGetValue(method, out var lbm))
                        {
                            if (!await lbm.EvalB("skipAuth", false) && !await CheckAuth())
                            {
                                continue;
                            }

                            result = await _fw.EvaluateEntity(
                                await lbm.EvalGuid("id"),
                                _fw.Entity.Create(new
                                {
                                    httpContext = context,
                                    method,
                                    payload = kvp.Value,
                                    requestRsId,
                                    requestRsTimestamp,
                                    dropEvent = (Func<object, Task<(Guid eventId, DateTime eventTimestamp)>>)(body => DropEvent(requestRsId, requestRsTimestamp, body))
                                })
                            );

                            processed = true;
                        }

                        if (!processed)
                        {
                            throw new InvalidOperationException($"Unknown method {method}");
                        }

                        var r = await result?.Eval("r").FirstOrDefault();
                        results[kvp.Key] = r != null
                            ? result
                            : (object)(new
                            {
                                r = 0,
                                result
                            });

                        _ = await DropEvent(requestRsId, requestRsTimestamp, new
                        {
                            et = "RequestMethodProcessed",
                            Method = kvp.Key,
                            Request = kvp.Value,
                            Response = result
                        });
                    }
                    catch (Exception ex)
                    {
                        _ = await DropEvent(requestRsId, requestRsTimestamp, new
                        {
                            et = "RequestMethodError",
                            Method = kvp.Key,
                            Request = kvp.Value,
                            Exception = ex.Message,
                            ExceptionRaw = ex.ToString(),
                            ex.StackTrace
                        }, null, _fw.Error);

                        results[kvp.Key] = new
                        {
                            r = 100,
                            result = ex.Message
                        };
                    }
                }

                _ = await DropEvent(requestRsId, requestRsTimestamp, new
                {
                    et = "RequestProcessed"
                });

                context.Response.ContentType = MediaTypeNames.Application.Json;
                await context.Response.WriteAsync(JsonSerializer.Serialize(results));
            }
            catch (Exception ex)
            {
                await _fw.Error("HandleRequest", $"Error handling request: {ex}");
                _logger.LogError("Error handling request: {exception}", ex);
                throw;
            }
        }

        private async Task<(Guid eventId, DateTime eventTimestamp)> DropEvent(Guid rsId, DateTime rsTimestamp, object eventBody, EdwBulkEvent edwEvent = null, Func<string, string, Task> logMethod = null)
        {
            logMethod ??= _fw.Log;

            var eventTimestamp = DateTime.UtcNow;

            await logMethod("HandleRequest", JsonSerializer.Serialize(new { rsId, rsTimestamp, eventTimestamp, eventBody }));

            if (_rsConfigId != default)
            {
                edwEvent ??= new EdwBulkEvent();
                var eventId = Guid.NewGuid();

                var eventRsIds = new Dictionary<Guid, (Guid rsId, DateTime rsTimestamp)>()
                {
                    [_rsConfigId] = (rsId, rsTimestamp)
                };

                edwEvent.AddEvent(eventId, eventTimestamp, eventRsIds, eventBody);

                _ = await _fw.EdwWriter.Write(edwEvent);

                return (eventId, eventTimestamp);
            }

            return (Guid.Empty, DateTime.Now);
        }
    }
}