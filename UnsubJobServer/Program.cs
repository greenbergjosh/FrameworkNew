using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.WindowsServices;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace UnsubJobServer
{
    // See: https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/windows-service?view=aspnetcore-2.1
    // This is an ASP.Net Core 2.1 hosted in a windows service
    // For deployment:
    //  https://www.iis.net/downloads/microsoft/application-request-routing
    //  https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/reverse-proxy-rule-template
    // sc create UnsubJobServerService binPath= "c:\CustomServices\UnsubJobServerService\UnsubJobServer.exe" DisplayName= "UnsubJobServerService" start= auto
    public class Program
    {
        public static void Main(string[] args)
        {
            //File.AppendAllText("UnsubJobServer.log", $@"{DateTime.Now}::Main..." + Environment.NewLine);
            CreateWebHostBuilder(args).Build().RunAsService();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args)
        {
            File.AppendAllText("UnsubJobServer.log", $@"{DateTime.Now}::CreateWebHostBuilder..." + Environment.NewLine);

            var pathToExe = Process.GetCurrentProcess().MainModule.FileName;
            var pathToContentRoot = Path.GetDirectoryName(pathToExe);

            return WebHost.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((context, config) =>
                {
                    // Configure the app here.
                })
                .UseContentRoot(pathToContentRoot)
                .UseStartup<Startup>()
                .UseUrls("http://0.0.0.0:5986");
            
        }
    }
}
