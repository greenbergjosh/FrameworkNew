using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Utility;

namespace TrackingDataLib
{
    public class TrackingService
    {
        private FrameworkWrapper _framework;

        public void Config(FrameworkWrapper framework) => _framework = framework;

        public Task Run(HttpContext context)
        {
            var method = context.Request.Query["m"];

            try
            {
                switch (method)
                {
                    case "openPixel":
                        return OpenPixel.Process(context, _framework);
                    case "readPixel":
                        return ReadPixel.Process(context, _framework);
                    case "click":
                        return Click.Process(context, _framework);
                    case "action":
                        return ActionPixel.Process(context, _framework);
                    default:
                        context.Response.StatusCode = 404;
                        return LogError($"Unknown method: [{method}] queryString: [{context.Request.QueryString}]");
                }
            }
            catch (HttpException ex)
            {
                context.Response.StatusCode = ex.StatusCode;
                return Task.WhenAll(context.Response.WriteAsync(ex.Message), LogError(ex.Message));
            }
        }

        public async Task LogError(string message) => await _framework.Error("Run", message);
    }
}
