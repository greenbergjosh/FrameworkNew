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
using Utility.Http;
using Utility.OpgAuth;

namespace GenericApi
{
    public class Startup
    {
        private FrameworkWrapper _fw;
        private ILogger<Startup> _logger;
        private Guid _rsConfigId;

        public void ConfigureServices(IServiceCollection services) => services.AddCors(options => options.AddPolicy("CorsPolicy", builder =>
    builder.AllowAnyMethod().
            AllowAnyHeader().
            AllowCredentials().
            SetIsOriginAllowed(x => true)
                )).Configure<CookiePolicyOptions>(options =>
            {
                options.CheckConsentNeeded = _ => false;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            }).Configure<ForwardedHeadersOptions>(options => options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto).AddHttpContextAccessor();

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

            TaskScheduler.UnobservedTaskException += UnobservedTaskExceptionEventHandler;

            app.UseCors("CorsPolicy").UseForwardedHeaders().Run(HandleRequest);
        }

        private async Task HandleRequest(HttpContext context)
        {
            try
            {
                if (context.Request.Path.HasValue && context.Request.Path.Value.Contains("favicon.ico"))
                {
                    context.Response.StatusCode = 404;
                    return;
                }
                else if (context.IsLocal() && context.Request.Query["m"] == "config")
                {
                    await context.WriteSuccessRespAsync(JsonSerializer.Serialize(_fw.StartupConfiguration));
                    return;
                }
                else if (context.Request.Query["m"] == "reinit")
                {
                    var success = await _fw.ReInitialize();

                    if (success)
                    {
                        await Program.LoadLbms();
                        await context.WriteSuccessRespAsync(JsonSerializer.Serialize(new { result = "success" }));
                    }
                    else
                    {
                        var traceLog = Data.GetTrace()?.Select(t => $"{t.logTime:yy-MM-dd HH:mm:ss.f}\t{t.location} - {t.log}").Join("\r\n") ?? $"{DateTime.Now:yy-MM-dd HH:mm:ss.f}\tNoTrace Log";
                        await context.WriteFailureRespAsync(JsonSerializer.Serialize(new { result = "failed", traceLog }));
                    }

                    return;
                }
                else if (await HealthCheckHandler.Handle(context, _fw))
                {
                    return;
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
                    ["requestInfo"] = new { r = 0, requestRsId, requestRsTimestamp }
                };

                var identity = await request.GetS("i", null);

                foreach (var kvp in await request.GetD<Entity>(""))
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

                                var args = (await kvp.Value.Get("args")).FirstOrDefault()?.ToString();
                                var payload = (await kvp.Value.Get("payload")).FirstOrDefault()?.ToString();
                                if (args == null && payload == null)
                                {
                                    args = kvp.Value.ToString();
                                }

                                result = await Data.CallFn(connectionName, command, args, payload);
                                processed = true;
                            }
                        }

                        if (!processed && Program.Lbms.TryGetValue(method, out var lbm))
                        {
                            if (!await lbm.GetB("skipAuth", false) && !await CheckAuth())
                            {
                                continue;
                            }

                            var resultO = await _fw.RoslynWrapper.RunFunction(
                                await lbm.GetS("id"),
                                new
                                {
                                    _httpContext = context,
                                    method,
                                    payload = kvp.Value,
                                    _fw,
                                    requestRsId,
                                    requestRsTimestamp,
                                    dropEvent = (Func<object, Task<(Guid eventId, DateTime eventTimestamp)>>)(body => DropEvent(requestRsId, requestRsTimestamp, body))
                                }, new StateWrapper()
                            );

                            result = (Entity)resultO;
                            processed = true;
                        }

                        if (!processed)
                        {
                            throw new InvalidOperationException($"Unknown method {method}");
                        }

                        var r = (await result?.Get("r")).FirstOrDefault();
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
