using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mime;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;
using Utility.EDW.Reporting;
using Utility.GenericEntity;
using Utility.Http;
using Utility.OpgAuth;

namespace GenericApi
{
    public class Startup
    {
        private FrameworkWrapper _fw;
        private ILogger<Startup> _logger;
        private Dictionary<string, IGenericEntity> _lbms;
        private Guid _rsConfigId;

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
                {
                    options.AddPolicy("CorsPolicy", builder =>
                        builder.AllowAnyMethod().
                                AllowAnyHeader().
                                AllowCredentials().
                                SetIsOriginAllowed(x => true)
                    );
                }
            ).Configure<CookiePolicyOptions>(options =>
            {
                options.CheckConsentNeeded = _ => false;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            }).Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            }).AddHttpContextAccessor();
        }

        public void UnobservedTaskExceptionEventHandler(object sender, UnobservedTaskExceptionEventArgs args)
        {
            if (_fw != null)
            {
                _fw.Error("UnobservedTaskException", $"{args.Exception}");
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
                app.UseDeveloperExceptionPage();
            }

            _logger = app.ApplicationServices.GetService<ILogger<Startup>>();

            try
            {
                _fw = new FrameworkWrapper();
                _ = Guid.TryParse(_fw.StartupConfiguration.GetS("Config/RsConfigId"), out _rsConfigId);
                LoadLbms().GetAwaiter().GetResult();
                Auth.Initialize(_fw).GetAwaiter().GetResult();
            }
            catch (Exception ex)
            {
                _logger.LogError("Unable to Initialize: {exception}", ex);
                throw;
            }

            TaskScheduler.UnobservedTaskException += UnobservedTaskExceptionEventHandler;

            HealthCheckHandler.Initialize(_fw).GetAwaiter().GetResult();

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
                    await context.WriteSuccessRespAsync(_fw.StartupConfiguration.GetS(""));
                    return;
                }
                else if (context.Request.Query["m"] == "reinit")
                {
                    var success = await _fw.ReInitialize();

                    if (success)
                    {
                        await LoadLbms();
                        await context.WriteSuccessRespAsync(JsonWrapper.Serialize(new { result = "success" }));
                    }
                    else
                    {
                        var traceLog = Data.GetTrace()?.Select(t => $"{t.logTime:yy-MM-dd HH:mm:ss.f}\t{t.location} - {t.log}").Join("\r\n") ?? $"{DateTime.Now:yy-MM-dd HH:mm:ss.f}\tNoTrace Log";
                        await context.WriteFailureRespAsync(JsonWrapper.Serialize(new { result = "failed", traceLog }));
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

                JObject request = null;
                Exception parseException = null;

                try
                {
                    request = JObject.Parse(requestBody);
                }
                catch (JsonReaderException ex)
                {
                    await DropEvent(requestRsId, requestRsTimestamp, new
                    {
                        et = "MalformedBody",
                        ex.Message,
                        ex.Path,
                        ex.LineNumber,
                        ex.LinePosition
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

                await DropEvent(requestRsId, requestRsTimestamp, new
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

                var identity = request["i"]?.Value<string>();

                foreach (var kvp in request)
                {
                    if (kvp.Key == "i")
                    {
                        continue;
                    }

                    await DropEvent(requestRsId, requestRsTimestamp, new
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
                                await DropEvent(requestRsId, requestRsTimestamp, new
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

                        IGenericEntity result = null;
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

                                string args;
                                string payload = null;
                                if (kvp.Value is JObject obj && obj.Count == 2 && obj["args"] != null && obj["payload"] != null)
                                {
                                    args = obj["args"].ToString(Formatting.None);
                                    payload = obj["payload"].ToString(Formatting.None);
                                }
                                else
                                {
                                    args = kvp.Value.ToString(Formatting.None);
                                }

                                result = await Data.CallFn(connectionName, command, args, payload);
                                processed = true;
                            }
                        }

                        if (!processed && _lbms.TryGetValue(method, out var lbm))
                        {
                            if (!lbm.GetB("skipAuth") && !await CheckAuth())
                            {
                                continue;
                            }

                            result = (IGenericEntity)await _fw.RoslynWrapper.RunFunction(
                                lbm.GetS("id"),
                                new
                                {
                                    _httpContext = context,
                                    method,
                                    payload = GenericEntityJson.CreateFromObject(kvp.Value),
                                    _fw,
                                    requestRsId,
                                    requestRsTimestamp,
                                    dropEvent = (Func<object, Task<(Guid eventId, DateTime eventTimestamp)>>)(body => DropEvent(requestRsId, requestRsTimestamp, body))
                                }, new StateWrapper()
                            );
                            processed = true;
                        }

                        if (!processed)
                        {
                            throw new InvalidOperationException($"Unknown method {method}");
                        }

                        if (result?.HasPath("r") == true)
                        {
                            results[kvp.Key] = result;
                        }
                        else
                        {
                            results[kvp.Key] = new
                            {
                                r = 0,
                                result
                            };
                        }

                        await DropEvent(requestRsId, requestRsTimestamp, new
                        {
                            et = "RequestMethodProcessed",
                            Method = kvp.Key,
                            Request = kvp.Value,
                            Response = result
                        });
                    }
                    catch (Exception ex)
                    {
                        await DropEvent(requestRsId, requestRsTimestamp, new
                        {
                            et = "RequestMethodError",
                            Method = kvp.Key,
                            Request = kvp.Value,
                            Exception = ex.Message,
                            ex.StackTrace
                        }, null, _fw.Error);

                        results[kvp.Key] = new
                        {
                            r = 100,
                            result = ex.Message
                        };
                    }
                }

                await DropEvent(requestRsId, requestRsTimestamp, new
                {
                    et = "RequestProcessed"
                });

                context.Response.ContentType = MediaTypeNames.Application.Json;
                await context.Response.WriteAsync(JsonConvert.SerializeObject(results));
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

            await logMethod("HandleRequest", JsonConvert.SerializeObject(new { rsId, rsTimestamp, eventTimestamp, eventBody }));

            if (_rsConfigId != default)
            {
                edwEvent ??= new EdwBulkEvent();
                var eventId = Guid.NewGuid();

                var eventRsIds = new Dictionary<Guid, (Guid rsId, DateTime rsTimestamp)>()
                {
                    [_rsConfigId] = (rsId, rsTimestamp)
                };

                edwEvent.AddEvent(eventId, eventTimestamp, eventRsIds, eventBody);

                await _fw.EdwWriter.Write(edwEvent);

                return (eventId, eventTimestamp);
            }

            return (Guid.Empty, DateTime.Now);
        }

        private async Task LoadLbms()
        {
            var lbms = new Dictionary<string, IGenericEntity>();

            foreach (var tuple in _fw.StartupConfiguration.GetDe("Config/LBMs"))
            {
                var name = tuple.key;
                var config = tuple.entity;
                var id = Guid.Parse(config.GetS("id"));

                var lbm = await _fw.Entities.GetEntity(id);
                if (lbm == null)
                {
                    throw new InvalidOperationException($"No LBM with Id: {id}");
                }

                if (lbm.GetS("Type") != "LBM.CS")
                {
                    throw new InvalidOperationException($"Only entities of type LBM.CS are supported, LBM {id} has type {lbm.GetS("Type")}");
                }

                var (debug, debugDir) = _fw.RoslynWrapper.GetDefaultDebugValues();
                _fw.RoslynWrapper.CompileAndCache(new ScriptDescriptor(id, id.ToString(), lbm.GetS("Config"), debug, debugDir), true);

                lbms.Add(name, config);
            }

            _lbms = lbms;
        }
    }
}
