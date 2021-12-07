using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.WindowsServices;
using Utility;
using Utility.Http;

namespace GenericWindowsService
{
    internal class Program
    {
        public static string LogPath { get; } = "GenericWindowsService.log";
        public static FrameworkWrapper Fw { get; private set; }
        public static IGenericWindowsService Service { get; private set; }
        public static string WwwRootPath { get; private set; }

        private static async Task Main(string[] args)
        {
            Directory.SetCurrentDirectory(AppDomain.CurrentDomain.BaseDirectory);

            Fw = await LoadFramework(args);

            await HealthCheckHandler.Initialize(Fw);

            if (args.Contains("console") || Debugger.IsAttached)
            {
                await (await ValidateAndConfigureService(args)).Build().RunAsync();
            }
            else
            {
                var svc = await ValidateAndConfigureService(args);

                File.AppendAllText(LogPath, $@"{nameof(ValidateAndConfigureService)}::{DateTime.Now}::Building Host{Environment.NewLine}");

                var wh = svc.Build();

                File.AppendAllText(LogPath, $@"{nameof(ValidateAndConfigureService)}::{DateTime.Now}::Running Host{Environment.NewLine}");

                if (OperatingSystem.IsWindows())
                {
                    wh.RunAsService();
                }
                else
                {
                    await wh.RunAsync();
                }
            }
        }

        private static async Task<IWebHostBuilder> ValidateAndConfigureService(string[] args)
        {
            try
            {
                var listenerUrl = await Fw.StartupConfiguration.EvalS("HttpListenerUrl");

                if (listenerUrl.IsNullOrWhitespace())
                {
                    throw new Exception("HttpListenerUrl not defined in config");
                }

                await Service.Config(Fw);

                File.AppendAllText(LogPath, $"{DateTime.Now}::CreateWebHostBuilder...{Environment.NewLine}");

                var pathToExe = Process.GetCurrentProcess().MainModule.FileName;
                var pathToContentRoot = Path.GetDirectoryName(pathToExe);

                return WebHost.CreateDefaultBuilder(args)
                    .UseContentRoot(pathToContentRoot)
                    .UseStartup<Startup>()
                    .UseUrls(listenerUrl);
            }
            catch (Exception ex)
            {
                File.AppendAllText(LogPath, $@"{nameof(ValidateAndConfigureService)}::{DateTime.Now}::{ex}{Environment.NewLine}");
                throw;
            }
        }

        private static async Task<FrameworkWrapper> LoadFramework(string[] args)
        {
            try
            {
                var fw = await FrameworkWrapper.Create(commandLineArgs: args);

                using (var dynamicContext = new AssemblyResolver(await fw.StartupConfiguration.EvalS("DataServiceAssemblyFilePath"), await fw.StartupConfiguration.EvalL<string>("AssemblyDirs").ToList()))
                {
                    Service = (IGenericWindowsService)dynamicContext.Assembly.CreateInstance(await fw.StartupConfiguration.EvalS("DataServiceTypeName"));
                }

                WwwRootPath = await fw.StartupConfiguration.EvalS("PhysicalFileProviderPath", defaultValue: null);

                return fw;
            }
            catch (Exception ex)
            {
                File.AppendAllText(LogPath, $@"{nameof(LoadFramework)}::{DateTime.Now}::{ex}{Environment.NewLine}");
                throw;
            }
        }
    }
}
