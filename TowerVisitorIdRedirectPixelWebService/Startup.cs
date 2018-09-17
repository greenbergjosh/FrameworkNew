using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using GenericEntity;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Jw = Utility.JsonWrapper;

namespace TowerVisitorIdRedirectPixelWebService
{
    public class Startup
    {
        public string ConnectionString;
        public byte[] PixelImage;
        public string ContentType;
        public string AesKey;
        public string TowerEmailApiUrl;
        public string TowerEmailApiKey;

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
            this.PixelImage = Convert.FromBase64String(
                configuration.GetValue<String>("Response:PixelContentBase64"));
            this.ContentType = configuration.GetValue<String>("Response:PixelContentType");
            //this.AesKey = configuration.GetValue<String>("Encryption:Key");
            this.TowerEmailApiUrl = configuration.GetValue<String>("TowerDataEmailApi:Url");
            this.TowerEmailApiKey = configuration.GetValue<String>("TowerDataEmailApi:Key");

            app.Run(async (context) =>
            {
                string result = Jw.Json(new { Email = "NotFound" });

                try
                {
                    string emailMd5 = context.Request.Query["md5"];
                    string label = context.Request.Query["label"];

                    if (!string.IsNullOrEmpty(emailMd5) && emailMd5.ToLower() == "none")
                    {
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, "TowerPixelCapture",
                            "Main", context.Request.QueryString.ToString(), "None");
                    }
                    else if (!string.IsNullOrEmpty(emailMd5) && emailMd5.Length == 32)
                    {
                        string domain = context.Request.Query["domain"];
                        string page = context.Request.Query["page"];
                        string dm = (domain == null) ? "" : domain;
                        string pg = (page == null) ? "" : page;

                        result = await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                            "LogPixelFire",
                            Jw.Json(new { Em=emailMd5, Lb=label, Dm=dm, Pg=pg }),
                            "");

                        IGenericEntity ge = new GenericEntityJson();
                        var state = (JObject)JsonConvert.DeserializeObject(result);
                        ge.InitializeEntity(null, null, state);

                        string plainText = null;
                        if (ge.GetS("Email") == "NotFound")
                        {
                            try
                            {
                                string towerEmailApi = this.TowerEmailApiUrl + "?api_key=" + this.TowerEmailApiKey + "&md5_email=" + emailMd5;
                                string jsonPlainEmail = await Utility.ProtocolClient.HttpGetAsync(towerEmailApi);
                                await SqlWrapper.InsertErrorLog(this.ConnectionString, 50, "TowerPixelCapture",
                                    "CallEmailApi", emailMd5, jsonPlainEmail);
                                IGenericEntity te = new GenericEntityJson();
                                var ts = (JObject)JsonConvert.DeserializeObject(jsonPlainEmail);
                                te.InitializeEntity(null, null, ts);
                                if (te.GetS("target_email").Length > 3) plainText = te.GetS("target_email");
                            }
                            catch (Exception tgException)
                            {
                                // Could log this
                            }

                            if (plainText != null)
                            {
                                result = await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                                    "AddNewTowerEmail",
                                    Jw.Json(new { Email = plainText }),
                                    "");
                            }
                        }
                    }
                    else
                    {
                        string em = (emailMd5 == null) ? "null" : emailMd5;
                        string lb = (label == null) ? "null" : label;
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, "TowerPixelCapture",
                            "Main", "Invalid query string", 
                            $@"{em} :: {lb} :: ({ context.Request.Scheme}://{context.Request.Host}{context.Request.Path}{context.Request.QueryString})");
                    }

                }
                catch (Exception ex)
                {
                    try
                    {
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, "TowerPixelCapture",
                            "Main", context.Request.QueryString.ToString(), ex.ToString());
                    }
                    catch (Exception inex)
                    {

                    }
                }

                context.Response.StatusCode = 200;
                await context.Response.WriteAsync(result);
                //context.Response.ContentType = this.ContentType;
                //context.Response.Headers.ContentLength = this.PixelImage.Length;
                //await context.Response.Body.WriteAsync(this.PixelImage);
            });
        }
    }
}
