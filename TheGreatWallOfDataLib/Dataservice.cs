using Microsoft.AspNetCore.Http;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TheGreatWallOfDataLib.Routing;
using Utility;
using Utility.EDW.Reporting;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace TheGreatWallOfDataLib
{
    public class DataService
    {
        public static FrameworkWrapper Fw = null;
        private bool _traceLogResponse = false;
        private Guid _greatWallOfDataRsId;

        public void Config(FrameworkWrapper fw)
        {
            try
            {
                Fw = fw;
                Fw.TraceLogging = fw.StartupConfiguration.GetS("Config/Trace").ParseBool() ?? false;
                _traceLogResponse = fw.StartupConfiguration.GetS("Config/TraceResponse").ParseBool() ?? false;
                Authentication.Initialize(fw).Wait();
                Lbm.Initialize(Fw).GetAwaiter().GetResult();
                Routing.Routing.Initialize(fw).Wait();
                _greatWallOfDataRsId = Guid.Parse("b7f50bd9-75bc-4fa8-aa0a-8375f33af614");
            }
            catch (Exception ex)
            {
                Fw?.Error(nameof(Config), ex.UnwrapForLog());
                throw;
            }
        }

        public void ReInitialize()
        {
            Fw.RoslynWrapper.functions.Clear();
            Lbm.Initialize(Fw).GetAwaiter().GetResult();
        }

        public async Task Run(HttpContext context)
        {
            var requestIdGuid = Guid.NewGuid();
            var requestId = requestIdGuid.ToString();
            var fResults = new Dictionary<string, string>();
            string requestBody = null;
            var returnHttpFail = false;
            var returnIoFail = false;

            context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
            context.Response.Headers.Add("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");

            try
            {
                if (!context.Request.ContentLength.HasValue || context.Request.ContentLength == 0)
                {
                    //  Probably a bot or other form of sniffer, return nothing
                    // ToDo: Drop response as if there were no HTTP listener. Possible?
                    await context.WriteSuccessRespAsync("");
                    await Fw.Log(nameof(Run), $"Empty request from {context.Ip()} Path: {context.Request.Path} UserAgent: {context.UserAgent()}");
                    return;
                }

                requestBody = await context.GetRawBodyStringAsync();

                var req = Jw.JsonToGenericEntity(requestBody);

                var identity = req.GetS("i").IfNullOrWhitespace(Jw.Empty);
                var funcs = req.GetD("").Where(p => p.Item1 != "i");
                
                var cancellation = new CancellationTokenSource();

                async Task<(string key, string result, string elapsed)> HandleFunc(Tuple<string, string> p)
                {
                    var scopeFunc = p.Item1;
                    var args = p.Item2;
                    var timer = Stopwatch.StartNew();

                    if (cancellation.Token.IsCancellationRequested)
                    {
                        return (scopeFunc, null, timer.Elapsed.ToString());
                    }

                    IGenericEntity fResult = null;
                    var funcParts = scopeFunc.Split(':');
                    var scope = funcParts[0];
                    var funcName = funcParts[1];

                    try
                    {
                        fResult = await Routing.Routing.GetFunc(scope, funcName)(scope, funcName, args, identity, context);
                    }
                    catch (Exception e)
                    {
                        var identityStr = identity == null ? "" : $"\r\nIdentity: \r\n{identity}\r\n";
                        var payloadStr = p.Item2 == null ? "null" : $"\r\n{p.Item2}\r\n";
                        var funcContext = $"\r\nName: {scopeFunc}{identityStr}\r\nArgs: {payloadStr}\r\nRequestId: {requestId}";

                        var fe = e as FunctionException;

                        if (fe == null)
                        {
                            await Fw.Error(nameof(Run), $"Unhandled function exception:{funcContext}\r\n{e.UnwrapForLog()}");
                            fResult = Jw.JsonToGenericEntity("{ \"r\": 1 }");
                        }
                        else
                        {
                            if (fe.ResultCode == 106) await Fw.Error($"Auth", fe.Message);
                            else
                            {
                                var inner = fe.InnerException == null ? "" : $"\r\n\r\nInner Exception:\r\n{fe.InnerException.UnwrapForLog()}";

                                await Fw.Error($"DB:{scopeFunc}", $"Function exception:{funcContext}\r\nResponse: {fe.Message}\r\n{fe.StackTrace}{inner}");
                            }

                            fResult = Jw.JsonToGenericEntity("{ \"r\": " + fe.ResultCode + "}");
                        }

                        if (fe?.HttpFail == true) returnHttpFail = true;

                        if (fe?.HaltExecution == true)
                        {
                            fResult = Jw.JsonToGenericEntity("{ \"r\": " + RC.FunctionHalting + "}");
                            cancellation.Cancel();
                        }
                    }

                    return (scopeFunc, fResult.GetS(""), timer.Elapsed.ToString());
                }

                IGenericEntity auth = null;
                try
                {
	                auth = await Authentication.GetUserDetails(identity, context);
                }
                catch (Exception)
                {
	                //don't care;
                    //identity will be logged with auth.id if it comes back and identity alone is sufficient to trace back later if needed.
                }

                var tasks = funcs.Select(HandleFunc).ToArray();

#if DEBUG
                foreach (var t in tasks)
                {
                    await t;
                }
#else
                await Task.WhenAll(tasks);
#endif
	            var results = tasks.Select(t => t.Result).ToList();

                await logAccessToEdw(requestIdGuid, identity, auth, req, results);

                fResults = results.Where(r => r.result != null).ToDictionary(x => x.key, x=> x.result);
            }
            catch (IOException e)
            {
                returnIoFail = true;
                try
                {

                    await Fw.Error(nameof(Run), $"IO exception: { context.Ip()} Path: { context.Request.Path} UserAgent: { context.UserAgent()} { e.UnwrapForLog()}\r\n{requestBody.IfNullOrWhitespace("[null]")}");
                    returnHttpFail = true;
                }
                catch
                {
                    await Fw.Error(nameof(Run), $"IO exception: {e.UnwrapForLog()}\r\n{requestBody.IfNullOrWhitespace("[null]")}");
                    returnHttpFail = true;
                }
            }
            catch (Exception e)
            {
                try
                {
                    await Fw.Error(nameof(Run), $"Unhandled exception: { context.Ip()} Path: { context.Request.Path} UserAgent: { context.UserAgent()} { e.UnwrapForLog()}\r\n{requestBody.IfNullOrWhitespace("[null]")}");
                    returnHttpFail = true;
                }
                catch
                {
                    await Fw.Error(nameof(Run), $"Unhandled exception: {e.UnwrapForLog()}\r\n{requestBody.IfNullOrWhitespace("[null]")}");
                    returnHttpFail = true;
                }
            }

            var body = new PL();

            fResults.ForEach(p => body.Add(PL.C(p.Key, p.Value, false)));

            var resp = body.ToString();

            if (_traceLogResponse) await Fw.Trace(nameof(Run), $"Result ({requestId}): {resp}");

            try
            {
                if (returnIoFail) await context.WriteFailureRespAsync("IO FAILED", null, "text/plain");
                else if (returnHttpFail) await context.WriteFailureRespAsync(resp);
                else await context.WriteSuccessRespAsync(resp);
            }
            catch (Exception e)
            {
                await Fw.Error(nameof(Run), $"Unhandled exception writing to response {e.UnwrapForLog()}");
                await context.WriteFailureRespAsync("");
            }
        }

        private Task logAccessToEdw(Guid requestIdGuid, string identity, IGenericEntity auth, IGenericEntity request, IEnumerable<(string key, string result, string elapsed)> results)
        {
            try
            {
                if (null == Fw.EdwWriter)
                {
                    return Task.WhenAll(Fw.Trace(nameof(Run), $"Request ({requestIdGuid}): {request}"),
                        Fw.Error(nameof(logAccessToEdw), "EdwWriter is not instantiated."));
                }
                var edwEvent = new EdwBulkEvent();
                var now = DateTime.Now;

                edwEvent.AddReportingSequence(requestIdGuid, now, new { UserId = auth?.GetS("id"), AccessToken = identity }, _greatWallOfDataRsId);

                var rsIds = new Dictionary<Guid, (Guid rsId, DateTime rsTimestamp)>
                {
                    [_greatWallOfDataRsId] = (requestIdGuid, now)
                };


                edwEvent.AddEvent(requestIdGuid, now, rsIds,
                    new { et = "GreatWallOfDataAccess", Requestor = auth?.GetS("id"), AccessToken = identity });

                foreach (var (method, _, elapsed) in results)
                {
                    edwEvent.AddEvent(Guid.NewGuid(), now, rsIds,
                        new { et = method, RequestParams = request[method], Requestor = auth?.GetS("id"), AccessToken = identity, ExecutionTime = elapsed });
                }

                return Fw.EdwWriter.Write(edwEvent);
            }
            catch (Exception e)
            {
	            return Fw.Error(nameof(logAccessToEdw),
		            $"Failed to write EDW event. {e.UnwrapForLog()}");
            }
        }

        private static class RC
        {
            public static int Success = 0;
            public static int FunctionHalting = 2;
        }

    }
}
