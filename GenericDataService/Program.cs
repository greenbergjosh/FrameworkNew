using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Utility;
using Utility.Http;

namespace GenericDataService
{
    public class Program
    {
        public static FrameworkWrapper FrameworkWrapper { get; private set; }
        public static string WwwRootPath { get; private set; }
        public static IGenericDataService DataService { get; private set; }

        public static async Task Main(string[] args)
        {
            try
            {
                FrameworkWrapper = await FrameworkWrapper.Create();

                var filePath = await FrameworkWrapper.StartupConfiguration.EvalS("DataServiceAssemblyFilePath");
                var assemblyDirs = await FrameworkWrapper.StartupConfiguration.EvalL<string>("AssemblyDirs");
                var typeName = await FrameworkWrapper.StartupConfiguration.EvalS("DataServiceTypeName");

                using (var dynamicContext = new AssemblyResolver(filePath, assemblyDirs))
                {
                    DataService = (IGenericDataService)dynamicContext.Assembly.CreateInstance(typeName);
                }

                if (DataService == null)
                {
                    throw new Exception("Failed to retrieve DataService instance. Check config entries DataServiceAssemblyFilePath and DataServiceTypeName");
                }

                await DataService.Config(FrameworkWrapper);

                WwwRootPath = await FrameworkWrapper.StartupConfiguration.EvalS("PhysicalFileProviderPath", defaultValue: null);

                await HealthCheckHandler.Initialize(FrameworkWrapper);
            }
            catch (Exception ex)
            {
                File.AppendAllText("DataService.log", $@"Config::{DateTime.Now}::{ex}{Environment.NewLine}");
                throw;
            }

            await CreateWebHostBuilder(args).Build().RunAsync();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseKestrel(options => options.Limits.MinRequestBodyDataRate = new MinDataRate(240, TimeSpan.FromSeconds(30)))
                .UseIIS()
                .UseStartup<Startup>();
    }
}
