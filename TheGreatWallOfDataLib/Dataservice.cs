using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TheGreatWallOfDataLib.Routing;
using Utility;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace TheGreatWallOfDataLib
{
    public class DataService
    {
        public static FrameworkWrapper Fw = null;
        private bool _traceLogResponse = false;

        public void Config(FrameworkWrapper fw)
        {
            try
            {
                Fw = fw;
                Fw.TraceLogging = fw.StartupConfiguration.GetS("Config/Trace").ParseBool() ?? false;
                _traceLogResponse = fw.StartupConfiguration.GetS("Config/TraceResponse").ParseBool() ?? false;
                Authentication.Initialize(fw).Wait();
            }
            catch (Exception ex)
            {
                Fw?.Error(nameof(Config), ex.UnwrapForLog());
                throw;
            }
        }

        public async Task Run(HttpContext context)
        {
            string bodyForError = null;
            var requestId = Guid.NewGuid().ToString();
            var fResults = new Dictionary<string, string>();

            try
            {
                var requestBody = await context.GetRawBodyStringAsync();

                await Fw.Trace(nameof(Run), $"Request ({requestId}): {requestBody}");
                var req = Jw.JsonToGenericEntity(requestBody);

                var identity = req.GetS("i").IfNullOrWhitespace(Jw.Empty);
                var funcs = req.GetD("").Where(p => p.Item1 != "i");
                var cancellation = new CancellationTokenSource();

                async Task<(string key, string result)> HandleFunc(Tuple<string, string> p)
                {
                    var scopeFunc = p.Item1;
                    var args = p.Item2;

                    if (cancellation.Token.IsCancellationRequested)
                    {
                        return (scopeFunc, null);
                    }

                    IGenericEntity fResult = null;
                    var funcParts = scopeFunc.Split(':');
                    var scope = funcParts[0];
                    var funcName = funcParts[1];

                    try
                    {
                        fResult = await Routing.Routing.GetFunc(scope, funcName)(scope, funcName, args, identity);
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
                            var inner = fe.InnerException == null ? "" : $"\r\n\r\nInner Exception:\r\n{fe.InnerException.UnwrapForLog()}";

                            await Fw.Error($"DB:{scopeFunc}", $"Function exception:{funcContext}\r\nResponse: {fe.Message}\r\n{fe.StackTrace}{inner}");

                            fResult = Jw.JsonToGenericEntity("{ \"r\": " + fe.ResultCode + "}");
                        }

                        if (fe?.HaltExecution == true)
                        {
                            fResult = Jw.JsonToGenericEntity("{ \"r\": " + RC.FunctionHalting + "}");
                            cancellation.Cancel();
                        }
                    }

                    return (scopeFunc, fResult.GetS(""));
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

                fResults.AddRange(tasks.Select(t => t.Result).Where(r => r.result != null));
            }
            catch (Exception e)
            {
                await Fw.Error(nameof(Run), $"Unhandled exception: {e.UnwrapForLog()}\r\n{bodyForError ?? "null"}");
            }

            var body = new PL();

            fResults.ForEach(p => body.Add(PL.C(p.Key, p.Value, false)));

            var resp = body.ToString();

            if(_traceLogResponse) await Fw.Trace(nameof(Run), $"Result ({requestId}): {resp}");

            await context.WriteSuccessRespAsync(resp);
        }

        private static class RC
        {
            public static int Success = 0;
            public static int FunctionHalting = 2;
        }

    }
}
