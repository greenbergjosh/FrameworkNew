using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;
using Utility.DataLayer;
using Jw = Utility.JsonWrapper;

namespace SignalApiLib.SourceHandlers
{
    public class Wadiya : ISourceHandler
    {
        private readonly FrameworkWrapper _fw;
        private const string Conn = "Signal";
        private readonly string _logCtx = $"{nameof(ConsoleFeed)}.{nameof(HandleRequest)}";
        private readonly string _defaultFailureResponse = Jw.Serialize(new { Result = "Failure" });

        public Wadiya(FrameworkWrapper fw) => _fw = fw;

        public async Task<string> HandleRequest(string requestFromPost, HttpContext ctx)
        {
            if (requestFromPost.IsNullOrWhitespace())
            {
                await _fw.Trace(_logCtx, $"Empty body:\r\nIP: {ctx.Ip()}\r\n{ctx.UserAgent()}");
                return null;
            }

            var result = _defaultFailureResponse;

            if (Jw.TryParseObject(requestFromPost) != null)
            {
                try
                {
                    var res = await Data.CallFn(Conn, "saveWadiya", requestFromPost);

                    if (res?.GetS("result") != "success")
                    {
                        await _fw.Error(_logCtx, $"DB write failed. Response: {res?.GetS("") ?? "null"}\r\nBody: {requestFromPost}");
                        throw new Exception($"{nameof(Wadiya)} signal insert failed");
                    }
                    else result = Jw.Serialize(new { Result = "Success" });
                }
                catch (Exception ex)
                {
                    await _fw.Error(_logCtx, $@"Unhandled exception Body: {requestFromPost}\r\n{ex.UnwrapForLog()}");
                    throw new Exception($"{nameof(Wadiya)} signal insert failed");
                }
            }
            else
            {
                await _fw.Error(_logCtx, $"Invalid post body: {requestFromPost ?? "null"}");
                throw new Exception($"{nameof(Wadiya)} signal insert failed");
            }

            return result;
        }
    }
}