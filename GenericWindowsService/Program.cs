using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.WindowsServices;
using Microsoft.AspNetCore.Http;
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using Utility;

namespace GenericWindowsService
{
    internal class Program
    {
        public const string LogPath = "GenericWindowsService.log";
        public static FrameworkWrapper Fw;
        public static dynamic Service;
        public static bool HasOnStart = false;
        public static bool HasOnStop = false;

        private static void Main(string[] args)
        {
            Directory.SetCurrentDirectory(AppDomain.CurrentDomain.BaseDirectory);
            Fw = LoadFramework(args);
            if (args.Contains("console"))
            {
                ValidateAndConfigureService(args).Build().Run();
            }
            else
            {
                var svc = ValidateAndConfigureService(args);

                File.AppendAllText(Program.LogPath, $@"{nameof(ValidateAndConfigureService)}::{DateTime.Now}::Building Host{Environment.NewLine}");

                var wh = svc.Build();

                File.AppendAllText(Program.LogPath, $@"{nameof(ValidateAndConfigureService)}::{DateTime.Now}::Running Host{Environment.NewLine}");

                wh.RunAsService();
            }
        }

        private static IWebHostBuilder ValidateAndConfigureService(string[] args)
        {
            try
            {
                var listenerUrl = Fw.StartupConfiguration.GetS("Config/HttpListenerUrl");

                if (listenerUrl.IsNullOrWhitespace())
                {
                    throw new Exception("HttpListenerUrl not defined in config");
                }

                var methods = ((object)Service).GetType().GetMethods().Where(m => m.IsPublic).ToArray();
                var handleHttp = methods.FirstOrDefault(m => m.Name == "HandleHttpRequest");

                if (handleHttp == null)
                {
                    throw new Exception("Dynamic service requires HandleHttpRequest(HttpContext) method");
                }
                else
                {
                    var parms = handleHttp.GetParameters();

                    if (parms.Length < 1 || parms[0].ParameterType != typeof(HttpContext) || parms.Length > 1)
                    {
                        throw new Exception("Dynamic service method HandleHttpRequest(HttpContext) has invalid signature");
                    }
                }

                var onStart = methods.FirstOrDefault(m => m.Name == "OnStart");

                if (onStart != null && onStart.GetParameters().Length != 0)
                {
                    throw new Exception("Dynamic service OnStart method cannot have any parameters");
                }
                else if (onStart != null)
                {
                    HasOnStart = true;
                }

                var onStop = methods.FirstOrDefault(m => m.Name == "OnStop");

                if (onStop != null && onStop.GetParameters().Length != 0)
                {
                    throw new Exception("Dynamic service OnStop method cannot have any parameters");
                }
                else if (onStop != null)
                {
                    HasOnStop = true;
                }

                var configFunc = methods.FirstOrDefault(m => m.Name == "Config");

                if (configFunc != null)
                {
                    var parms = configFunc.GetParameters();

                    if (parms.Length == 2 && parms[0].ParameterType == typeof(string[]) && parms[1].ParameterType == typeof(FrameworkWrapper))
                    {
                        Service.Config(args, Fw);
                    }
                    else if (parms.Length == 1 && parms[0].ParameterType == typeof(FrameworkWrapper))
                    {
                        Service.Config(Fw);
                    }
                    else
                    {
                        throw new Exception($"Dynamic service Config method requires signature Config({nameof(FrameworkWrapper)}) method");
                    }
                }

                File.AppendAllText(LogPath, $"{DateTime.Now}::CreateWebHostBuilder...{Environment.NewLine}");

                var pathToExe = Process.GetCurrentProcess().MainModule.FileName;
                var pathToContentRoot = Path.GetDirectoryName(pathToExe);

                return WebHost.CreateDefaultBuilder(args)
                    .ConfigureAppConfiguration((context, config) =>
                    {
                        // Configure the app here.
                    })
                    .UseContentRoot(pathToContentRoot)
                    .UseStartup<Startup>()
                    .UseUrls(listenerUrl);
            }
            catch (Exception ex)
            {
                File.AppendAllText(Program.LogPath, $@"{nameof(ValidateAndConfigureService)}::{DateTime.Now}::{ex}{Environment.NewLine}");
                throw;
            }
        }

        private static FrameworkWrapper LoadFramework(string[] args)
        {
            try
            {
                var fw = new FrameworkWrapper(args);

                using (var dynamicContext = new AssemblyResolver(fw.StartupConfiguration.GetS("Config/DataServiceAssemblyFilePath"), fw.StartupConfiguration.GetL("Config/AssemblyDirs").Select(p => p.GetS(""))))
                {
                    Service = dynamicContext.Assembly.CreateInstance(fw.StartupConfiguration.GetS("Config/DataServiceTypeName"));
                }

                return fw;
            }
            catch (Exception ex)
            {
                File.AppendAllText(Program.LogPath, $@"{nameof(LoadFramework)}::{DateTime.Now}::{ex}{Environment.NewLine}");
                throw;
            }

        }

    }
}
