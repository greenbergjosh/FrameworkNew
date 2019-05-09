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
        private const string MsConn = "OnPointConsole";
        private const string PgConn = "Signal";
        private readonly string _logCtx = $"{nameof(Fluent)}.{nameof(HandleRequest)}";

        public ConsoleFeed(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public async Task<string> HandleRequest(string requestFromPost, HttpContext ctx)
        {
            var result = Jw.Json(new { Error = "SeeLogs" });

            if (Jw.TryParseObject(requestFromPost) == null)
            {
                await _fw.Error(_logCtx, $"Invalid post body: {requestFromPost ?? "null"}");
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
            var result = Jw.ToGenericEntity(new { Result = "Failure" });

            try
            {
                result = await Data.CallFn(MsConn, "SaveLiveFeed", payload: request);

                // This is temporary double write
                var res = await Data.CallFn(PgConn, "consoleLiveFeed", payload: request);

                if (res?.GetS("Result") != "Success") await _fw.Error($"{_logCtx}.{nameof(SaveLiveFeed)}", $"PG double write failed. Response: {res?.GetS("") ?? "null"}\r\nBody: {request}");
            }
            catch (Exception ex)
            {
                await _fw.Error($"{_logCtx}.{nameof(SaveLiveFeed)}", $@"{ex}\r\nBody: {request}");
            }

            return result.GetS("");
        }

        public async Task<string> SaveEmailEvent(string request)
        {
            var result = Jw.ToGenericEntity(new { Result = "Failure" });

            try
            {
                result = await Data.CallFn(MsConn, "SaveEmailEvent", payload: request);

                // This is temporary double write
                var res = await Data.CallFn(PgConn, "consoleEvent", payload: request);

                if (res?.GetS("Result") != "Success") await _fw.Error($"{_logCtx}.{nameof(SaveLiveFeed)}", $"PG double write failed. Response: {res?.GetS("") ?? "null"}\r\nBody: {request}");
            }
            catch (Exception ex)
            {
                await _fw.Error($"{_logCtx}.{nameof(SaveLiveFeed)}", $@"{ex}\r\nBody: {request}");
            }

            return result.GetS("");
        }
    }
}