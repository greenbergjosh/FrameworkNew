﻿using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataLayer.PostgreSQL;
using Framework.Core;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

namespace GenericDataService
{

    public class Startup
    {
        public dynamic DataService;
        private bool _dataServiceHasReInit = false;

        public Startup(IConfiguration configuration) => Configuration = configuration;

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
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

            DataLayerClientFactory.Initialize((PostgreSqlDataLayerClient.Name, (Func<IDataLayerClient>)(() => new PostgreSqlDataLayerClient())));
        }

        public void UnobservedTaskExceptionEventHandler(object obj, UnobservedTaskExceptionEventArgs args) => 
            File.AppendAllText("DataService.log", $"{DateTime.Now}::{args}{Environment.NewLine}");

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            FrameworkWrapper fw = null;

            try
            {
                fw = new FrameworkWrapper();

                using (var dynamicContext = new AssemblyResolver(fw.StartupConfiguration.GetS("Config/DataServiceAssemblyFilePath"), 
                                                                 fw.StartupConfiguration.GetL("Config/AssemblyDirs").Select(d => d.GetS(string.Empty))))
                {
                    DataService = dynamicContext.Assembly.CreateInstance(fw.StartupConfiguration.GetS("Config/DataServiceTypeName"));
                }

                if (DataService == null)
                    throw new InvalidOperationException("Failed to retrieve DataService instance. Check config entries DataServiceAssemblyFilePath and DataServiceTypeName");

                DataService.Config(fw);
            }
            catch (Exception ex)
            {
                File.AppendAllText("DataService.log", $@"Config::{DateTime.Now}::{ex}{Environment.NewLine}");
                throw;
            }

            _dataServiceHasReInit = ((object)DataService)
                .GetType()
                .GetMethods()
                .Where(m => m.IsPublic).Any(m => m.Name == "ReInitialize");

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

            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

            TaskScheduler.UnobservedTaskException += UnobservedTaskExceptionEventHandler;

            app.Run(async (context) =>
            {
                try
                {
                    if (context.Request.Path.HasValue && context.Request.Path.Value.Contains("favicon.ico"))
                    {
                        context.Response.StatusCode = 404;
                        return;
                    }

                    if (context.IsLocal() && context.Request.Query["m"] == "config")
                    {
                        await context.WriteSuccessRespAsync(fw.StartupConfiguration.GetS(string.Empty), Encoding.UTF8);
                        return;
                    }

                    if (context.IsLocal() && context.Request.Query["m"] == "trace")
                    {
                        var traceLog = Data.GetTrace()?.Select(t => 
                            $"{t.logTime:yy-MM-dd HH:mm:ss.f}\t{t.location} - {t.log}")
                            .Join("\r\n") ?? $"{DateTime.Now:yy-MM-dd HH:mm:ss.f}\tNoTrace Log";

                        await context.WriteSuccessRespAsync(traceLog, Encoding.UTF8);
                        return;
                    }

                    if (context.Request.Query["m"] == "reinit")
                    {
                        var success = await fw.ReInitialize();

                        if (success)
                        {
                            try
                            {
                                if (_dataServiceHasReInit) DataService.ReInitialize();
                                await context.WriteSuccessRespAsync(JsonWrapper.Serialize(new
                                {
                                    result = "success"
                                }), Encoding.UTF8);
                            }
                            catch (Exception e)
                            {
                                await context.WriteFailureRespAsync(JsonWrapper.Serialize(new
                                {
                                    result = "failed",
                                    error = $"Dataservice reinit failed: {e.UnwrapForLog()}" }
                                ), Encoding.UTF8);
                            }
                        }
                        else
                        {
                            var traceLog = Data.GetTrace()?.Select(t => 
                                $"{t.logTime:yy-MM-dd HH:mm:ss.f}\t{t.location} - {t.log}")
                                .Join("\r\n") ??$"{DateTime.Now:yy-MM-dd HH:mm:ss.f}\tNoTrace Log";

                            await context.WriteFailureRespAsync(JsonWrapper.Serialize(new
                            {
                                result = "failed",
                                traceLog
                            }), Encoding.UTF8);
                        }

                        return;
                    }

                    await this.DataService.Run(context);
                }
                catch (Exception ex)
                {
                    await fw.Error(nameof(DataService.Run), $@"Caught exception processing request: {ex.Message} : {ex.UnwrapForLog()}");
                    File.AppendAllText("DataService.log", $@"Run::{DateTime.Now}::{ex.ToString()}{Environment.NewLine}");
                    throw;
                }
            });
        }
    }
}
