using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;
using Utility.DataLayer;
using Utility.Entity;

namespace SignalApiLib.SourceHandlers
{
    public class Generic : ISourceHandler
    {
        private readonly FrameworkWrapper _fw;
        private readonly Entity _cfg;
        private const string Conn = "Signal";

        public Generic(FrameworkWrapper fw, Entity cfg)
        {
            _fw = fw;
            _cfg = cfg;
        }

        public async Task<bool> CanHandle(string sourceStr) => !sourceStr.IsNullOrWhitespace() && (await _cfg.Get(sourceStr.ToLower())).Any();

        public Task<string> HandleRequest(string requestFromPost, HttpContext ctx) => throw new NotImplementedException();

        public async Task<string> HandleRequest(string requestFromPost, HttpContext ctx, string sourceStr)
        {
            sourceStr = sourceStr.ToLower();
            var cfg = (await _cfg.Get(sourceStr)).FirstOrDefault();

            if (cfg == null)
            {
                await _fw.Error($"{sourceStr}.{nameof(HandleRequest)}", $"Config not found for {sourceStr}");
                throw new Exception("Could not process request");
            }

            var func = await cfg.GetS("func");

            try
            {
                var res = await Data.CallFn(Conn, func, requestFromPost);

                if (await res?.GetS("result", null) != "success")
                {
                    await _fw.Error($"{sourceStr}.{nameof(HandleRequest)}", $"DB write failed. Response: {res}\r\nBody: {requestFromPost}");
                }

                return JsonSerializer.Serialize(new { Result = "Success" });
            }
            catch (Exception e)
            {
                await _fw.Error($"{sourceStr}.{nameof(HandleRequest)}", $@"DB write failed {e.UnwrapForLog()}\r\nBody: {requestFromPost}");
                throw new Exception("Could not process request");
            }
        }
    }
}
