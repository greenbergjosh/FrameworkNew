using System;
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
                JArray payload;
                Task consoleTask;

                if (token is JObject)
                {
                    payload = new JArray { token };
                    consoleTask = PostToConsole((JObject)token);
                }
                else if (token is JArray)
                {
                    payload = (JArray)token;
                    consoleTask = PostToConsole(payload);
                }
                else
                {
                    await _fw.Error(_logCtx, $"Invalid payload {token}");
                    return null;
                }

                var localDbTask = SqlWrapper.SqlToGenericEntity("Fluent", "SaveData", "", payload.ToString());

                await Task.WhenAll(localDbTask, consoleTask);

                if (localDbTask.Result.GetS("Result") == "Success") { return localDbTask.Result.GetS(""); }

                await _fw.Error(_logCtx, $"DB failure. Response: {localDbTask.Result.GetS("")}");
            }
            else await _fw.Error(_logCtx, $"Invalid json body: {requestFromPost}");

            return null;
        }

        private async Task PostToConsole(JObject payload)
        {
            var email = payload["em"]?.ToString();

            if (email.IsNullOrWhitespace()) return;

            try
            {
                await ProtocolClient.HttpPostAsync(ConsoleUrl,
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
                    }), "application/json");
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
                await payload.AsJEnumerable().Select(p=>(JObject)p).ForEachAsync(3, PostToConsole);
            }
            catch (Exception e)
            {
                await _fw.Error($"{_logCtx}.{nameof(PostToConsole)}[]", $"Failed to post {payload} to Console: {e.UnwrapForLog()}");
            }
        }

    }
}
