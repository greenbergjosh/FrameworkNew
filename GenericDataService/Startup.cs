using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Utility;

namespace GenericDataService
{
    public class Startup
    {
        public string ConnectionString;
        public string ConfigurationKey;
        public dynamic DataService;
        public IGenericEntity Configuration;

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

            app.UseStaticFiles();
            app.UseCors("CorsPolicy");

            try
            {
                TaskScheduler.UnobservedTaskException +=
                    new EventHandler<UnobservedTaskExceptionEventArgs>(UnobservedTaskExceptionEventHandler);

                IConfigurationRoot configuration = new ConfigurationBuilder()
                            .SetBasePath(Directory.GetCurrentDirectory())
                            .AddJsonFile("appsettings.json")
                            .Build();
                this.ConnectionString = configuration.GetConnectionString("DefaultConnection");
                this.ConfigurationKey = configuration.GetValue<String>("Application:Instance");

                this.Configuration = SqlWrapper.Initialize(this.ConnectionString, this.ConfigurationKey).GetAwaiter().GetResult();
                EdwSiloLoadBalancedWriter siloWriter = EdwSiloLoadBalancedWriter.InitializeEdwSiloLoadBalancedWriter(this.Configuration);
                ErrorSiloLoadBalancedWriter errorWriter = ErrorSiloLoadBalancedWriter.InitializeErrorSiloLoadBalancedWriter(this.Configuration);

                using (var dynamicContext = new Utility.AssemblyResolver(this.Configuration.GetS("Config/DataServiceAssemblyFilePath")))
                {
                    this.DataService = dynamicContext.Assembly.CreateInstance(this.Configuration.GetS("Config/DataServiceTypeName"));
                }

                DataService.Config(this.Configuration, siloWriter, errorWriter);
            }
            catch (Exception ex)
            {
                File.AppendAllText(this.Configuration.GetS("Config/DataServiceLogFileName"), 
                    $@"{DateTime.Now}::{ex.ToString()}" + Environment.NewLine);
            }

            app.Run(async (context) =>
            {
                await DataService.Start(context);
            });
        }
    }
}
