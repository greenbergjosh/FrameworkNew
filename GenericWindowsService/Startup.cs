using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Utility;
using Utility.Http;

namespace GenericWindowsService
{
    public class Startup
    {

        public static void ConfigureServices(IServiceCollection services)
        {
            _ = services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials()
                    // https://docs.microsoft.com/en-us/aspnet/core/migration/21-to-22?view=aspnetcore-2.2&tabs=visual-studio 
                    // We don't want a "*", because no browser supports that.  The lambda below returns the origin
                    // domain explicitly, which is what we were doing before the upgrade above.
                    .SetIsOriginAllowed(x => { return true; })
                    );
            })
            .Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => false;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            File.AppendAllText(Program.LogPath, $@"{DateTime.Now}::ConfigureServices...{Environment.NewLine}");
        }

        public void UnobservedTaskExceptionEventHandler(object obj, UnobservedTaskExceptionEventArgs args) => File.AppendAllText(Program.LogPath, $@"Unobservered::{DateTime.Now}::{args.Exception.UnwrapForLog()}{Environment.NewLine}");

        private void UnhandledExceptionEventHandler(object sender, UnhandledExceptionEventArgs e) => File.AppendAllText(Program.LogPath, $@"Unhandled::{DateTime.Now}::{((Exception)e.ExceptionObject).UnwrapForLog()}{Environment.NewLine}");

        private void OnShutdown()
        {
            File.AppendAllText(Program.LogPath, $@"{DateTime.Now}::OnShutdown()" + Environment.NewLine);
            Program.Service.OnStop();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IHostApplicationLifetime applicationLifetime)
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

                if (!Program.WwwRootPath.IsNullOrWhitespace())
                {
                    app.UseStaticFiles(new StaticFileOptions { FileProvider = new PhysicalFileProvider(Program.WwwRootPath) });
                }
                else
                {
                    app.UseStaticFiles();
                }

                app.UseCors("CorsPolicy");

                app.UseForwardedHeaders(new ForwardedHeadersOptions
                {
                    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
                });

                File.AppendAllText(Program.LogPath, $@"{DateTime.Now}::Configuring Http Handler..." + Environment.NewLine);

                HealthCheckHandler.Initialize(Program.Fw).GetAwaiter().GetResult();

                app.Run(async context =>
                {
                    try
                    {
                        if (context.Request.Query["m"] == "config")
                        {
                            await context.WriteSuccessRespAsync(Program.Fw.StartupConfiguration.ToString(), Encoding.UTF8);
                        }
                        else if (await HealthCheckHandler.Handle(context, Program.Fw))
                        {
                            return;
                        }
                        else
                        {
                            await Program.Service.ProcessRequest(context);
                        }
                    }
                    catch (Exception ex)
                    {
                        File.AppendAllText(Program.LogPath, $@"Run::{DateTime.Now}::{ex}{Environment.NewLine}");
                    }
                });

                File.AppendAllText(Program.LogPath, $@"{DateTime.Now}::Starting service..." + Environment.NewLine);

                Program.Service.OnStart();
            }
            catch (Exception e)
            {
                File.AppendAllText(Program.LogPath, $@"{DateTime.Now}::Configuration failed {e.UnwrapForLog()} {Environment.NewLine}");
            }
        }

    }
}
