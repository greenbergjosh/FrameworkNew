using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Utility;

namespace SignalApiLib
{
    public class Fluent
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

                    payloads = original.Where(p => p.jobj != null).Select(p => Mutate(p.jobj));
                }
                else
                {
                    await _fw.Error(_logCtx, $"Invalid payload {token}");
                    return null;
                }

                payloads = payloads.Where(p => p.em?.Contains("@") == true).ToArray();

                if (payloads.Any())
                {
                    var localDbTask = _fw.Data.ExecuteMethod("Fluent", "SaveData", "", JsonConvert.SerializeObject(payloads));
                    var pqTask = PostToQueue(payloads);

                    await Task.WhenAll(localDbTask, pqTask);

                    if (localDbTask.Result.GetS("Result") == "Success")
                    {
                        return localDbTask.Result.GetS("");
                    }

                    await _fw.Error(_logCtx, $"DB failure. Response: {localDbTask.Result.GetS("")}");
                }
            }
            else await _fw.Error(_logCtx, $"Invalid json body: {requestFromPost}");

            return null;
        }

        private SourceData Mutate(JObject s) => new SourceData { em = s["em"].ToString(), src = "fluent"};

        private async Task PostToQueue(IEnumerable<SourceData> payloads)
        {
            var posts = _postingQueueExports.SelectMany(p => payloads, (p, d) => p.GetPostingQueueData(d)).Where(qd => qd != null).ToArray();

            if (posts.Any())
            {
                var now = DateTime.Now;
                var entries = posts.Select(p => new PostingQueueEntry(p.Key, now, p.Payload));

                var res = await _fw.PostingQueueWriter.Write(entries);
            }
        }

        private async Task PostToConsole(JObject payload)
        {
            var email = payload["em"]?.ToString();

            if (email.IsNullOrWhitespace()) return;
            string res = null;

            try
            {
                res = await ProtocolClient.HttpPostAsync(ConsoleUrl,
                    JsonConvert.SerializeObject(new
                    {
                        header = new { svc = 1, p = -1 },
                        body = new
                        {
                            domain_id = "1d6b7dd9-6d97-44b8-a795-9d0e5e72a01f",
                            domain = "fluent feed",
                            isFinal = true,
                            //url = null,
                            //phone_home = null,
                            email
                        }
                    }), "application/json", 15);
            }
            catch (Exception e)
            {
                await _fw.Error($"{_logCtx}.{nameof(PostToConsole)}", $"Failed to post {payload} to Console: {e.UnwrapForLog()}");
            }
        }

        private async Task PostToConsole(JArray payload)
        {
            try
            {
                await payload.AsJEnumerable().Select(p => p as JObject).Where(p => p != null).ForEachAsync(5, PostToConsole);
            }
            catch (Exception e)
            {
                await _fw.Error($"{_logCtx}.{nameof(PostToConsole)}[]", $"Failed to post {payload} to Console: {e.UnwrapForLog()}");
            }
        }

    }
}
