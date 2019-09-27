using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Utility;

namespace TrackingDataLib
{
    public class TrackingService
    {
        private FrameworkWrapper _framework;

        public void Config(FrameworkWrapper framework)
        {
            _framework = framework;
            Cache.Config(framework);
        }

        public async Task Run(HttpContext context)
        {
            try
            {
                var parameters = Common.GetParameters(context, _framework);

                var method = parameters.GetS("method");

                switch (method)
                {
                    case "openPixel":
                        await OpenPixel.Process(parameters, context, _framework);
                        break;
                    case "readPixel":
                        await ReadPixel.Process(parameters, context, _framework);
                        break;
                    case "click":
                        await Click.Process(parameters, context, _framework);
                        break;
                    case "action":
                        await ActionPixel.Process(parameters, context, _framework);
                        break;
                    default:
                        context.Response.StatusCode = 404;
                        await LogError($"Unknown method: [{method}] parameters: {parameters}");
                        break;
                }
            }
            catch (HttpException ex)
            {
                context.Response.StatusCode = ex.StatusCode;
#if DEBUG
                await Task.WhenAll(context.Response.WriteAsync(ex.Message), LogError(ex.Message));
#else
                await LogError(ex.Message);
                await Common.DropPixel();
#endif
            }
        }

        public async Task LogError(string message) => await _framework.Error("Run", message);
    }
}
