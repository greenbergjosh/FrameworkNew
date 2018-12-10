﻿using Microsoft.AspNetCore.Builder;
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

            app.UseStaticFiles();
            app.UseCors("CorsPolicy");
            
            TaskScheduler.UnobservedTaskException +=
                new EventHandler<UnobservedTaskExceptionEventArgs>(UnobservedTaskExceptionEventHandler);

            FrameworkWrapper fw = new FrameworkWrapper();

            using (var dynamicContext = new Utility.AssemblyResolver(fw.StartupConfiguration.GetS("Config/DataServiceAssemblyFilePath")))
            {
                this.DataService = dynamicContext.Assembly.CreateInstance(fw.StartupConfiguration.GetS("Config/DataServiceTypeName"));
            }

            DataService.Config(fw);

            app.Run(async (context) =>
            {
                await this.DataService.Run(context);
            });
        }
    }
}
