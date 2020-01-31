using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace SignalApiLib.SourceHandlers
{
    public class Generic : ISourceHandler
    {
        private readonly FrameworkWrapper _fw;
        private readonly IGenericEntity _cfg;
        private const string Conn = "Signal";
        
        public Generic(FrameworkWrapper fw, IGenericEntity cfg)
        {
            _fw = fw;
            _cfg = cfg;
        }

        public bool CanHandle(string sourceStr)
        {
            return !sourceStr.IsNullOrWhitespace() && !_cfg.GetS(sourceStr.ToLower()).IsNullOrWhitespace();
        }

        public Task<string> HandleRequest(string requestFromPost, HttpContext ctx)
        {
            throw new NotImplementedException();
        }

        public async Task<string> HandleRequest(string requestFromPost, HttpContext ctx, string sourceStr)
        {
            sourceStr = sourceStr.ToLower();
            var cfg = _cfg.GetE(sourceStr);
            
            if (cfg == null)
            {
                await _fw.Error($"{sourceStr}.{nameof(HandleRequest)}", $"Config not found for {sourceStr}");
                throw new Exception("Could not process request");
            }

            var func = cfg.GetS("func");

            try
            {
                var res = await Data.CallFn(Conn, func, requestFromPost);

                if (res?.GetS("result") != "success") await _fw.Error($"{sourceStr}.{nameof(HandleRequest)}", $"DB write failed. Response: {res?.GetS("") ?? "null"}\r\nBody: {requestFromPost}");

                return Jw.Serialize(new { Result = "Success" });
            }
            catch (Exception e)
            {
                await _fw.Error($"{sourceStr}.{nameof(HandleRequest)}", $@"DB write failed {e.UnwrapForLog()}\r\nBody: {requestFromPost}");
                throw new Exception("Could not process request");
            }
        }

    }
}
