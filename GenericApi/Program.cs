using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NLog.Web;
using Utility;
using Utility.Entity;
using Utility.Http;
using Utility.OpgAuth;

namespace GenericApi
{
    public class Program
    {
        public static FrameworkWrapper FrameworkWrapper { get; private set; }
        public static Guid RsConfigId { get; private set; }
        public static IReadOnlyDictionary<string, Entity> Lbms { get; private set; }

        public static async Task Main(string[] args)
        {
            FrameworkWrapper = await FrameworkWrapper.Create(args);
            if (Guid.TryParse(await FrameworkWrapper.StartupConfiguration.GetS("RsConfigId", null), out var rsConfigId))
            {
                RsConfigId = rsConfigId;
            }

            await HealthCheckHandler.Initialize(FrameworkWrapper);

            await Auth.Initialize(FrameworkWrapper);

            await LoadLbms();

            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) => Host.CreateDefaultBuilder(args).ConfigureWebHostDefaults(webBuilder => webBuilder.UseStartup<Startup>()).ConfigureLogging(logging => _ = logging.ClearProviders().AddDebug()).UseNLog();

        public static async Task LoadLbms()
        {
            var lbms = await FrameworkWrapper.StartupConfiguration.GetD<Entity>("LBMs");

            Lbms = lbms;
        }
    }
}
