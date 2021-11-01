using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using SignalApiLib.SourceHandlers;
using Utility;

namespace SignalApiLib
{
    public class DataService : IGenericDataService
    {
        private FrameworkWrapper _fw;
        private Dictionary<string, ISourceHandler> _sourceHandlers;
        private Generic _genericSourceHandler;
        private readonly string _defaultFailureResponse = JsonSerializer.Serialize(new { Result = "Failure" });

        public async Task Config(FrameworkWrapper fw)
        {
            _fw = fw;
            await Reinitialize();
        }

        public async Task Reinitialize()
        {
            _genericSourceHandler = new Generic(_fw, await _fw.StartupConfiguration.GetE("Config.GenericHandlers"));
            _sourceHandlers = new Dictionary<string, ISourceHandler>
            {
                {"wadiya", new Wadiya(_fw)},
                {"console", new ConsoleFeed(_fw)}
            };
        }

        public async Task ProcessRequest(HttpContext context)
        {
            var requestFromPost = "";
            var sourceStr = context.Request.Path.Value.Trim('/').ToLower();

            if (sourceStr.StartsWith("setTrace"))
            {
                _fw.TraceLogging = sourceStr.EndsWith("true");
                await context.WriteSuccessRespAsync(JsonSerializer.Serialize(new { trace = _fw.TraceLogging }));
                return;
            }

            try
            {
                requestFromPost = await context.GetRawBodyStringAsync();

                await _fw.Trace($"{nameof(ProcessRequest)}:{sourceStr}", requestFromPost);

                var res = await HandleRequest(sourceStr, requestFromPost, context);

                if (res.IsNullOrWhitespace())
                {
                    await context.WriteFailureRespAsync(_defaultFailureResponse);
                }
                else
                {
                    await context.WriteSuccessRespAsync(res);
                }
            }
            catch (Exception ex)
            {
                await _fw.Error("Start", $@"{requestFromPost}::{ex}");
                await context.WriteFailureRespAsync(_defaultFailureResponse);
            }
        }

        private async Task<string> HandleRequest(string sourceStr, string requestFromPost, HttpContext ctx)
        {
            if (_sourceHandlers.ContainsKey(sourceStr))
            {
                return await _sourceHandlers[sourceStr.ToLower()].HandleRequest(requestFromPost, ctx);
            }

            if (await _genericSourceHandler.CanHandle(sourceStr))
            {
                return await _genericSourceHandler.HandleRequest(requestFromPost, ctx, sourceStr);
            }

            await _fw.Error(nameof(HandleRequest), $"Invalid source name {sourceStr}");

            return null;
        }

    }
}
