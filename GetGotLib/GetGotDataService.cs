using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Jw = Utility.JsonWrapper;

namespace GetGotLib
{
    public class GetGotDataService
    {
        public FrameworkWrapper _fw = null;
        public Guid RsConfigGuid;
        public int Parallelism;
        public string Conn = "GetGot";

        public void Config(FrameworkWrapper fw)
        {
            try
            {
                this._fw = fw;
                this.RsConfigGuid = new Guid(fw.StartupConfiguration.GetS("Config/RsConfigGuid"));
                this.Parallelism = fw.StartupConfiguration.GetS("Config/RsConfigGuid").ParseInt() ?? 1;
            }
            catch (Exception ex)
            {
                _fw?.Error(nameof(Config), ex.UnwrapForLog());
                throw;
            }
        }

        public async Task Run(HttpContext context)
        {
            string bodyForError = null;
            var result = Jw.Json(new { Error = "SeeLogs" });

            try
            {
                var requestFromPost = await context.GetRawBodyStringAsync();

                bodyForError = $"\r\nBody:\r\n{requestFromPost}";

                _fw.Trace(nameof(Run), $"Request: {requestFromPost}");
                var req = Jw.JsonToGenericEntity(requestFromPost);
                var allOk = await HandleEdwEvents(req, requestFromPost);

                if (allOk)
                {
                    var identity = req.GetS("i");
                    var results = new Dictionary<string, string>();
                    var funcs = req.GetD("p").Where(p => p.Item1 != "s" && p.Item1 != "e" && p.Item1 != "sid");

                    // ToDo: make allOk thread safe with cancellationtoken
                    async Task HandleFunc(Tuple<string, string> p)
                    {
                        var fresult = "{ \"errcode\": -1, \"errmsg\": \"Unknown error\" }";

                        try
                        {
                            switch (p.Item1)
                            {
                                case "sendcode":
                                    fresult = await SendCode(p.Item2);
                                    break;
                                case "submitcnfmcode":
                                    fresult = await ValidateConfirmationCode(p.Item2);
                                    break;
                                case "createpass":
                                    fresult = await CommitUserRegistration(p.Item2);
                                    break;
                                default:
                                    fresult = await ExecuteDbFunc(p.Item1, p.Item2, identity);
                                    break;
                            }
                        }
                        catch (Exception e)
                        {
                            var identityStr = identity == null ? "null" : $"\r\n{identity}\r\n";
                            var payloadStr = p.Item2 == null ? "null" : $"\r\n{p.Item2}\r\n";
                            var funcContext = $"\r\nName: {p.Item1}\r\nIdentity: {identityStr}\r\nArgs: {payloadStr}";

                            var fe = e as FunctionException;

                            if (fe == null) await _fw.Error(nameof(Run), $"Unhandled function exception:{funcContext}\r\n{e.UnwrapForLog()}");
                            else
                            {
                                var inner = fe.InnerException == null ? "" : $"\r\n\r\nInner Exception:\r\n{fe.InnerException.UnwrapForLog()}";

                                await _fw.Error($"DB:{p.Item1}", $"Function exception:{funcContext}\r\nResponse: {fe.Message}\r\n{fe.StackTrace}{inner}");
                            }

                            if (fe?.HaltExecution == true) allOk = false;
                        }

                        results.Add(p.Item1, fresult);
                    }

                    if (Parallelism < 2) foreach (var p in funcs) await HandleFunc(p);
                    else await funcs.ForEachAsync(Parallelism, HandleFunc);

                    if (allOk && results.Any()) result = JsonConvert.SerializeObject(results);
                    else if (allOk) result = result = Jw.Json(new { Result = "Success" });
                }
            }
            catch (Exception e)
            {
                await _fw.Error(nameof(Run), $"Unhandled exception: {e.UnwrapForLog()}\r\n{bodyForError ?? "null"}");
            }

            await WriteResponse(context, result);
        }

        private async Task<bool> HandleEdwEvents(IGenericEntity req, string requestFromPost)
        {
            var sessionInit = req.GetS("p/s");
            var eventData = req.GetS("p/e");
            var sid = req.GetS("p/s/sid") ?? req.GetS("p/sid");
            var postRs = !sessionInit.IsNullOrWhitespace();
            var postEvent = !eventData.IsNullOrWhitespace();

            if ((postRs || postEvent) && sid.IsNullOrWhitespace())
            {
                await _fw.Error(nameof(HandleEdwEvents), $"Request missing sid:\r\n{requestFromPost}");
                return false;
            }

            async Task Post()
            {
                try
                {
                    var be = new EdwBulkEvent();

                    // ToDo: Check if 'iid' exists, if not, lookup by 'iun'
                    if (postRs) be.AddRS(EdwBulkEvent.EdwType.Immediate, new Guid(sid), DateTime.UtcNow, PL.FromJsonString(sessionInit), RsConfigGuid);
                    if (postEvent) be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, new Dictionary<string, object> { { "ggsess", sid } }, null, PL.FromJsonString(eventData));

                    await _fw.EdwWriter.Write(be);
                }
                catch (Exception e)
                {
                    await _fw.Error($"{nameof(HandleEdwEvents)}().{nameof(Post)}()", $"Failed to post to edw: {e.UnwrapForLog()}\r\n\r\nBody:\r\n{requestFromPost}");
                }
            }

            // purposely fire and forget
            if (postRs || postEvent) Post();

            return true;
        }

        public async Task WriteResponse(HttpContext context, string resp)
        {
            context.Response.StatusCode = 200;
            context.Response.ContentType = "application/json";
            context.Response.ContentLength = resp.Length;
            await context.Response.WriteAsync(resp);
        }

        public async Task<string> ExecuteDbFunc(string name, string payload, string identity)
        {
            var res = await Data.CallFn(Conn, name, identity ?? Jw.Empty, payload);

            if (res == null) throw new FunctionException("Empty DB response");

            var error = res.GetS("Error");

            if (!error.IsNullOrWhitespace()) throw new FunctionException(res.GetS(""));

            return res.GetS("");
        }

        public async Task<string> SendCode(string payload)
        {
            // validate email/phone then send email/text
            // { "res": "success" } || { "errcode": 56, “errmsg”:”Improperly formatted email or phone” }

            // ToDo: Make it real
            return "{ \"res\": \"success\" }";
        }

        public async Task<string> ValidateConfirmationCode(string payload)
        {
            // maybe could work as pure db
            // {"errcode":"55","errmsg":"Code incorrect"}
            var pl = Jw.JsonToGenericEntity(payload);

            // ToDo: Make it real
            return pl.GetS("code") == "123456" ? "{ \"res\": \"success\" }" : "{ \"errcode\": \"55\", \"errmsg\": \"Code incorrect\"}";
        }

        public async Task<string> CommitUserRegistration(string payload)
        {
            // validate code,validate username, validate password, create user, if chosen exists handle exists generate one based on it
            throw new NotImplementedException();
        }

        private class FunctionException : Exception
        {
            public FunctionException(string message) : base(message) { }

            public FunctionException(string message, Exception innerException) : base(message, innerException) { }

            public bool HaltExecution { get; }
        }
    }
}
