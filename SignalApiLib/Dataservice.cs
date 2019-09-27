using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using SignalApiLib.SourceHandlers;
using Utility;
using Jw = Utility.JsonWrapper;

namespace SignalApiLib
{
    public class DataService
    {
        private FrameworkWrapper _fw;
        private Dictionary<string, ISourceHandler> _sourceHandlers;
        private SourceHandlers.Generic _genericSourceHandler;
        private readonly string _defaultFailureResponse = Jw.Serialize(new { Result = "Failure" });

        public void Config(FrameworkWrapper fw)
        {
            _fw = fw;
            _genericSourceHandler = new Generic(_fw, _fw.StartupConfiguration.GetE("Config/GenericHandlers"));
            _sourceHandlers = new Dictionary<string, ISourceHandler>
            {
                {"wadiya", new Wadiya(_fw)},
                {"console", new ConsoleFeed(_fw)}
            };
        }

        public async Task Run(HttpContext ctx)
        {
            var requestFromPost = "";
            var sourceStr = ctx.Request.Path.Value.Trim('/').ToLower();

            if (sourceStr.StartsWith("setTrace"))
            {
                _fw.TraceLogging = sourceStr.EndsWith("true");
                await ctx.WriteSuccessRespAsync(JsonWrapper.Serialize(new { trace = _fw.TraceLogging }));
                return;
            }

            try
            {
                requestFromPost = await ctx.GetRawBodyStringAsync();

                await _fw.Trace($"{nameof(Run)}:{sourceStr}", requestFromPost);

                var res = await HandleRequest(sourceStr, requestFromPost, ctx);

                if (res.IsNullOrWhitespace()) await ctx.WriteFailureRespAsync(_defaultFailureResponse);
                else await ctx.WriteSuccessRespAsync(res);
            }
            catch (Exception ex)
            {
                await _fw.Error("Start", $@"{requestFromPost}::{ex}");
                await ctx.WriteFailureRespAsync(_defaultFailureResponse);
            }
        }

        private async Task<string> HandleRequest(string sourceStr, string requestFromPost, HttpContext ctx)
        {
            if (_sourceHandlers.ContainsKey(sourceStr)) return await _sourceHandlers[sourceStr.ToLower()].HandleRequest(requestFromPost, ctx);

            if (_genericSourceHandler.CanHandle(sourceStr)) return await _genericSourceHandler.HandleRequest(requestFromPost, ctx, sourceStr);

            await _fw.Error(nameof(HandleRequest), $"Invalid source name {sourceStr}");

            return null;
        }

    }
}
