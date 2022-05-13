using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NLog.Web;
using Utility;
using Utility.Entity;
using Utility.OpgAuth;

namespace GenericApi
{
    public class Program
    {
        public static FrameworkWrapper FrameworkWrapper { get; private set; }
        public static Guid RsConfigId { get; private set; }
        public static Dictionary<string, Entity> Lbms { get; private set; }
        public static string InstanceName { get; private set; }
        public static (string handlerName, Guid handlerEntityId, Entity handlerParameters)[] RequestHandlers { get; private set; }

        public static async Task Main(string[] args)
        {
            FrameworkWrapper = await FrameworkWrapper.Create(commandLineArgs: args);
            if (Guid.TryParse(await FrameworkWrapper.StartupConfiguration.EvalS("RsConfigId", defaultValue: null), out var rsConfigId))
            {
                RsConfigId = rsConfigId;
            }

            await LoadHandlers();

            await Auth.Initialize(FrameworkWrapper);

            await LoadLbms();

            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) => Host.CreateDefaultBuilder(args).ConfigureWebHostDefaults(webBuilder => webBuilder.UseStartup<Startup>()).ConfigureLogging(logging => _ = logging.ClearProviders().AddDebug()).UseNLog();

        private static async Task LoadHandlers()
        {
            var requestHandlers = new List<(string handlerName, Guid handlerEntityId, Entity handlerParameters)>();

            await foreach (var config in FrameworkWrapper.StartupConfiguration.EvalL("RequestHandlers"))
            {
                var name = await config.EvalS("name");

                var handleRequestEntityId = await config.EvalGuid("handleRequest.entityId");
                var handleRequestParameters = await config.EvalE("handleRequest.parameters");

                var initializeEntityId = await config.EvalGuid("initialize.entityId", defaultValue: null);
                if (initializeEntityId != null)
                {
                    _ = await FrameworkWrapper.EvaluateEntity(initializeEntityId.Value, config.Create(new
                    {
                        handlerName = name,
                        handlerParameters = await config.EvalE("initialize.parameters")
                    }));
                }

                requestHandlers.Add((name, handleRequestEntityId, handleRequestParameters));
            }

            RequestHandlers = requestHandlers.ToArray();
        }

        public static async Task LoadLbms()
        {
            var lbms = await FrameworkWrapper.StartupConfiguration.EvalD("LBMs");

            Lbms = lbms;
        }
    }
}
