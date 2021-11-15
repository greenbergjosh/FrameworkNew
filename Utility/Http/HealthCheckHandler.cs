using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Utility.Http
{
    public static class HealthCheckHandler
    {
        private static Guid _healthCheckHandlerLbmId;

        public static async Task Initialize(FrameworkWrapper fw)
        {
            if (Guid.TryParse(await fw.StartupConfiguration.GetS("HealthCheckHandler", null), out var healthCheckHandlerLbmId))
            {
                _healthCheckHandlerLbmId = healthCheckHandlerLbmId;
            }
        }

        public static async Task<bool> Handle(HttpContext context, FrameworkWrapper fw)
        {
            // AWS passes a user-agent that has HealthChecker in it so let's check for that explicitly in case we forget
            // to configure the AWS TargetGroup to pass "?m=HealthCheck" when running a health check.
            if (context.Request.Query["m"] == "HealthCheck" || context.UserAgent().Contains("HealthChecker"))
            {
                if (_healthCheckHandlerLbmId != default)
                {
                    var result = await fw.EvaluateEntity<Entity.Entity>(_healthCheckHandlerLbmId, fw.Entity.Create(new { context, fw }));
                    return result.Value<bool>();
                }
                else
                {
                    context.Response.StatusCode = 200;
                    await context.Response.WriteAsync("OK");
                    return true;
                }
            }

            return false;
        }
    }
}
