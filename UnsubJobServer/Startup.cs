using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Utility;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using UnsubLib;
using Jw = Utility.JsonWrapper;

namespace UnsubJobServer
{
    public class Startup
    {
        private FrameworkWrapper _fw;

        public void ConfigureServices(IServiceCollection services)
        {
            File.AppendAllText("UnsubJobServer.log", $@"{DateTime.Now}::ConfigureServices..." + Environment.NewLine);
        }

        public void UnobservedTaskExceptionEventHandler(object obj, UnobservedTaskExceptionEventArgs args)
        {
            File.AppendAllText("UnsubJobServer.log", $@"Unobservered::{DateTime.Now}::{args.ToString()}::{args.ToString()}" +
                            Environment.NewLine);
        }

        private void OnShutdown()
        {
            File.AppendAllText("UnsubJobServer.log", $@"{DateTime.Now}::OnShutdown()" + Environment.NewLine);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IApplicationLifetime applicationLifetime)
        {
            File.AppendAllText("UnsubJobServer.log", $@"{DateTime.Now}::Configure..." + Environment.NewLine);

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            TaskScheduler.UnobservedTaskException +=
                    new EventHandler<UnobservedTaskExceptionEventArgs>(UnobservedTaskExceptionEventHandler);

            applicationLifetime.ApplicationStopping.Register(OnShutdown);

            var pathToExe = Process.GetCurrentProcess().MainModule.FileName;
            var pathToContentRoot = Path.GetDirectoryName(pathToExe);

            _fw = new FrameworkWrapper();

            app.Run(async (context) =>
            {
                // sc create UnsubJobServerService binPath= "C:\CustomServices\UnsubJobServerService\UnsubJobServer.exe" DisplayName= "UnsubServerJobService" start= "auto"
                // sc start UnsubJobServerService
                // sc query UnsubJobServerService
                // sc stop UnsubJobServerService
                // sc delete UnsubJobServerService

                string requestFromPost = "";
                string result = Jw.Json(new { Error = "UnsubServerService SeeLogs" });

                try
                {
                    StreamReader reader = new StreamReader(context.Request.Body);
                    requestFromPost = await reader.ReadToEndAsync();
                    requestFromPost = WebUtility.UrlDecode(requestFromPost);

                    IGenericEntity dtve = new GenericEntityJson();
                    var dtv = JsonConvert.DeserializeObject(requestFromPost);
                    dtve.InitializeEntity(null, null, dtv);

                    // AppName = "UnsubJobServer"
                    var nw = new UnsubLib.UnsubLib(_fw);

                    switch (dtve.GetS("m"))
                    {
                        case "LoadUnsubFiles":
                            Task.Run(() => nw.LoadUnsubFiles(dtve));
                            result = Jw.Json(new { Result = "Success" });
                            break;

                        default:
                            File.AppendAllText("UnsubJobServer.log", $@"{DateTime.Now}::{requestFromPost}::Unknown method" +
                                Environment.NewLine);
                            break;
                    }

                }
                catch (Exception ex)
                {
                    File.AppendAllText("UnsubJobServer.log", $@"{DateTime.Now}::{requestFromPost}::{ex.ToString()}" +
                                Environment.NewLine);
                }

                context.Response.StatusCode = 200;
                context.Response.ContentType = "application/json";
                context.Response.ContentLength = result.Length;
                await context.Response.WriteAsync(result);

                //await context.Response.WriteAsync("Hello from the service v1");

            });
        }
    }
}
