using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;
using Jw = Utility.JsonWrapper;

namespace SignalApiLib
{
    public class DataService
    {
        private FrameworkWrapper _fw;
        private Dictionary<string,ISourceHandler> _sourceHandlers;

        public void Config(FrameworkWrapper fw)
        {
            _fw = fw;
            _sourceHandlers = new Dictionary<string, ISourceHandler>
            {
                {"fluent", new Fluent(_fw)}
            };
        }

        public async Task Run(HttpContext ctx)
        {
            var requestFromPost = "";
            var result = Jw.Json(new { Error = "SeeLogs" });
            var sourceStr = ctx.Request.Path.Value.Trim('/').ToLower();

            try
            {
                requestFromPost = await ctx.GetRawBodyStringAsync();
                var res = await HandleRequest(sourceStr, requestFromPost, ctx);

                if (!res.IsNullOrWhitespace()) result = res;
            }
            catch (Exception ex)
            {
                await _fw.Error("Start", $@"{requestFromPost}::{ex}");
            }

            await ctx.WriteSuccessRespAsync(result);
        }

        private async Task<string> HandleRequest(string sourceStr, string requestFromPost, HttpContext ctx)
        {
            if (_sourceHandlers.ContainsKey(sourceStr)) return await _sourceHandlers[sourceStr].HandleRequest(requestFromPost, ctx);

            await _fw.Error(nameof(HandleRequest), $"Invalid source name {sourceStr}");

            return null;
        }
        
    }
}
