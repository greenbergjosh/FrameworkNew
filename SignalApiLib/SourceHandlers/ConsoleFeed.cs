using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;
using Utility.DataLayer;
using Jw = Utility.JsonWrapper;

namespace SignalApiLib.SourceHandlers
{
    public class ConsoleFeed : ISourceHandler
    {
        private readonly FrameworkWrapper _fw;
        private const string Conn = "Signal";
        private readonly string _logCtx = $"{nameof(ConsoleFeed)}.{nameof(HandleRequest)}";
        private readonly string _defaultFailureResponse = Jw.Serialize(new { Result = "Failure" });

        public ConsoleFeed(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public async Task<string> HandleRequest(string requestFromPost, HttpContext ctx)
        {
            var result = Jw.Json(new { Error = "SeeLogs" });

            requestFromPost = requestFromPost.Replace("\u0000", "");

            if (Jw.TryParseObject(requestFromPost) == null)
            {
                var body = requestFromPost ?? "<null>";
                if (string.IsNullOrWhiteSpace(body))
                {
                    body = "<empty>";
                }

                await _fw.Error(_logCtx, $"Invalid post body: {body} queryString: {ctx.Request.QueryString.Value}");
                return result;
            }

            string m = ctx.Request.Query["m"];

            try
            {
                switch (m)
                {
                    case "OnPointConsoleLiveFeed":
                        result = await SaveLiveFeed(requestFromPost);
                        break;
                    case "OnPointConsoleLiveEmailEvent":
                        result = await SaveEmailEvent(requestFromPost);
                        break;
                    default:
                        await _fw.Error(_logCtx, $"Unknown request: Method: {m ?? "null"}\r\nBody: {requestFromPost}");
                        break;
                }
            }
            catch (Exception ex)
            {
                await _fw.Error(_logCtx, $@"Method: {m}\r\nBody: {requestFromPost}\r\n{ex.UnwrapForLog()}");
            }

            return result;
        }

        public async Task<string> SaveLiveFeed(string request)
        {
            var result = _defaultFailureResponse;

            try
            {
                var res = await Data.CallFn(Conn, "consoleLiveFeed", payload: request);

                if (res?.GetS("Result") != "Success") await _fw.Error($"{_logCtx}.{nameof(SaveLiveFeed)}", $"DB write failed. Response: {res?.GetS("") ?? "null"}\r\nBody: {request}");
                else result = Jw.Serialize(new { Result = "Success" });
            }
            catch (Exception e)
            {
                await _fw.Error($"{_logCtx}.{nameof(SaveLiveFeed)}", $@"DB write failed {e.UnwrapForLog()}\r\nBody: {request}");
            }

            return result;
        }

        public async Task<string> SaveEmailEvent(string request)
        {
            var result = _defaultFailureResponse;

            try
            {
                var res = await Data.CallFn(Conn, "consoleEvent", payload: request);

                if (res?.GetS("Result") != "Success") await _fw.Error($"{_logCtx}.{nameof(SaveEmailEvent)}", $"DB write failed. Response: {res?.GetS("") ?? "null"}\r\nBody: {request}");
                else result = Jw.Serialize(new { Result = "Success" });
            }
            catch (Exception e)
            {
                await _fw.Error($"{_logCtx}.{nameof(SaveEmailEvent)}", $@"DB write failed {e.UnwrapForLog()}\r\nBody: {request}");
            }

            return result;
        }
    }
}