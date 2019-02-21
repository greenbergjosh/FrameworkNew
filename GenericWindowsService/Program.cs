using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Utility;

namespace GenericWindowsService
{
    class Program
    {
        public const string LogPath = "GenericWindowsService.log";
        public static FrameworkWrapper Fw;
        public static dynamic Service;
        public static bool HasOnStart = false;
        public static bool HasOnStop = false;

        private static void Main(string[] args)
        {
            Directory.SetCurrentDirectory(AppDomain.CurrentDomain.BaseDirectory);
            Fw = LoadFramework();
            ValidateAndConfigureService(args).Build().Run();
        }

        private static IWebHostBuilder ValidateAndConfigureService(string[] args)
        {
            try
            {
                var listenerUrl = Fw.StartupConfiguration.GetS("HttpListenerUrl");

                if (listenerUrl.IsNullOrWhitespace()) throw new Exception("HttpListenerUrl not defined in config");

                var methods = ((object)Service).GetType().GetMethods().Where(m => m.IsPublic).ToArray();
                var handleHttp = methods.FirstOrDefault(m => m.Name == "HandleHttpRequest");

                if (handleHttp == null) throw new Exception("Dynamic service requires HandleHttpRequest(HttpContext) method");
                else
                {
                    var parms = handleHttp.GetParameters();

                    if (parms.Length < 1 || parms[0].ParameterType == typeof(HttpContext) || parms.Length > 1) throw new Exception("Dynamic service method HandleHttpRequest(HttpContext) has invalid signature");
                }

                var onStart = methods.FirstOrDefault(m => m.Name == "OnStart");

                if (onStart != null && onStart.GetParameters().Length != 0) throw new Exception("Dynamic service OnStart method cannot have any parameters");
                else if (onStart != null) HasOnStart = true;

                var OnStop = methods.FirstOrDefault(m => m.Name == "OnStop");

                if (OnStop != null && OnStop.GetParameters().Length != 0) throw new Exception("Dynamic service OnStop method cannot have any parameters");
                else if (OnStop != null) HasOnStop = true;

                if (methods.All(m => m.Name == "OnStop")) throw new Exception("Dynamic service requires HandleHttpRequest(HttpContext) method");

                var configFunc = methods.FirstOrDefault(m => m.Name == "Config");

                if (configFunc != null)
                {
                    var parms = configFunc.GetParameters();

                    if (parms.Length == 2 && parms[0].ParameterType == typeof(string[]) && parms[1].ParameterType == typeof(FrameworkWrapper)) Service.Config(args, Fw);
                    else if (parms.Length == 1 && parms[1].ParameterType == typeof(FrameworkWrapper)) Service.Config(Fw);
                    else throw new Exception($"Dynamic service Config method requires signature Config({nameof(FrameworkWrapper)}) method");
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

        private static FrameworkWrapper LoadFramework()
        {
            try
            {
                var fw = new FrameworkWrapper();

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
