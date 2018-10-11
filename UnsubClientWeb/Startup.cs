using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using GenericEntity;
using Newtonsoft.Json;
using UnsubLib;
using Jw = Utility.JsonWrapper;
using System.IO;
using Microsoft.Extensions.Configuration;

namespace UnsubClientWeb
{
    public class Startup
    {
        public string ConnectionString;

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
            ConnectionString = configuration.GetConnectionString("DefaultConnection");

            app.Run(async (context) =>
            {
                string requestFromPost = "";
                string result = Jw.Json(new { Error = "SeeLogs" });

                try
                {
                    StreamReader reader = new StreamReader(context.Request.Body);
                    requestFromPost = await reader.ReadToEndAsync();

                    IGenericEntity dtve = new GenericEntityJson();
                    var dtv = JsonConvert.DeserializeObject(requestFromPost);
                    dtve.InitializeEntity(null, null, dtv);

                    UnsubLib.UnsubLib nw = new UnsubLib.UnsubLib("UnsubClient", this.ConnectionString);
                    switch (dtve.GetS("m"))
                    {
                        case "IsUnsub":
                            result = await nw.ServerIsUnsub(requestFromPost);
                            break;

                        case "IsUnsubList":
                            result = await nw.ServerIsUnsubList(requestFromPost);
                            break;

                        case "GetCampaigns":
                            result = await nw.GetCampaigns();
                            break;

                        case "ForceUnsub":
                            result = await nw.ServerForceUnsub(requestFromPost);
                            break;

                        default:
                            File.AppendAllText("UnsubClient.log", $@"{DateTime.Now}::{requestFromPost}::Unknown method" +
                                Environment.NewLine);
                            break;
                    }

                }
                catch (Exception ex)
                {
                    File.AppendAllText("UnsubClient.log", $@"{DateTime.Now}::{requestFromPost}::{ex.ToString()}" +
                                Environment.NewLine);
                }

                context.Response.StatusCode = 200;
                context.Response.ContentType = "application/json";
                context.Response.ContentLength = result.Length;
                await context.Response.WriteAsync(result);
            });
        }
    }
}
