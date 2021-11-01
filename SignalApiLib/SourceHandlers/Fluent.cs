using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;
using Utility.DataLayer;
using Utility.Entity;

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

        private Fluent(FrameworkWrapper fw, string traceLogRootPath)
        {
            _fw = fw;
            _traceLogRootPath = traceLogRootPath;
            _traceLog = _traceLogRootPath != null;
        }

        public static async Task<Fluent> Create(FrameworkWrapper fw)
        {
            var traceLogRootPath = await fw.StartupConfiguration.GetS("Config.TraceLog");
            return new Fluent(fw, traceLogRootPath);
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
            var body = await _fw.Entity.Parse("application/json", requestFromPost);

            if (body.IsObject)
            {
                if (await body.GetS("k") != Key)
                {
                    return null;
                }

                var token = await body.GetE("p");

                IEnumerable<SourceData> payloads;

                if (token.IsObject)
                {
                    payloads = new[] { await Mutate(token) };
                }
                else if (token.IsArray)
                {
                    var mutations = (await token.GetL<Entity>("@")).Select(async p => await Mutate(p));
                    await Task.WhenAll(mutations);
                    payloads = mutations.Select(m => m.Result);
                }
                else
                {
                    await _fw.Error(LogCtx, $"Invalid payload {token}");
                    return null;
                }

                if (payloads.Any())
                {
                    var dbp = JsonSerializer.Serialize(payloads);
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

                                    if (await res.GetS("Result") != "Success")
                                    {
                                        await _fw.Error(LogCtx, $"MSSql write failed. Response: {res}");
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

                                    if (await res.GetS("Result") != "Success")
                                    {
                                        await _fw.Error(LogCtx, $"PG write failed. Response: {res}");
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

                    return JsonSerializer.Serialize(new { Result = success ? "Success" : "Failure" });
                }
            }
            else
            {
                await _fw.Error(LogCtx, $"Invalid json body: {requestFromPost}");
            }

            return null;
        }

        // ToDo: move to config
        private readonly Dictionary<string, string[]> mutations = new()
        {
            { "fn", new[] { "FirstName", "Firstname" } },
            { "ln", new[] { "LastName", "Lastname" } },
            { "su", new[] { "OptInURL" } },
            { "ip", new[] { "LeadIPAddress" } },
            { "daq", new[] { "LeadDate" } },
            { "zip", new[] { "PostalZipCode" } },
            { "dob", new[] { "BirthDate" } },
            { "g", new[] { "GenderID", "GenderId" } }
        };

        private Task<SourceData> Mutate(Entity s) => SourceData.Create(s, mutations);

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