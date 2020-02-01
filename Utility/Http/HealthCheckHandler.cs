﻿using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Utility.Http
{
    public static class HealthCheckHandler
    {
        public static ScriptDescriptor _healthCheckHandler;

        public static async Task Initialize(FrameworkWrapper fw)
        {
            if (Guid.TryParse(fw.StartupConfiguration.GetS("/HealthCheckHandler"), out var healthCheckLbmId))
            {
                var lbm = await fw.Entities.GetEntity(healthCheckLbmId);
                var code = lbm.GetS("Config");

                var sd = fw.RoslynWrapper.CompileAndCache(new ScriptDescriptor(healthCheckLbmId.ToString(), code));
                _healthCheckHandler = sd;
            }
        }

        public static async Task<bool> Handle(HttpContext context, FrameworkWrapper fw)
        {
            // AWS passes a user-agent that has HealthChecker in it so let's check for that explicitly in case we forget
            // to configure the AWS TargetGroup to pass "?m=HealthCheck" when running a health check.
            if (context.Request.Query["m"] == "HealthCheck" || context.UserAgent().Contains("HealthChecker"))
            {
                if (_healthCheckHandler != null)
                {
                    return (bool)await fw.RoslynWrapper[_healthCheckHandler.Id.Value](new { context, fw }, new StateWrapper());
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