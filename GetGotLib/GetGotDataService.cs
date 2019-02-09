using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Utility;
using Jw = Utility.JsonWrapper;

namespace GetGotLib
{
    public class GetGotDataService
    {
        public FrameworkWrapper Fw;
        public Guid RsConfigGuid;



        // GetGotOld
        public int MAX_TEMPLATES_PER_CALL = 20;
        public int LIMIT_TEMPLATE_META_SEARCH = 20;
        public string GETGOT_CONFIG = "GetGotConfig";

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
        // GetGotOld End

        public void Config(FrameworkWrapper fw)
        {
            File.AppendAllText("GetGotDebug.log", $@"In Config" + Environment.NewLine);
            try
            {
                this.Fw = fw;
                this.RsConfigGuid = new Guid(fw.StartupConfiguration.GetS("Config/RsConfigGuid"));
                File.AppendAllText("GetGotDebug.log", $@"In Config rsconfigguid=" + this.RsConfigGuid.ToString() + Environment.NewLine);
            }
            catch (Exception ex)
            {
                File.AppendAllText("GetGotDebug.log", $@"In Config ex=" + ex.ToString() + Environment.NewLine);
            }
        }
        
        public async Task Test(HttpContext c)
        {
            //Dictionary<string, string> spMap = new Dictionary<string, string>()
            //{//[dbo].[spSelectMessageBodyTemplateQuery]
            //    { "SelectConfig", "[dbo].[spSelectConfig]" },
            //    { "GetGotDbErrorLog", "[dbo].[spInsertErrorLog]" },
            //    { "SelectMessageBodyTemplatesByMeta", "[dbo].[spSelectMessageBodyTemplatesByMeta]" },
            //    { "SelectMessageBodyTemplateQuery", "[dbo].[spSelectMessageBodyTemplateQuery]" }
            //};

            //string scRes = ApiSamples["CreateCampaign"];

            //IGenericEntity ge = new GenericEntityJson();



            //ge.InitializeEntity(null, null, JsonConvert.DeserializeObject(scRes));
            //var queryParts = ge.GetL("Payload/MessageBodyTemplateQuery").ToList();
            //for (int i = 0; i < queryParts.Count; i++)
            //{
            //    var queryPart = queryParts[i].GetS("");

            //    string[] splitQueryPart = queryPart.Split('(');
            //    string queryPartType = splitQueryPart[0];
            //    string queryPartBody = queryPart.Substring(queryPartType.Length + 1,
            //        queryPart.Length - queryPartType.Length - 2);

            //    int x = 1;

            //}
        }

        public async Task Run(HttpContext context)
        {
            //await Test(context);
            string requestFromPost = "";
            File.AppendAllText("GetGotDebug.log", $@"In Run" + Environment.NewLine);
            var result = Jw.Json(new { Error = "SeeLogs" });
            try
            {
                StreamReader reader = new StreamReader(context.Request.Body);
                requestFromPost = await reader.ReadToEndAsync();
                File.AppendAllText("GetGotDebug.log", $@"In Run Req=" + requestFromPost + Environment.NewLine);
                if (!String.IsNullOrEmpty(context.Request.Query["m"]))
                {
                    string m = context.Request.Query["m"];
                    File.AppendAllText("GetGotDebug.log", $@"In Run m=" + requestFromPost + Environment.NewLine);
                    switch (m)
                    {
                        case "SelectSubCampaignDraft":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "", 1);
                            break;

                        case "CreateImpression":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "CreateClick":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "CreateAction":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "GenerateInbox":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "GetRecentPosts":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "CreateUser":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "CreateUserSignup":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "SelectInterestGroups":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "CreateCampaign":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "SelectMessageBodyTemplatesByMeta":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "SelectMessageBodyTemplateQuery":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "ValidateUser":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "CreateSubCampaign":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "UpdatePassword":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "UserContactList":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "VerifyUser":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "FollowUsers":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "SelectInterests":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "SelectInfluencers":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "CreateSubCampaignDraft":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "SelectCampaign":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        case "SelectSubCampaign":
                            result = await Fw.RootDataLayerClient.RetrieveEntry(GETGOT_CONFIG,
                                m, requestFromPost, "{}", 1);
                            break;

                        default:
                            await this.Fw.Err(1000, "Start", "Error", "Unknown request: " + requestFromPost);
                            break;
                    }
                }
                else
                {
                    await this.Fw.Err(1000, "Start", "Tracking", "Unknown request: " + requestFromPost);
                }
            }
            catch (Exception ex)
            {
                await this.Fw.Err(1000, "Start", "Exception", $@"{requestFromPost}::{ex.ToString()}");
            }
            await WriteResponse(context, result);
        }

        public async Task WriteResponse(HttpContext context, string resp)
        {
            context.Response.StatusCode = 200;
            context.Response.ContentType = "application/json";
            context.Response.ContentLength = resp.Length;
            await context.Response.WriteAsync(resp);
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

            string cRes = await Fw.RootDataLayerClient.RetrieveEntry(this.GetGotDbConnectionString,
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
                string queryRes = await Fw.RootDataLayerClient.RetrieveEntry(this.GetGotDbConnectionString,
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
            string metaRes = await Fw.RootDataLayerClient.RetrieveEntry(this.GetGotDbConnectionString,
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
                    var getRet = await Utility.ProtocolClient.HttpGetAsync(clientUrlPart, null, 2);
                    if (getRet.Item1) ret = getRet.body;
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

        public void Junk()
        {
            //case "UserSignupEvent":
            //    result = await UserSignupEvent(this.Fw, context, requestFromPost);
            //    break;
            //case "CreateUser":
            //    //id: uuid (app is responsible for generating the id)
            //    //h: handle
            //    //e: email
            //    //p: phone

            //    //c: Status code (to be defined, success or error)
            //    //m: Status message


            //    //                       Id uniqueidentifier    N'$.u.Id',   
            //    //         H varchar(100)		N'$.u.H',
            //    //Em varchar(350)		N'$.u.Em',
            //    //Ph varchar(30)			N'$.u.Ph',
            //    //Dob datetime2(1)	    N'$.u.Dob',
            //    //USId uniqueidentifier    N'$.u.USId'
            //    //                           $.u.Pwd 
            //    result = await CreateUser(this.Fw, context, requestFromPost);
            //    break;
            //case "ValidateUser":
            //    //h: handle
            //    //p: phone
            //    //vc: verification code

            //    //c: Status code (to be defined, success or error)
            //    //m: Status message
            //    result = await ValidateUser(this.Fw, context, requestFromPost);
            //    break;
            //case "CreateNewPassword":
            //    //id: 
            //    //vc: verification code
            //    //pwd: hashed password
            //    //d: device info

            //    //t: User token
            //    //c: Status code (to be defined, success or error)
            //    //m: Status message
            //    result = await CreateNewPassword(this.Fw, context, requestFromPost);
            //    break;
            //case "UpdateUserProfile":
            //    //t: User token
            //    //cts: JSON array of JSON objects. Each object represents a contact and will contain at least the following:
            //    //fn: firstname
            //    //ln: lastname
            //    //e: email  char[254] -- I don't think it's necessary to create an array at this point -- ariel 
            //    //p: phone char[20] -- same as email - no need for array at this point
            //    //dob: date of birth
            //    //gender: char[1] -- m/f

            //    //c: Status code (to be defined, success or error)
            //    //m: Status message
            //    result = await UpdateUserProfile(this.Fw, context, requestFromPost);
            //    break;
            //case "GetContactList":
            //    //t: User token

            //    //c: Status code (to be defined, success or error)
            //    //m: Status message
            //    //cts: A JSON array of JSON objects representing the contacts the user can choose to follow. Each JSON object will contain at least the following:
            //    //id: Getgot id
            //    //img: image (URL ok)
            //    //n: name
            //    result = await GetContactList(this.Fw, context, requestFromPost);
            //    break;
            //case "RegisterUser":
            //    //t: User token
            //    //ids: JSON array of Getgot ids

            //    //c: Status code (to be defined, success or error)
            //    //m: Status message
            //    result = await RegisterUser(this.Fw, context, requestFromPost);
            //    break;
            //case "GetInterestList":
            //    //t: User token

            //    //c: Status code (to be defined, success or error)
            //    //m: Status message
            //    //ints: A JSON array of JSON objects representing the interests the user can choose to follow. Each JSON object will contain at least the following:
            //    //id: Getgot id
            //    //img: image (URL ok)
            //    //n: name
            //    result = await GetInterestList(this.Fw, context, requestFromPost);
            //    break;
            //case "FollowInterests":
            //    //t: User token
            //    //ids: JSON array of Getgot interest ids

            //    //c: Status code (to be defined, success or error)
            //    //m: Status message
            //    result = await FollowInterests(this.Fw, context, requestFromPost);
            //    break;
            //case "GetInfluencerList":
            //    //t: User token

            //    //c: Status code (to be defined, success or error)
            //    //m: Status message
            //    //infs: A JSON array of JSON objects representing the influencers the user can choose to follow. Each JSON object will contain at least the following:
            //    //id: Getgot id
            //    //img: image (URL ok)
            //    //n: name
            //    result = await GetInfluencerList(this.Fw, context, requestFromPost);
            //    break;
            //case "FollowInfluencers":
            //    //t: User token
            //    //ids: JSON array of Getgot influencer ids

            //    //c: Status code (to be defined, success or error)
            //    //m: Status message
            //    result = await FollowInfluencers(this.Fw, context, requestFromPost);
            //    break;
            //case "Login":
            //    //e: email
            //    //p: phone
            //    //pwd: hashed password
            //    //d: device info
            //    //dt: device type
            //    //exp: login expiration(optional)

            //    //c: Status code (to be defined, success or error)
            //    //m: Status message
            //    //t: user token
            //    result = await Login(this.Fw, context, requestFromPost);
            //    break;
            //case "ListLoggedInDevices":
            //    //t: token

            //    //dt:[ , , ...]
            //    result = await ListLoggedInDevices(this.Fw, context, requestFromPost);
            //    break;
            //case "Logout":
            //    //t: token
            //    //dt: [optional]

            //    //c: Status code(to be defined, success or error)
            //    //m: Status message
            //    result = await Logout(this.Fw, context, requestFromPost);
            //    break;
            //case "GetLatestAppVersion":
            //    //--none--

            //    //a: Android version number
            //    //i: iOS version number
            //    result = await GetLatestAppVersion(this.Fw, context, requestFromPost);
            //    break;


        }
    }
}
