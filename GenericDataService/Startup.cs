using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.FileProviders;
using Utility;

namespace GenericDataService
{
    public class Startup
    {
        public dynamic DataService;
        private IGenericEntity _cors = null;

        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => false;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });
        }

        public void UnobservedTaskExceptionEventHandler(object obj, UnobservedTaskExceptionEventArgs args)
        {
            File.AppendAllText("DataService.log", $"{DateTime.Now}::{args}{Environment.NewLine}");
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

                _cors = fw.StartupConfiguration.GetE("Config/Cors");

                using (var dynamicContext = new Utility.AssemblyResolver(fw.StartupConfiguration.GetS("Config/DataServiceAssemblyFilePath"), fw.StartupConfiguration.GetL("Config/AssemblyDirs").Select(d => d.GetS(""))))
                {
                    this.DataService = dynamicContext.Assembly.CreateInstance(fw.StartupConfiguration.GetS("Config/DataServiceTypeName"));
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

                    if (_cors != null) context.AddCorsAccessForOriginHost(_cors);

                    await DataService.Run(context);
                }
                catch (Exception ex)
                {
                    File.AppendAllText("DataService.log", $@"Run::{DateTime.Now}::{ex.ToString()}{Environment.NewLine}");
                }
            });
        }
    }
}
