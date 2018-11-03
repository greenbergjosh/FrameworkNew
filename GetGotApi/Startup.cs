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

        public static Dictionary<string, string> ApiSamples = new Dictionary<string, string>()
        {
            { "CreateCampaign",
                @"{
                    ""m"":""CreateCampaign"",
                    ""CampaignId"":""82c46a22-0d3f-4b55-84eb-60252f1b023f"",
                    ""InfluencerUserId"":""829a8a27-45a7-4396-99d3-c8a087aecb91"",
                    ""AdvertiserUserId"":""0ea87a82-d06a-41e1-9522-fced60a62099"",
                    ""FromSubCampaignId"":"""",
                    ""Payload"": {
                        ""MessageBodyTemplateQueryVerbose"":
                            [
                                {""MessageBodyTemplateQueryId"":""41487182-a6df-429c-8f5f-3e9f203e93ea""},
                                {""UrlToMessageBodyTemplateQuery"":""//retailerservice.com/gettemplatequery""},
                                {""ExternalId"":""12345""},
                                {""Id"":""1a0855f2-c7be-4eef-93b9-71339e5637a2""},
                                {""Name"":""TestTemplateOne""},
                                {""Meta"":""makeup christmas""},
                                {""Meta"":""red !holiday""},
                                {""UrlToHtml"":""//retailerservice.com/gettemplatehtml""},
                                {""UrlToId"":""//retailerservice.com/gettemplateid""},
                                {""UrlToName"":""//retailerservice.com/gettemplatename""},
                                {""UrlToMeta"":""//retailerservice.com/gettemplatemeta""},
                                {""DefaultId"":""5ca2bdea-befc-42a9-b6fa-8521b07f9cad""},
                                {""DefaultName"":""DefaultTestTemplateOne""},
                                {""DefaultMeta"":""holiday""}
                            ],
                        ""MessageBodyTemplateQuery"":
                            [
                                ""qid(41487182-a6df-429c-8f5f-3e9f203e93ea)"",
                                ""qurl(//retailerservice.com/gettemplatequery)"",
                                ""exid(12345)"",
                                ""id(1a0855f2-c7be-4eef-93b9-71339e5637a2)"",
                                ""nm(TestTemplateOne)"",
                                ""meta(makeup christmas)"",
                                ""meta(red !holiday)"",
                                ""htmurl(//retailerservice.com/gettemplatehtml)"",
                                ""idurl(//retailerservice.com/gettemplateid)"",
                                ""nmurl(//retailerservice.com/gettemplatename)"",
                                ""metaurl(//retailerservice.com/gettemplatemeta)"",
                                ""defid(5ca2bdea-befc-42a9-b6fa-8521b07f9cad)"",
                                ""defnm(DefaultTestTemplateOne)"",
                                ""defmeta(holiday)"",
                                ""htm(base64 html goes here)""
                            ],
                        ""TemplatePartTokens"":
                            [
                                {
                                    ""N"":"""",
                                    ""V"":"""",
                                    ""T"":""string|url|img|rurl""
                                }
                            ]
                    }
                }"
            },
            {"GetCampaignTemplates",
                @"{
                    ""m"":""GetCampaignTemplates"",
                    ""c"":""82c46a22-0d3f-4b55-84eb-60252f1b023f"",
                    ""o"":""0"",
                    ""i"":""0""
                }"
            }
        };

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
            string scRes = ApiSamples["CreateCampaign"];

            IGenericEntity ge = new GenericEntityJson();

            ge.InitializeEntity(null, null, JsonConvert.DeserializeObject(scRes));
            var queryParts = ge.GetL("Payload/MessageBodyTemplateQuery").ToList();
            for (int i = 0; i < queryParts.Count; i++)
            {
                var queryPart = queryParts[i].GetS("");

            }


            string requestFromPost = "";
            string resp = Jw.Json(new { Error = "SeeLogs" });
            var result = "ok";
            try
            {
                StreamReader reader = new StreamReader(context.Request.Body);
                requestFromPost = await reader.ReadToEndAsync();

                IGenericEntity gc = new GenericEntityJson();
                var gcstate = JsonConvert.DeserializeObject(requestFromPost);
                gc.InitializeEntity(null, null, gcstate);

                if (!String.IsNullOrEmpty(context.Request.Query["m"]))
                {
                    string m = context.Request.Query["m"];
                    switch (m)
                    {
                        case "CreateCampaign":
                            result = await CreateCampaign(gc);
                            break;

                        case "GetCampaignTemplates":
                            result = await GetCampaignTemplates(gc);
                            break;

                        case "CreateMessageBodyTemplateQuery":
                            //result = await CreateMessageBodyTemplateQuery(gc);
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

        public async Task<string> CreateCampaign(IGenericEntity r)
        {
            return "";
        }

        public async Task<string> GetCampaignTemplates(IGenericEntity r)
        {
            // Get the parms
            string cid = r.GetS("c");
            int oidx = Int32.Parse(r.GetS("o"));
            int iidx = Int32.Parse(r.GetS("i"));

            string scRes = await SqlWrapper.SqlServerProviderEntry(this.GetGotDbConnectionString,
                    "SelectCampaign",
                    Jw.Json(new
                    {
                        Id = cid
                    }),
                    "", 240);

            IGenericEntity ge = new GenericEntityJson();
            
            ge.InitializeEntity(null, null, JsonConvert.DeserializeObject(scRes));
            var queryParts = ge.GetL("Payload/MessageBodyTemplateQuery").ToList();
            for (int i = oidx; i < queryParts.Count; i++)
            {
                var queryPart = queryParts[i].GetS("");
                
            }


            // Ask the db for the payload - should really cache this to satisfy next call
            return "";
        }
    }
}
