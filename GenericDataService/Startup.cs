using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.FileProviders;
using Utility;

namespace GenericDataService
{
    public class Startup
    {
        public dynamic DataService;

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials());
            });

            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => false;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });
        }

        public void UnobservedTaskExceptionEventHandler(object obj, UnobservedTaskExceptionEventArgs args)
        {
            File.AppendAllText("DataService.log", $@"{DateTime.Now}::{args.ToString()}::{args.ToString()}" +
                            Environment.NewLine);
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            FrameworkWrapper fw = null;

            try
            {
                fw = new FrameworkWrapper();

                using (var dynamicContext = new Utility.AssemblyResolver(Path.GetFullPath(fw.StartupConfiguration.GetS("Config/DataServiceAssemblyFilePath"))))
                {
                    this.DataService = dynamicContext.Assembly.CreateInstance(fw.StartupConfiguration.GetS("Config/DataServiceTypeName"));
                }

                DataService.Config(fw);
            }
            catch (Exception ex)
            {
                File.AppendAllText("DataService.log", $@"Config::{DateTime.Now}::{ex}{Environment.NewLine}");
                throw;
            }

            var wwwrootPath = fw.StartupConfiguration.GetS("Config/PhysicalFileProviderPath");

            if (!wwwrootPath.IsNullOrWhitespace())
            {
                app.UseStaticFiles(new StaticFileOptions
                {
                    FileProvider = new PhysicalFileProvider(wwwrootPath),
                    //RequestPath = "/"
                });
            }
            else app.UseStaticFiles();

            app.UseCors("CorsPolicy");

            TaskScheduler.UnobservedTaskException += new EventHandler<UnobservedTaskExceptionEventArgs>(UnobservedTaskExceptionEventHandler);

            app.Run(async (context) =>
            {
                try
                {
                    if (context.IsLocal() && context.Request.Query["m"] == "config")
                    {
                        var resp = fw.StartupConfiguration.GetS("");

                        context.Response.StatusCode = (int)HttpStatusCode.OK;
                        context.Response.ContentType = "application/json";
                        context.Response.ContentLength = Encoding.UTF8.GetBytes(resp).Length;
                        await context.Response.WriteAsync(resp);
                    }
                    else
                        await this.DataService.Run(context);
                }
                catch (Exception ex)
                {
                    File.AppendAllText("DataService.log", $@"Run::{DateTime.Now}::{ex.ToString()}{Environment.NewLine}");
                }
            });
        }
    }
}
