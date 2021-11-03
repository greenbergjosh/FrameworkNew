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
        public static Dictionary<string, Entity> Lbms { get; private set; }

        public static async Task Main(string[] args)
        {
            FrameworkWrapper = await FrameworkWrapper.Create(args);
            if (Guid.TryParse(await FrameworkWrapper.StartupConfiguration.GetS("Config.RsConfigId"), out var rsConfigId))
            {
                RsConfigId = rsConfigId;
            }

            await HealthCheckHandler.Initialize(FrameworkWrapper);

            await Auth.Initialize(FrameworkWrapper);

            await LoadLbms();

            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder => webBuilder.UseStartup<Startup>()).ConfigureLogging(logging => _ = logging.ClearProviders().AddDebug()).UseNLog();

        public static async Task LoadLbms()
        {
            var lbms = new Dictionary<string, Entity>();

            foreach (var (name, config) in await FrameworkWrapper.StartupConfiguration.GetD<Entity>("Config.LBMs"))
            {
                var id = Guid.Parse(await config.GetS("id"));

                var lbm = await FrameworkWrapper.Entities.GetEntity(id);
                if (lbm == null)
                {
                    throw new InvalidOperationException($"No LBM with Id: {id}");
                }

                if (await lbm.GetS("Type") != "LBM.CS")
                {
                    throw new InvalidOperationException($"Only entities of type LBM.CS are supported, LBM {id} has type {await lbm.GetS("Type")}");
                }

                var (debug, debugDir) = FrameworkWrapper.RoslynWrapper.GetDefaultDebugValues();
                _ = FrameworkWrapper.RoslynWrapper.CompileAndCache(new ScriptDescriptor(id, id.ToString(), await lbm.GetS("Config"), debug, debugDir), true);

                lbms.Add(name, config);
            }

            Lbms = lbms;
        }
    }
}
