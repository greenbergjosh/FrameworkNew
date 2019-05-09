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
            File.AppendAllText(Program.LogPath, $@"Unobservered::{DateTime.Now}::{args.Exception.UnwrapForLog()}{Environment.NewLine}");
        }

        private void UnhandledExceptionEventHandler(object sender, UnhandledExceptionEventArgs e)
        {
            File.AppendAllText(Program.LogPath, $@"Unhandled::{DateTime.Now}::{((Exception)e.ExceptionObject).UnwrapForLog()}{Environment.NewLine}");
        }

        private void OnShutdown()
        {
            File.AppendAllText(Program.LogPath, $@"{DateTime.Now}::OnShutdown()" + Environment.NewLine);
            if (Program.HasOnStop) Program.Service.OnStop();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IApplicationLifetime applicationLifetime)
        {
            File.AppendAllText(Program.LogPath, $@"{DateTime.Now}::Configure..." + Environment.NewLine);

            try
            {
                if (env.IsDevelopment())
                {
                    app.UseDeveloperExceptionPage();
                }

                AppDomain.CurrentDomain.UnhandledException += UnhandledExceptionEventHandler;

                TaskScheduler.UnobservedTaskException += UnobservedTaskExceptionEventHandler;

                applicationLifetime.ApplicationStopping.Register(OnShutdown);

                File.AppendAllText(Program.LogPath, $@"{DateTime.Now}::Setting static files path..." + Environment.NewLine);

                var wwwrootPath = Program.Fw.StartupConfiguration.GetS("Config/PhysicalFileProviderPath");

                if (!wwwrootPath.IsNullOrWhitespace())
                {
                    app.UseStaticFiles(new StaticFileOptions { FileProvider = new PhysicalFileProvider(wwwrootPath) });
                }
                else app.UseStaticFiles();

                File.AppendAllText(Program.LogPath, $@"{DateTime.Now}::Configuring Http Handler..." + Environment.NewLine);

                app.Run(async context =>
                {
                    try
                    {
                        if (context.Request.Query["m"] == "config")
                        {
                            await context.WriteSuccessRespAsync(Program.Fw.StartupConfiguration.GetS(""), Encoding.UTF8);
                        }
                        else await Program.Service.HandleHttpRequest(context);
                    }
                    catch (Exception ex)
                    {
                        File.AppendAllText(Program.LogPath, $@"Run::{DateTime.Now}::{ex.ToString()}{Environment.NewLine}");
                    }
                });

                if (Program.HasOnStart)
                {

                    File.AppendAllText(Program.LogPath, $@"{DateTime.Now}::Starting service..." + Environment.NewLine);

                    Program.Service.OnStart();
                }
            }
            catch (Exception e)
            {
                File.AppendAllText(Program.LogPath, $@"{DateTime.Now}::Configuration failed {e.UnwrapForLog()} {Environment.NewLine}");
            }
        }

    }
}
