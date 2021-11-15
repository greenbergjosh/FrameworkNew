using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Utility;
using Utility.DataLayer;
using Utility.Http;

namespace GenericDataService
{
    public class Startup
    {
        public IGenericDataService DataService;

        public void ConfigureServices(IServiceCollection services) => _ = services.AddCors(options => options.AddPolicy("CorsPolicy",
                    builder => builder
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials()
                    .SetIsOriginAllowed(x => true)
                    ))
            .Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => false;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            })
            .AddDistributedMemoryCache();

        public void UnobservedTaskExceptionEventHandler(object obj, UnobservedTaskExceptionEventArgs args) => FileSystem.WriteLineToFileThreadSafe("DataService.log", $"{DateTime.Now}::{args}{Environment.NewLine}");

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            DataService = Program.DataService;
            var fw = Program.FrameworkWrapper;
            var wwwrootPath = Program.WwwRootPath;

            if (!wwwrootPath.IsNullOrWhitespace())
            {
#if DEBUG
                wwwrootPath = Path.GetFullPath(wwwrootPath);
#endif
                app.UseStaticFiles(new StaticFileOptions
                {
                    FileProvider = new PhysicalFileProvider(wwwrootPath)
                });
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

            TaskScheduler.UnobservedTaskException += UnobservedTaskExceptionEventHandler;

            var chunkHandler = new ChunkedFileHandler(new IDistributedCacheChunkStorageProvider(fw.Cache));

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
                        await context.WriteSuccessRespAsync(JsonSerializer.Serialize(fw.StartupConfiguration), Encoding.UTF8);
                        return;
                    }

                    if (context.IsLocal() && context.Request.Query["m"] == "trace")
                    {
                        var traceLog = Data.GetTrace()?.Select(t => $"{t.logTime:yy-MM-dd HH:mm:ss.f}\t{t.location} - {t.log}").Join("\r\n") ?? $"{DateTime.Now:yy-MM-dd HH:mm:ss.f}\tNoTrace Log";

                        await context.WriteSuccessRespAsync(traceLog, Encoding.UTF8);
                        return;
                    }

                    if (context.Request.Query["m"] == "reinit")
                    {
                        var success = await fw.Reinitialize();

                        if (success)
                        {
                            try
                            {
                                await DataService.Reinitialize();
                                await context.WriteSuccessRespAsync(JsonSerializer.Serialize(new { result = "success" }), Encoding.UTF8);
                            }
                            catch (Exception e)
                            {
                                await context.WriteFailureRespAsync(JsonSerializer.Serialize(new { result = "failed", error = $"Dataservice reinit failed: {e.UnwrapForLog()}" }), Encoding.UTF8);
                            }
                        }
                        else
                        {
                            var traceLog = Data.GetTrace()?.Select(t => $"{t.logTime:yy-MM-dd HH:mm:ss.f}\t{t.location} - {t.log}").Join("\r\n") ??
                                           $"{DateTime.Now:yy-MM-dd HH:mm:ss.f}\tNoTrace Log";

                            await context.WriteFailureRespAsync(JsonSerializer.Serialize(new { result = "failed", traceLog }), Encoding.UTF8);
                        }

                        return;
                    }
                    else if (await HealthCheckHandler.Handle(context, fw))
                    {
                        return;
                    }

                    if (context.Request.HasFormContentType && context.Request.Form.Files.Count == 1 && context.Request.Form.ContainsKey("chunkIndex") && context.Request.Form.ContainsKey("totalChunk"))
                    {
                        var chunkIndex = int.Parse(context.Request.Form["chunkIndex"]);
                        var totalChunks = int.Parse(context.Request.Form["totalChunk"]);
                        var filename = context.Request.Form.Files[0].FileName;
                        var fileChunk = context.Request.Form.Files[0].OpenReadStream();

                        var completedFileStream = await chunkHandler.HandleChunk(filename, chunkIndex, totalChunks, fileChunk);
                        if (completedFileStream != null)
                        {
                            context.Items[filename] = completedFileStream;
                        }
                        else
                        {
                            context.Response.StatusCode = 200;
                            return;
                        }
                    }

                    await DataService.ProcessRequest(context);
                }
                catch (Exception ex)
                {
                    File.AppendAllText("DataService.log", $@"Run::{DateTime.Now}::{ex}{Environment.NewLine}");
                }
            });
        }
    }
}
