using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Utility;
using Newtonsoft.Json;
using UnsubLib;
using Jw = Utility.JsonWrapper;
using Microsoft.Extensions.Configuration;
using System.Net;

namespace UnsubServerWeb
{
    public class Startup
    {
        private FrameworkWrapper _fw;

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
        }

        public void UnobservedTaskExceptionEventHandler(object obj, UnobservedTaskExceptionEventArgs args)
        {
            File.AppendAllText("UnsubServer.log", $@"Unobservered::{DateTime.Now}::{args.ToString()}::{args.ToString()}" +
                            Environment.NewLine);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IApplicationLifetime applicationLifetime)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            TaskScheduler.UnobservedTaskException +=
                    new EventHandler<UnobservedTaskExceptionEventArgs>(UnobservedTaskExceptionEventHandler);

            File.AppendAllText("UnsubServer.log", $@"{DateTime.Now}::Starting..." + Environment.NewLine);
            applicationLifetime.ApplicationStopping.Register(OnShutdown);

            _fw = new FrameworkWrapper();

            app.Run(async (context) =>
            {
                string requestFromPost = "";
                string result = Jw.Json(new { Error = "SeeLogs" });

                try
                {
                    StreamReader reader = new StreamReader(context.Request.Body);
                    requestFromPost = await reader.ReadToEndAsync();
                    requestFromPost = WebUtility.UrlDecode(requestFromPost);

                    IGenericEntity dtve = new GenericEntityJson();
                    var dtv = JsonConvert.DeserializeObject(requestFromPost);
                    dtve.InitializeEntity(null, null, dtv);

                    // AppName = "UnsubServer"
                    var nw = new UnsubLib.UnsubLib(_fw);

                    switch (dtve.GetS("m"))
                    {
                        case "IsUnsub":
                            result = await nw.IsUnsub(dtve);
                            break;

                        case "IsUnsubList":
                            result = await nw.IsUnsubList(dtve);
                            break;

                        case "ForceUnsub":
                            result = await nw.ForceUnsub(dtve);
                            break;

                        case "CleanUnusedFilesServer":
                            result = await nw.CleanUnusedFilesServer();
                            break;

                        default:
                            File.AppendAllText("UnsubServer.log", $@"{DateTime.Now}::{requestFromPost}::Unknown method" +
                                Environment.NewLine);
                            break;
                    }

                }
                catch (Exception ex)
                {
                    File.AppendAllText("UnsubServer.log", $@"{DateTime.Now}::{requestFromPost}::{ex.ToString()}" +
                                Environment.NewLine);
                }

                context.Response.StatusCode = 200;
                context.Response.ContentType = "application/json";
                context.Response.ContentLength = result.Length;
                await context.Response.WriteAsync(result);

            });
        }

        private void OnShutdown()
        {
            File.AppendAllText("UnsubServer.log", $@"{DateTime.Now}::OnShutdown()" + Environment.NewLine);
        }
    }
}
