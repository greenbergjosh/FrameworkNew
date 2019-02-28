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
            var requestFromPost = "";
            var result = Jw.Json(new { Error = "SeeLogs" });

            try
            {
                requestFromPost = await context.GetRawBodyStringAsync();

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
                                    // validate email/phone then send email/text
                                    // { "res": "success" } || { "errcode": 56, “errmsg”:”Improperly formatted email or phone” }
                                    break;
                                case "submitcnfmcode":
                                    // maybe could work as pure db
                                    // {"errcode":"55","errmsg":"Code incorrect"}
                                    break;
                                case "createpass":
                                    // validate code,validate username, validate password, create user, if chosen exists handle exists generate one based on it
                                    break;
                                default:
                                    var res = await Data.CallFn(Conn, p.Item1, identity, p.Item2);

                                    if (res == null) await _fw.Error(p.Item1, "Empty DB response");
                                    else
                                    {
                                        var error = res.GetS("Error");

                                        if (!error.IsNullOrWhitespace())
                                        {
                                            await _fw.Error(p.Item1, $"DB Error: {res.GetS("")}");
                                            allOk = false;
                                            break;
                                        }
                                    }

                                    fresult = res.GetS("");
                                    break;
                            }
                        }
                        catch (Exception e)
                        {
                            await _fw.Error(nameof(Run), $"Unhandled function exception: {e.UnwrapForLog()}");
                        }

                        results.Add(p.Item1, fresult);
                    }

                    if (Parallelism < 2) foreach (var p in funcs) await HandleFunc(p);
                    else await funcs.ForEachAsync(Parallelism, HandleFunc);

                    if (allOk && results.Any()) result = JsonConvert.SerializeObject(results);
                    else if (allOk) result = result = Jw.Json(new { Result = "Success" });
                }
            }
            catch (Exception ex)
            {
                await _fw.Error(nameof(Run), $"{requestFromPost}: {ex.UnwrapForLog()}");
            }

            await WriteResponse(context, result);
        }

        private async Task<bool> HandleEdwEvents(IGenericEntity req, string requestFromPost)
        {
            var sessionInit = req.GetS("p/s");
            var eventData = req.GetS("p/e");
            var sid = req.GetS("p/sid");
            EdwBulkEvent be = null;

            if (!sessionInit.IsNullOrWhitespace())
            {
                be = new EdwBulkEvent();
                sid = req.GetS("p/s/sid");

                if (!sid.IsNullOrWhitespace())
                {
                    be.AddRS(EdwBulkEvent.EdwType.Immediate, new Guid(sid), DateTime.UtcNow, PL.FromJsonString(sessionInit), RsConfigGuid);
                }
                else
                {
                    await _fw.Error(nameof(HandleEdwEvents), $"EDW session init missing sid: {requestFromPost}");
                    return false;
                }
            }

            if (!eventData.IsNullOrWhitespace())
            {
                if (!sid.IsNullOrWhitespace())
                {
                    if (be == null) be = new EdwBulkEvent();

                    be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, new Dictionary<string, object> { { "ggsess", sid } }, null, PL.FromJsonString(eventData));
                }
                else
                {
                    await _fw.Error(nameof(HandleEdwEvents), $"Request missing sid: {requestFromPost}");
                    return false;
                }
            }

            // purposely fire and forget
            if (be != null) _fw.EdwWriter.Write(be);

            return true;
        }

        public async Task WriteResponse(HttpContext context, string resp)
        {
            context.Response.StatusCode = 200;
            context.Response.ContentType = "application/json";
            context.Response.ContentLength = resp.Length;
            await context.Response.WriteAsync(resp);
        }

    }
}
