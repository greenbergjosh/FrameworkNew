using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;
using Jw = Utility.JsonWrapper;

namespace SignalApiLib.SourceHandlers
{
    public class Fluent : ISourceHandler
    {
        private readonly FrameworkWrapper _fw;
        private const string MsConn = "Fluent";
        private const string PgConn = "Signal";
        private const string Key = "498937C1-6FCA-45B6-9C86-49D4999BB5C7";
        private static readonly string LogCtx = $"{nameof(Fluent)}.{nameof(HandleRequest)}";
        private readonly string _traceLogRootPath;
        private readonly bool _traceLog = false;
        // ToDo: abstract and move to config
        private readonly IEnumerable<ExportProviders.IPostingQueueProvider> _postingQueueExports = new[]
        {
            new ExportProviders.Console()
        };

        public Fluent(FrameworkWrapper fw)
        {
            _fw = fw;
            _traceLogRootPath = _fw.StartupConfiguration.GetS("Config/TraceLog");
            _traceLog = _traceLogRootPath != null;
        }

        private void LogRequest(string req)
        {
            if (_traceLog && Directory.Exists(_traceLogRootPath))
            {
                var now = DateTime.Now;

                FileSystem.WriteLineToFileThreadSafe(Path.Combine(_traceLogRootPath, $"{now:yyyy.MM.dd.HH}.fluentTrace.log"), $"{now:yyyy-MM-dd HH:mm:ss.fffffff}\t\t{req}");
            }
        }

        public async Task<string> HandleRequest(string requestFromPost, HttpContext ctx)
        {
            LogRequest(requestFromPost);
            var body = JsonConvert.DeserializeObject(requestFromPost);

            if (body is JObject b)
            {
                if (b["k"].ToString() != Key) return null;

                var token = b["p"];
                IEnumerable<SourceData> payloads;

                if (token is JObject jobj) payloads = new[] { Mutate(jobj) };
                else if (token is JArray)
                {
                    var original = ((JArray)token).Select(p => new { orig = p, jobj = p as JObject }).ToArray();
                    var bad = original.Where(p => p.jobj == null).ToArray();

                    if (bad.Any())
                    {
                        await _fw.Error(LogCtx, $"Invalid items in array:\r\n\r\nBad items:\r\n{bad.Select(p => p.orig.ToString()).Join("\r\n")}\r\n\r\nFull payload:\r\n{token}");
                    }

                    payloads = original.Where(p => p.jobj != null).Select(p => Mutate(p.jobj)).ToArray();
                }
                else
                {
                    await _fw.Error(LogCtx, $"Invalid payload {token}");
                    return null;
                }

                if (payloads.Any())
                {
                    var dbp = JsonConvert.SerializeObject(payloads);
                    var success = true;

                    try
                    {
                        var tasks = new[]
                        {
                            Task.Run(async () =>
                            {
                                try
                                {
                                    var res = await Data.CallFn(MsConn, "SaveData", payload: dbp);

                                    if (res.GetS("Result") != "Success")
                                    {
                                        await _fw.Error(LogCtx, $"MSSql write failed. Response: {res.GetS("")}");
                                        success = false;
                                    }
                                }
                                catch (Exception e)
                                {
                                    await _fw.Error(LogCtx, $@"MSSql write failed {e.UnwrapForLog()}\r\nBody: {dbp}");
                                    success = false;
                                }
                            }),
                            Task.Run(async () =>
                            {
                                try
                                {
                                    var res = await Data.CallFn(PgConn, "fluentLead", payload: dbp);

                                    if (res.GetS("Result") != "Success")
                                    {
                                        await _fw.Error(LogCtx, $"PG write failed. Response: {res.GetS("")}");
                                        success = false;
                                    }
                                }
                                catch (Exception e)
                                {
                                    await _fw.Error(LogCtx, $@"PG write failed {e.UnwrapForLog()}\r\nBody: {dbp}");
                                    success = false;
                                }
                            }),
                            PostToQueue(payloads)
                        };

                        await Task.WhenAll(tasks);
                    }
                    catch (Exception e)
                    {
                        await _fw.Error(LogCtx, $@"Tasks failed. {e.UnwrapForLog()}\r\nBody: {requestFromPost}");
                        success = false;
                    }

                    return Jw.Serialize(new { Result = success ? "Success" : "Failure" });
                }
            }
            else await _fw.Error(LogCtx, $"Invalid json body: {requestFromPost}");

            return null;
        }

        // ToDo: move to config
        private readonly Dictionary<string, string[]> mutations = new Dictionary<string, string[]>
        {
            {"fn", new[]{"FirstName","Firstname"} },
            {"ln", new[]{ "LastName", "Lastname" } },
            {"su", new[]{ "OptInURL" } },
            {"ip", new[]{ "LeadIPAddress"} },
            {"daq", new[]{ "LeadDate" } },
            {"zip", new[]{ "PostalZipCode" } },
            {"dob", new[]{ "BirthDate" } },
            {"g", new[]{ "GenderID", "GenderId" } }
        };

        private SourceData Mutate(JObject s) => new SourceData(s, mutations);

        private async Task PostToQueue(IEnumerable<SourceData> payloads)
        {
            var posts = _postingQueueExports.SelectMany(p => payloads, (p, d) => p.GetPostingQueueData("fluent", d)).Where(qd => qd != null).ToArray();

            if (posts.Any())
            {
                var res = await _fw.PostingQueueWriter.Write(posts);
            }
        }

    }
}
