using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Utility;
using Jw = Utility.JsonWrapper;

namespace ReadPixel
{
    public class Startup
    {
        public string ConnectionString;
        public string ConfigurationKey;
        public string PixelReadConnectionString;
        public string PixelValue;
        public int PixelDuration;

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            IConfigurationRoot configuration = new ConfigurationBuilder()
                            .SetBasePath(Directory.GetCurrentDirectory())
                            .AddJsonFile("appsettings.json")
                            .Build();
            this.ConnectionString = configuration.GetConnectionString("DefaultConnection");
            this.ConfigurationKey = configuration.GetValue<String>("Application:Instance");

            string result = SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                        "SelectConfig",
                        Jw.Json(new { InstanceId = this.ConfigurationKey }),
                        "").GetAwaiter().GetResult();
            IGenericEntity gc = new GenericEntityJson();
            var gcstate = JsonConvert.DeserializeObject(result);
            gc.InitializeEntity(null, null, gcstate);

            this.PixelReadConnectionString = gc.GetS("Config/PixelReadConnectionString");
            this.PixelValue = gc.GetS("Config/PixelValue");
            this.PixelDuration = Int32.Parse(gc.GetS("Config/PixelDuration"));

            app.Run(async (context) =>
            {
                await Start(context);
            });
        }

        public async Task Start(HttpContext context)
        {
            string requestFromPost = "";

            try
            {
                requestFromPost = await context.GetRawBodyStringAsync();

                string pixelValue = context.Request.Query["pxl"];
                if (!String.IsNullOrEmpty(pixelValue))
                {
                    Stopwatch stopWatch = new Stopwatch();                    
                    stopWatch.Start();

                    context.RequestAborted.Register(() =>
                    {
                        stopWatch.Stop();
                        long duration = stopWatch.ElapsedMilliseconds;

                        string result = SqlWrapper.SqlServerProviderEntry(this.PixelReadConnectionString,
                        "ReadPixelFire",
                        Jw.Json(new { Duration = duration, PixelValue = pixelValue }),
                        "").GetAwaiter().GetResult();
                    });

                    await Task.Delay(this.PixelDuration * 1000);

                    if (!context.RequestAborted.IsCancellationRequested)
                    {
                        string result = await SqlWrapper.SqlServerProviderEntry(this.PixelReadConnectionString,
                            "ReadPixelFire",
                            Jw.Json(new { Duration = -1, PixelValue = pixelValue }),
                            "");

                        var PixelContentBase64 = this.PixelValue;
                        var PixelContentType = "image/gif";
                        var PixelImage = Convert.FromBase64String(PixelContentBase64);
                        context.Response.ContentType = PixelContentType;
                        context.Response.Headers.ContentLength = PixelImage.Length;
                        await context.Response.Body.WriteAsync(PixelImage);
                    }
                }
            }
            catch (Exception ex)
            {
                File.AppendAllText("log.txt", $@"{DateTime.Now}::{requestFromPost}::{ex.ToString()}" + Environment.NewLine);
            }
        }
    }
}
