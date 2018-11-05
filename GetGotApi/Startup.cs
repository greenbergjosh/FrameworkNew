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
using System.Text;

namespace GetGotApi
{
    public class Startup
    {
        public int MAX_TEMPLATES_PER_CALL = 20;
        public int LIMIT_TEMPLATE_META_SEARCH = 20;

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
                        ""MessageBodyTemplateQueryId"":""41487182-a6df-429c-8f5f-3e9f203e93ea"",
                        ""MessageBodyTemplateQueryUrl"":""//retailerservice.com/gettemplatequery"",
                        ""MessageBodyTemplateQuery"":
                            [
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

                string[] splitQueryPart = queryPart.Split('(');
                string queryPartType = splitQueryPart[0];
                string queryPartBody = queryPart.Substring(queryPartType.Length + 1,
                    queryPart.Length - queryPartType.Length - 2);

                int x = 1;

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
                            //result = await GetCampaignTemplates(gc);
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

        public async Task<List<string>> GetCampaignTemplates(IGenericEntity r)
        {
            string cid = r.GetS("c");
            int oidx = Int32.Parse(r.GetS("o"));
            int iidx = Int32.Parse(r.GetS("i"));

            string cRes = await SqlWrapper.SqlServerProviderEntry(this.GetGotDbConnectionString,
                    "SelectCampaign",
                    Jw.Json(new
                    {
                        Id = cid
                    }),
                    "", 240);

            IGenericEntity c = new GenericEntityJson();
            c.InitializeEntity(null, null, JsonConvert.DeserializeObject(cRes));

            IEnumerable<IGenericEntity> queryParts = null;

            var queryId = c.GetS("Payload/MessageBodyTemplateQueryId");
            var queryUrl = c.GetS("Payload/MessageBodyTemplateQueryUrl");
            var query = c.GetL("Payload/MessageBodyTemplateQuery");
            var advertiserId = c.GetS("Payload/AdvertiserUserId");

            if (!String.IsNullOrEmpty(queryId))
            {
                string queryRes = await SqlWrapper.SqlServerProviderEntry(this.GetGotDbConnectionString,
                    "SelectMessageBodyTemplateQuery",
                    Jw.Json(new
                    {
                        Id = queryId
                    }),
                    "", 240);
                IGenericEntity queryge = new GenericEntityJson();
                queryge.InitializeEntity(null, null, JsonConvert.DeserializeObject(queryRes));
                queryParts = queryge.GetL("QueryJson");
            }
            else if (!String.IsNullOrEmpty(queryUrl))
            {
                IGenericEntity urlge = await GetValueFromClientPair(queryUrl);
                queryParts = urlge.GetL("QueryJson");
            }
            else if (query != null)
            {
                queryParts = query;
            }

            List<string> templates = new List<string>();

            if (queryParts == null)
            {
                templates.Add($"//getgot.com/api {{'m':'GetTemplate', 'id':'00000000-0000-0000-0000-000000000000'}}");
                return templates;
            }

            foreach (var eQueryPart in queryParts)
            {
                var queryPart = eQueryPart.GetS("");
                (string queryPartType, string queryPartBody) = queryPart.SplitOnChar('(');
                queryPartBody = (queryPartBody.Length == 0) ? "" : 
                    queryPartBody.Substring(0, queryPartBody.Length - 1);

                switch (queryPartType)
                {
                    case "id":
                        templates.Add($"//getgot.com/api {{'m':'GetTemplate', 'id':'{queryPartBody}'}}");
                        break;
                    case "exid":
                        templates.Add($"//getgot.com/api {{'m':'GetTemplate', 'exid':'{queryPartBody}', 'advid':'{advertiserId}'}}");
                        break;
                    case "nm":
                        templates.Add($"//getgot.com/api {{'m':'GetTemplate', 'nm':'{queryPartBody}', 'advid':'{advertiserId}'}}");
                        break;
                    case "meta":
                        IGenericEntity metage = await SelectMessageBodyTemplatesByMeta(queryPartBody, advertiserId);
                        foreach (var metageitem in metage.GetL(""))
                            templates.Add($"//getgot.com/api {{'m':'GetTemplate', 'id':'{metageitem}'}}");
                        break;
                    case "idurl":
                        string id = await GetValueFromClientPair(queryPartBody, "id");
                        templates.Add($"//getgot.com/api {{'m':'GetTemplate', 'id':'{id}'}}");
                        break;
                    case "nmurl":
                        string nm = await GetValueFromClientPair(queryPartBody, "nm");
                        templates.Add($"//getgot.com/api {{'m':'GetTemplate', 'nm':'{nm}', 'advid':'{advertiserId}'}}");
                        break;
                    case "exidurl":
                        string exid = await GetValueFromClientPair(queryPartBody, "exid");
                        templates.Add($"//getgot.com/api {{'m':'GetTemplate', 'exid':'{exid}', 'advid':'{advertiserId}'}}");
                        break;
                    case "metaurl":
                        IGenericEntity metaurlge = await SelectMessageBodyTemplatesByMeta(queryPartBody, advertiserId);
                        foreach (var metageitem in metaurlge.GetL(""))
                            templates.Add($"//getgot.com/api {{'m':'GetTemplate', 'id':'{metageitem}'}}");
                        break;
                    case "defnm":
                        templates.Add($"//getgot.com/api {{'m':'GetTemplate', 'nm':'{queryPartBody}', " +
                            "'advid':'00000000-0000-0000-0000-000000000000'}");
                        break;
                    case "defmeta":
                        IGenericEntity defmetage = await SelectMessageBodyTemplatesByMeta(queryPartBody, "00000000-0000-0000-0000-000000000000");
                        foreach (var metageitem in defmetage.GetL(""))
                            templates.Add($"//getgot.com/api {{'m':'GetTemplate', 'id':'{metageitem}'}}");
                        break;
                    case "exhost":
                        templates.Add(queryPartBody);
                        break;
                }
            }

            if (templates.Count == 0)
            {
                templates.Add($"//getgot.com/api {{'m':'GetTemplate', 'id':'00000000-0000-0000-0000-000000000000'}}");
            }

            return templates;
        }

        public async Task<IGenericEntity> SelectMessageBodyTemplatesByMeta(string meta, string advertiserId)
        {
            (var pos, var neg) = SplitMetaString(meta, ' ');
            string metaRes = await SqlWrapper.SqlServerProviderEntry(this.GetGotDbConnectionString,
                "SelectMessageBodyTemplatesByMeta",
                Jw.Json(new
                {
                    AId = advertiserId,
                    Pos = pos,
                    Neg = neg,
                    Lim = this.LIMIT_TEMPLATE_META_SEARCH
                }),
                "", 240);
            IGenericEntity metage = new GenericEntityJson();
            metage.InitializeEntity(null, null, JsonConvert.DeserializeObject(metaRes));
            return metage;
        }

        public async Task<string> GetValueFromClientPair(string queryPart, string key)
        {
            IGenericEntity rge = await GetValueFromClientPair(queryPart);
            return rge.GetS(key);
        }

        public async Task<IGenericEntity> GetValueFromClientPair(string queryPart)
        {
            (string clientUrlPart, string clientPostPart) = queryPart.SplitOnChar(' ');
            string ret = "{}";
            try
            {
                if (clientPostPart.Trim().Length > 0)
                {
                    var getRet = await Utility.ProtocolClient.HttpGetAsync(clientUrlPart, 2);
                    if (getRet.Item1) ret = getRet.Item2;
                }
                else
                {
                    ret = await Utility.ProtocolClient.HttpPostAsync(clientUrlPart, clientPostPart, "application/json", 2);
                }
                IGenericEntity rge = new GenericEntityJson();
                rge.InitializeEntity(null, null, JsonConvert.DeserializeObject(ret));
                return rge;
            }
            catch (Exception exCallRetailer)
            {

            }

            IGenericEntity dge = new GenericEntityJson();
            dge.InitializeEntity(null, null, JsonConvert.DeserializeObject("{}"));
            return dge;
        }

        public static (string Pos, string Neg) SplitMetaString(string s, char c)
        {
            if (s == null) return (Pos: null, Neg: null);
            if (s == "") return (Pos: null, Neg: null);
            string[] metas = s.Split(c);
            if (metas.Length == 0) return (Pos: null, Neg: null);
            StringBuilder pos = new StringBuilder();
            StringBuilder neg = new StringBuilder();
            foreach (var meta in metas)
            {
                if (meta.Trim()[0] == '!') neg.Append(meta.Trim().Substring(1) + " ");
                else pos.Append(meta.Trim() + " ");
            }
            if (neg.Length > 0) neg.Remove(neg.Length - 1, 1);
            if (pos.Length > 0) pos.Remove(pos.Length - 1, 1);

            return (Pos: pos.ToString(), Neg: neg.ToString());
        }
    }
}
