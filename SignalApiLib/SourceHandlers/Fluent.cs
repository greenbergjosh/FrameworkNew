using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;

namespace SignalApiLib.SourceHandlers
{
    public class Fluent : ISourceHandler
    {
        private readonly FrameworkWrapper _fw;
        private const string Key = "498937C1-6FCA-45B6-9C86-49D4999BB5C7";
        private const string ConsoleUrl = "https://forms.direct-market.com/PostExtra/pe";
        private readonly string _logCtx = $"{nameof(Fluent)}.{nameof(HandleRequest)}";
        private readonly IEnumerable<ExportProviders.IPostingQueueProvider> _postingQueueExports = new[]
        {
            new ExportProviders.Console()
        };

        public Fluent(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public async Task<string> HandleRequest(string requestFromPost, HttpContext ctx)
        {
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
                        await _fw.Error(_logCtx, $"Invalid items in array:\r\n\r\nBad items:\r\n{bad.Select(p => p.orig.ToString()).Join("\r\n")}\r\n\r\nFull payload:\r\n{token}");
                    }

                    payloads = original.Where(p => p.jobj != null).Select(p => Mutate(p.jobj)).ToArray();
                }
                else
                {
                    await _fw.Error(_logCtx, $"Invalid payload {token}");
                    return null;
                }

                if (payloads.Any())
                {
                    var dbp = JsonConvert.SerializeObject(payloads);
                    var localDbTask = Data.CallFn("Fluent", "SaveData", payload: dbp);
                    var pqTask = PostToQueue(payloads);

                    await Task.WhenAll(localDbTask, pqTask);

                    if (localDbTask.Result.GetS("Result") == "Success")
                    {
                        try
                        {
                            var res = await Data.CallFn("Signal", "fluentLead", payload: dbp);

                            if(res?.GetS("Result") != "Success") await _fw.Error(_logCtx, $"PG double write failed. Response: {res?.GetS("") ?? "null"}");
                        }
                        catch (Exception e)
                        {
                            await _fw.Error(_logCtx, $"PG double write failed. {e.UnwrapForLog()}");
                        }

                        return localDbTask.Result.GetS("");
                    }

                    await _fw.Error(_logCtx, $"DB failure. Response: {localDbTask.Result.GetS("")}");
                }
            }
            else await _fw.Error(_logCtx, $"Invalid json body: {requestFromPost}");

            return null;
        }

        // ToDo: move to config
        private Dictionary<string, string[]> mutations = new Dictionary<string, string[]>
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
