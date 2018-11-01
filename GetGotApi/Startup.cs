using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using GenericEntity;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Jw = Utility.JsonWrapper;
using Newtonsoft.Json.Linq;
using Utility;

namespace GetGotApi
{
    public class Startup
    {
        public string ConnectionString;
        public string ConfigurationKey;

        public string GetGotDbConnectionString;

        public void UnobservedTaskExceptionEventHandler(object obj, UnobservedTaskExceptionEventArgs args)
        {
            File.AppendAllText("GetGotApi.log", $@"{DateTime.Now}::{args.ToString()}::{args.ToString()}" +
                            Environment.NewLine);
        }

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
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseStaticFiles();
            app.UseCors("CorsPolicy");

            File.AppendAllText("GetGotApi.log", $@"{DateTime.Now}::Starting" +
                            Environment.NewLine);
            string result = "";
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

                result = SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                            "SelectConfig",
                            Jw.Json(new { InstanceId = this.ConfigurationKey }),
                            "").GetAwaiter().GetResult();
                IGenericEntity gc = new GenericEntityJson();
                var gcstate = JsonConvert.DeserializeObject(result);
                gc.InitializeEntity(null, null, gcstate);

                this.GetGotDbConnectionString = gc.GetS("Config/GetGotDbConnectionString");
            }
            catch (Exception ex)
            {
                File.AppendAllText("GetGotApi.log", $@"{DateTime.Now}::{ex.ToString()}" + Environment.NewLine);
            }

            app.Run(async (context) =>
            {
                await Start(context);
            });
        }

        public async Task Start(HttpContext context)
        {
            string requestFromPost = "";
            string resp = Jw.Json(new { Error = "SeeLogs" });
            var result = "ok";
            try
            {
                StreamReader reader = new StreamReader(context.Request.Body);
                requestFromPost = await reader.ReadToEndAsync();

                if (!String.IsNullOrEmpty(context.Request.Query["m"]))
                {
                    string m = context.Request.Query["m"];
                    switch (m)
                    {
                        case "CreateCampaign":
                            result = await CreateCampaign(requestFromPost);
                            break;
                       
                        default:
                            File.AppendAllText("GetGotApi.log", $@"{DateTime.Now}::{requestFromPost}::Unknown method" + Environment.NewLine);
                            break;
                    }
                    await context.Response.WriteAsync(result);
                }
            }
            catch (Exception ex)
            {
                await SqlWrapper.SqlServerProviderEntry(this.GetGotDbConnectionString,
                        "GetGotDbErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1,
                            Proc = "GetGotApi",
                            Meth = "Start",
                            Desc = Utility.Hashing.EncodeTo64($@"{requestFromPost}"),
                            Msg = Utility.Hashing.EncodeTo64(ex.ToString())
                        }),
                        "");
            }
        }

        public async Task<string> CreateCampaign(string request)
        {
            return "";
        }
    }
}
