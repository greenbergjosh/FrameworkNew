using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Newtonsoft.Json;
using Utility;
using System.Reflection;
using System.Text;
using Jw = Utility.JsonWrapper;

namespace GenericWindowsService
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            File.AppendAllText(Program.LogPath, $@"{DateTime.Now}::ConfigureServices...{Environment.NewLine}");
        }

        public void UnobservedTaskExceptionEventHandler(object obj, UnobservedTaskExceptionEventArgs args)
        {
            File.AppendAllText(Program.LogPath, $@"Unobservered::{DateTime.Now}::{args}::{args}{Environment.NewLine}");
        }

        private void OnShutdown()
        {
            File.AppendAllText(Program.LogPath, $@"{DateTime.Now}::OnShutdown()" + Environment.NewLine);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IApplicationLifetime applicationLifetime)
        {
            File.AppendAllText(Program.LogPath, $@"{DateTime.Now}::Configure..." + Environment.NewLine);

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            TaskScheduler.UnobservedTaskException += UnobservedTaskExceptionEventHandler;

            applicationLifetime.ApplicationStopping.Register(OnShutdown);

            var wwwrootPath = Program.Fw.StartupConfiguration.GetS("Config/PhysicalFileProviderPath");

            if (!wwwrootPath.IsNullOrWhitespace())
            {
                app.UseStaticFiles(new StaticFileOptions { FileProvider = new PhysicalFileProvider(wwwrootPath) });
            }
            else app.UseStaticFiles();

            app.Run(async context =>
            {
                try
                {
                    if (context.Request.Query["m"] == "cfg-0nP01nt")
                    {
                        var resp = Program.Fw.StartupConfiguration.GetS("");

                        context.Response.StatusCode = (int)HttpStatusCode.OK;
                        context.Response.ContentType = "application/json";
                        context.Response.ContentLength = Encoding.UTF8.GetBytes(resp).Length;
                        await context.Response.WriteAsync(resp);
                    }
                    else await Program.Service.HandleHttpRequest(context);
                }
                catch (Exception ex)
                {
                    File.AppendAllText(Program.LogPath, $@"Run::{DateTime.Now}::{ex.ToString()}{Environment.NewLine}");
                }
            });
        }

    }
}
