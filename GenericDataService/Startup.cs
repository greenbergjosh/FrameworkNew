using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;

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
                    builder => builder
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials()
                    // https://docs.microsoft.com/en-us/aspnet/core/migration/21-to-22?view=aspnetcore-2.2&tabs=visual-studio 
                    // We don't want a "*", because no browser supports that.  The lambda below returns the origin
                    // domain explicitly, which is what we were doing before the upgrade above.
                    .SetIsOriginAllowed(x => { return true; })
                    );
            });

            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => false;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });
        }

        public void UnobservedTaskExceptionEventHandler(object obj, UnobservedTaskExceptionEventArgs args) => File.AppendAllText("DataService.log", $"{DateTime.Now}::{args}{Environment.NewLine}");

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

                using (var dynamicContext = new Utility.AssemblyResolver(fw.StartupConfiguration.GetS("Config/DataServiceAssemblyFilePath"), fw.StartupConfiguration.GetL("Config/AssemblyDirs").Select(d => d.GetS(""))))
                {
                    DataService = dynamicContext.Assembly.CreateInstance(fw.StartupConfiguration.GetS("Config/DataServiceTypeName"));
                }

                if (DataService == null) throw new Exception("Failed to retrieve DataService instance. Check config entries DataServiceAssemblyFilePath and DataServiceTypeName");

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
                    FileProvider = new PhysicalFileProvider(wwwrootPath)
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
                        await context.WriteSuccessRespAsync(fw.StartupConfiguration.GetS(""), Encoding.UTF8);
                        return;
                    }

                    if (context.IsLocal() && context.Request.Query["m"] == "trace")
                    {
                        var traceLog = Data.GetTrace()?.Select(t => $"{t.logTime:yy-MM-dd HH:mm:ss.f}\t{t.location} - {t.log}").Join("\r\n") ?? $"{DateTime.Now:yy-MM-dd HH:mm:ss.f}\tNoTrace Log";

                        await context.WriteSuccessRespAsync(traceLog, Encoding.UTF8);
                        return;
                    }

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
