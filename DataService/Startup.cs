using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System.Text;
using GenericEntity;
using Newtonsoft.Json;
using System.Threading;
using Jw = Utility.JsonWrapper;
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Configuration;
using System.IO;
using Utility;
using System.Security.Cryptography;
using System.Web;
using Microsoft.Extensions.Primitives;

namespace DataService
{
    public class Startup
    {
        public string ConnectionString;
        public string ConfigurationKey;

        public string TowerEmailApiUrl;
        public string TowerEmailApiKey;
        public string TowerDataDbConnectionString;
        public byte[] TowerPixelImage;
        public string TowerEncryptionKey;
        public string ContentType;
        public string OnPointConsoleUrl;
        public string OnPointConsoleTowerDomain;
        public string VisitorIdConnectionString;
        public List<string> VisitorIdProviderSequence = new List<string>();
        public int VisitorIdCookieExpDays = 10;

        public Dictionary<string, IGenericEntity> Providers = new Dictionary<string, IGenericEntity>();

        public Dictionary<string, int> ServiceMd5ImpressionTypeId = new Dictionary<string, int>()
        {
            { "TestService0", 10 },
            { "TestService1", 11 },
            { "Tower", 2 }
        };

        public Dictionary<string, int> ServicePlainImpressionTypeId = new Dictionary<string, int>()
        {
            { "TestService0", 12 },
            { "TestService1", 13 },
            { "Tower", 7 }
        };

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

            File.AppendAllText("DataService.log", $@"{DateTime.Now}::Starting" +
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

                this.TowerDataDbConnectionString = gc.GetS("Config/TowerDataDbConnectionString");
                this.TowerEmailApiUrl = gc.GetS("Config/TowerEmailApiUrl");
                this.TowerEmailApiKey = gc.GetS("Config/TowerEmailApiKey");
                this.TowerPixelImage = Convert.FromBase64String(gc.GetS("Config/TowerContentBase64"));
                this.TowerEncryptionKey = gc.GetS("Config/TowerEncryptionKey");
                this.ContentType = gc.GetS("Config/TowerContentType");
                this.OnPointConsoleUrl = gc.GetS("Config/OnPointConsoleUrl");
                this.OnPointConsoleTowerDomain = gc.GetS("Config/OnPointConsoleTowerDomain");
                this.VisitorIdConnectionString = gc.GetS("Config/VisitorIdConnectionString");
                string visitorIdProviderSequence = gc.GetS("Config/VisitorIdProviderSequence");
                IGenericEntity gvips = new GenericEntityJson();
                var gvipsstate = JsonConvert.DeserializeObject(visitorIdProviderSequence);
                gvips.InitializeEntity(null, null, gvipsstate);
                foreach (var gvip in gvips.GetL(""))
                {
                    this.VisitorIdProviderSequence.Add(gvip.GetS(""));
                }
                this.VisitorIdCookieExpDays = Int32.TryParse(gc.GetS("Config/VisitorIdCookieExpDays"), out this.VisitorIdCookieExpDays)
                    ? this.VisitorIdCookieExpDays : 10;  // ugly, should add a GetS that takes/returns a default value

                result = SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                            "SelectProvider",
                            "{}",
                            "").GetAwaiter().GetResult();
                IGenericEntity gp = new GenericEntityJson();
                var gpstate = JsonConvert.DeserializeObject(result);
                gp.InitializeEntity(null, null, gpstate);

                foreach (var provider in gp.GetL(""))
                {
                    this.Providers.Add(provider.GetS("Id"), provider);
                }
            }
            catch (Exception ex)
            {
                File.AppendAllText("DataService.log", $@"{DateTime.Now}::{ex.ToString()}" + Environment.NewLine);
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
                        case "OnPointConsoleLiveFeed":
                            result = await SaveOnPointConsoleLiveFeed(requestFromPost);
                            break;
                        case "OnPointConsoleLiveEmailEvent":
                            result = await SaveOnPointConsoleLiveEmailEvent(requestFromPost);
                            break;
                        case "VisitorId":
                            int idx = Int32.Parse(context.Request.Query["i"]);
                            string sid = context.Request.Query["sd"];
                            if (String.IsNullOrEmpty(sid)) sid = Guid.NewGuid().ToString();
                            string qs = context.Request.Query["qs"];
                            string opaque = context.Request.Query["op"];
                            bool succ = context.Request.Query["succ"] == "1" ? true : false;

                            result = await DoVisitorId(context, idx, sid, opaque, qs, succ);
                            context.Response.StatusCode = 200;
                            context.Response.ContentType = "application/json";
                            context.Response.ContentLength = result.Length;
                            break;
                        case "TestService":
                            int idx1 = Int32.Parse(context.Request.Query["i"]);
                            if (idx1%2 == 0)
                                result = Jw.Json(new { t0email = "t0@hotmail.com", t0md5 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });
                            else if (idx1%2 == 1)
                                result = Jw.Json(new { t1email = "t1@hotmail.com", t1md5 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });
                            else
                                result = Jw.Json(new { result = "NoMd5" });

                            context.Response.StatusCode = 200;
                            context.Response.ContentType = "application/json";
                            context.Response.ContentLength = result.Length;
                            break;
                        case "SaveSession":
                            string encssemail = context.Request.Query["e"];
                            var byt = Convert.FromBase64String(encssemail);
                            var ssemail = System.Text.Encoding.UTF8.GetString(byt, 0, byt.Length);
                            string ssmd5 = context.Request.Query["md5"];
                            string sssn = context.Request.Query["sn"];
                            string sssid = context.Request.Query["sd"];
                            string ssqs = context.Request.Query["qs"];
                            string ssopaque = context.Request.Query["op"];

                            result = await SaveSession(context, sssn, ServiceMd5ImpressionTypeId[sssn],
                                !String.IsNullOrEmpty(ssemail) ? ServicePlainImpressionTypeId[sssn] : 0,
                                sssid, ssmd5, ssemail, ssqs, ssopaque);

                            context.Response.StatusCode = 200;
                            context.Response.ContentType = "application/json";
                            context.Response.ContentLength = result.Length;
                            break;
                        default:
                            File.AppendAllText("DataService.log", $@"{DateTime.Now}::{requestFromPost}::Unknown method" + Environment.NewLine);
                            break;
                    }
                    await context.Response.WriteAsync(result);
                }
                else if (!String.IsNullOrEmpty(context.Request.Query["eqs"]))
                {
                    string eqs = context.Request.Query["eqs"].ToString();
                    string ret = await ProcessTowerMessage(context, eqs);
                    context.Response.StatusCode = 200;
                    context.Response.ContentType = "application/json";
                    context.Response.ContentLength = ret.Length;
                    await context.Response.WriteAsync(ret);
                }
                else
                {
                    string ret = "{\"Error\":\"Unknown method\", \"ip\":\"" +
                        context.Connection.RemoteIpAddress + "\"}";
                    context.Response.StatusCode = 200;
                    context.Response.ContentType = "application/json";
                    context.Response.ContentLength = ret.Length;
                    //X-Content-Type-Options: nosniff
                    await context.Response.WriteAsync(ret);
                }
            }
            catch (Exception ex)
            {
                await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                        "TowerVisitorErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1,
                            Proc = "TowerPixelCapture",
                            Meth = "Start",
                            Desc = Utility.Hashing.EncodeTo64($@"{requestFromPost}"),
                            Msg = Utility.Hashing.EncodeTo64(ex.ToString())
                        }),
                        "");
            }
        } 
        
        public static string ReplaceToken(string tokenized, string sesid, string opaque)
        {
            return tokenized.Replace("[=SESSIONID=]", sesid).Replace("[=OPAQUE=]", opaque);
        }

        public async Task<string> DoVisitorId(HttpContext context, int idx, string sid, 
            string opaque, string qstr, bool succ)
        {
            string ckMd5 = "";
            string ckEmail = "";
            try
            {
                int nextIdx = idx;

                while (nextIdx < this.VisitorIdProviderSequence.Count)
                {
                    var nextTask = this.VisitorIdProviderSequence[nextIdx];

                    if (nextTask.ToLower() == "cookie")
                    {
                        string cookieValueFromReq = context.Request.Cookies["vidck"];

                        if (!String.IsNullOrEmpty(cookieValueFromReq))
                        {
                            IGenericEntity gc = new GenericEntityJson();
                            var gcstate = JsonConvert.DeserializeObject(cookieValueFromReq);
                            gc.InitializeEntity(null, null, gcstate);
                            ckMd5 = gc.GetS("Md5");
                            if (!String.IsNullOrEmpty(ckMd5))
                            {
                                ckEmail = gc.GetS("Em");
                                await SaveSession(context, "cookie", 1, 4, sid, ckMd5, ckEmail, qstr, opaque);
                            }
                        }
                        nextIdx++;
                        continue;
                    }
                    else if (nextTask.ToLower() == "continue")
                    {
                        nextIdx++;
                        continue;
                    }
                    else if (nextTask.ToLower() == "continueonsuccess")
                    {
                        if (succ)
                        {
                            nextIdx++;
                            continue;
                        }
                        else
                        {
                            return Jw.Json(new { done = "1", ckmd5 = ckMd5, ckemail = ckEmail, sesid = sid });
                        }
                    }
                    else if (nextTask.ToLower() == "breakonsuccess")
                    {
                        if (succ)
                        {
                            return Jw.Json(new { done = "1", ckmd5 = ckMd5, ckemail = ckEmail, sesid = sid });
                        }
                        else
                        {
                            nextIdx++;
                            continue;
                        }
                    }
                    else if (nextTask.ToLower() == "break")
                    {
                        return Jw.Json(new { done = "1", ckmd5 = ckMd5, ckemail = ckEmail, sesid = sid });
                    }
                    else if (nextTask[0] == '@')
                    {
                        var s = this.Providers[nextTask.Substring(1)];
                        if (!String.IsNullOrEmpty(s.GetS("Config/Url")))
                        {
                            return Jw.Json(new
                            {
                                name = s.GetS("Nm"),
                                url = ReplaceToken(s.GetS("Config/Url"), sid, opaque),
                                fetchParms = s.GetS("Config/FetchParms"),
                                transform = s.GetS("Config/Transform"),
                                fetchType = s.GetS("Config/FetchType"),
                                saveSession = s.GetS("Config/SaveSession"),
                                imgFlag = s.GetS("Config/ImgFlag"),
                                sesid = sid,
                                idx = nextIdx + 1,
                                ckmd5 = (ckMd5 == null ? "" : ckMd5),
                                ckemail = (ckEmail == null ? "" : ckEmail)
                            },
                            new bool[] { true, true, false, false, true, true, true, true, true, true, true });
                        }
                        else if (!String.IsNullOrEmpty(s.GetS("Config/ScriptUrl")))
                        {
                            return Jw.Json(new
                            {
                                name = s.GetS("Nm"),
                                scriptUrl = ReplaceToken(s.GetS("Config/ScriptUrl"), sid, opaque),
                                globalObject = s.GetS("Config/GlobalObject"),
                                strategy = ReplaceToken(s.GetS("Config/Strategy"), sid, opaque),
                                saveSession = s.GetS("Config/SaveSession"),
                                sesid = sid,
                                idx = nextIdx + 1,
                                ckmd5 = ckMd5,
                                ckemail = ckEmail
                            },
                            new bool[] { true, true, true, false, true, true, true, true, true });
                        }
                        else
                        {
                            await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                                    "VisitorIdErrorLog",
                                    Jw.Json(new
                                    {
                                        Sev = 1000,
                                        Proc = "DataService",
                                        Meth = "DoVisitorId",
                                        Desc = Utility.Hashing.EncodeTo64("Neither URL nor Script"),
                                        Msg = Utility.Hashing.EncodeTo64($"{s.GetS("")}")
                                    }),
                                    "");
                            nextIdx++;
                        }
                    }
                    else
                    {
                        await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                                    "VisitorIdErrorLog",
                                    Jw.Json(new
                                    {
                                        Sev = 1000,
                                        Proc = "DataService",
                                        Meth = "DoVisitorId",
                                        Desc = Utility.Hashing.EncodeTo64("Unknown Task Type"),
                                        Msg = Utility.Hashing.EncodeTo64($"{nextTask}")
                                    }),
                                    "");
                        nextIdx++;
                    }
                } 
            }
            catch (Exception ex)
            {
                await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                        "VisitorIdErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1000,
                            Proc = "DataService",
                            Meth = "DoVisitorId",
                            Desc = Utility.Hashing.EncodeTo64("Exception"),
                            Msg = Utility.Hashing.EncodeTo64(ex.ToString())
                        }),
                        "");
            }
            return Jw.Json(new { done = "1", ckmd5 = ckMd5, ckemail = ckEmail });
        }

        public string Blank(string x)
        {
            return (x == null) ? "" : x;
        }

        public async Task<string> SaveSession(HttpContext context, string serviceName, int M5dImpressionTypeId,
            int PlainImpressionTypeId, string sessionId, string md5,
            string email, string queryString, string opaque)
        {
            string bEmail = Blank(email);
            string bSessionId = Blank(sessionId);
            string bMd5 = Blank(md5);
            string bQueryString = Blank(queryString);
            string bOpaque = Blank(opaque);
            string bIp = (context.Connection.RemoteIpAddress != null) ?
                context.Connection.RemoteIpAddress.ToString() :
                "";
            string bUserAgent = (!StringValues.IsNullOrEmpty(context.Request.Headers["User-Agent"])) ?
                context.Request.Headers["User-Agent"].ToString() :
                "";

            if (String.IsNullOrEmpty(md5)) return Jw.Json(new { Result = "Failure" });

            if (String.IsNullOrEmpty(bEmail)) // Search Legacy for plaintext
            {
                string lpfRes = await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                    "Md5ToLegacyEmail",
                    Jw.Json(new { Md5It = M5dImpressionTypeId, Sid = bSessionId, Md5 = bMd5,
                        Ip = bIp, Qs = bQueryString, Ua = bUserAgent, Op = bOpaque
                    }),
                    "", 240);
                IGenericEntity geplain = new GenericEntityJson();
                var stateplain = (JObject)JsonConvert.DeserializeObject(lpfRes);
                geplain.InitializeEntity(null, null, stateplain);
                bEmail = Blank(geplain.GetS("Email"));

                if (!String.IsNullOrEmpty(bEmail))
                {
                    // Already created the Impression is spMd5ToLegacyEmail
                    //firstName = geplain.GetS("Fn");
                    //lastName = geplain.GetS("Ln");
                    //dateOfBirth = geplain.GetS("Dob");
                    //EmIt = Int32.Parse(geplain.GetS("EmIt"));
                    SetCookie(context, "vidck",
                        Jw.Json(new { Sid = bSessionId, Md5 = bMd5, Em = bEmail
                        }), this.VisitorIdCookieExpDays);

                    return Jw.Json(new { email = bEmail, md5 = bMd5 });
                }
            }

            int plainTypeId = PlainImpressionTypeId;
            if (String.IsNullOrEmpty(bEmail)) // Search Services for plaintext
            {
                // Try to get plain text
                plainTypeId = 9; /*PlainNone*/
                if (serviceName == "Tower")
                {
                    bEmail = Blank(await CallTowerEmailApi(context, bMd5, bOpaque));
                    if (!String.IsNullOrEmpty(bEmail)) plainTypeId = PlainImpressionTypeId;
                }
            }

            try
            {
                string anteRes = await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                        "InsertImpression",
                        Jw.Json(new
                        {
                            Md5It = M5dImpressionTypeId,
                            EmIt = plainTypeId,
                            Sid = bSessionId,
                            Em = bEmail,
                            Md5 = bMd5,
                            Ip = bIp,
                            Qs = bQueryString,
                            Ua = bUserAgent,
                            Op = bOpaque
                        }),
                        "");
                IGenericEntity anteGe = new GenericEntityJson();
                var anteTs = (JObject)JsonConvert.DeserializeObject(anteRes);
                anteGe.InitializeEntity(null, null, anteTs);
                bEmail = Blank(anteGe.GetS("Email"));
                //firstName = anteGe.GetS("Fn");
                //lastName = anteGe.GetS("Ln");
                //dateOfBirth = anteGe.GetS("Dob");
            }
            catch (Exception exInsertImpression)
            {
                await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                    "VisitorIdErrorLog",
                    Jw.Json(new
                    {
                        Sev = 1000,
                        Proc = "DataService",
                        Meth = "SaveSession",
                        Desc = Utility.Hashing.EncodeTo64("Exception"),
                        Msg = Utility.Hashing.EncodeTo64("InsertImpression fails: " + bEmail + "::" + exInsertImpression.ToString())
                    }),
                    "");
            }

            SetCookie(context, "vidck", 
                Jw.Json(new { Sid = bSessionId, Md5 = md5, Em = bEmail }), this.VisitorIdCookieExpDays);

            // If we do this here we have to get the extra fields if the email
            // was already in the cookie
            // I think the posts to console should be fed off of the Impression
            // table by a scheduled job, instead.
            //await PostVisitorIdToConsole(plainText, firstName, lastName,
            //            dateOfBirth, emailSource, dom);

            return Jw.Json(new { email = bEmail, md5 = bMd5 });
        }        

        public void SetCookie(HttpContext ctx, string key, string value, int? expireTime)
        {
            CookieOptions option = new CookieOptions();
            option.Path = "/";
            option.SameSite = SameSiteMode.None;
            option.HttpOnly = false;

            if (expireTime.HasValue)
                option.Expires = DateTime.Now.AddMinutes(expireTime.Value);
            else
                option.Expires = DateTime.Now.AddMilliseconds(10);

            ctx.Response.Cookies.Append(key, value, option);
        }

        public void DeleteCookie(HttpContext ctx, string key)
        {
            ctx.Response.Cookies.Delete(key);
        }

        public async Task<string> SaveOnPointConsoleLiveFeed(string request)
        {
            string result = Jw.Json(new { Result = "Failure" });
            try
            {
                return await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                        "SaveOnPointConsoleLiveFeed",
                        "",
                        request);
            }
            catch (Exception ex)
            {
                await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                                "OnPointConsoleErrorLog",
                                Jw.Json(new
                                {
                                    Sev = 1000,
                                    Proc = "DataService",
                                    Meth = "SaveOnPointConsoleLiveFeed - SaveOnPointConsoleLiveFeed Failed",
                                    Desc = Utility.Hashing.EncodeTo64(request),
                                    Msg = Utility.Hashing.EncodeTo64(ex.ToString())
                                }),
                                "");
            }
            return result;
        }

        public async Task<string> SaveOnPointConsoleLiveEmailEvent(string request)
        {
            string result = Jw.Json(new { Result = "Failure" });
            try
            {
                return await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                        "SaveOnPointConsoleLiveEmailEvent",
                        "",
                        request);
            }
            catch (Exception ex)
            {
                await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                                "OnPointConsoleErrorLog",
                                Jw.Json(new
                                {
                                    Sev = 1000,
                                    Proc = "DataService",
                                    Meth = "SaveOnPointConsoleLiveEmailEvent - Insert Failed",
                                    Desc = Utility.Hashing.EncodeTo64(request),
                                    Msg = Utility.Hashing.EncodeTo64(ex.ToString())
                                }),
                                "");
            }
            return result;
        }

        public async Task PostVisitorIdToConsole(string plainTextEmail, string firstName, string lastName,
            string dateOfBirth, string emailSource, string domain)
        {
            await Utility.ProtocolClient.HttpPostAsync(this.OnPointConsoleUrl,
                    Jw.Json(new
                    {
                        header = Jw.Json(new { svc = 1, page = -1 }, new bool[] { false, false }),
                        body = Jw.Json(new
                        {
                            domain_id = this.OnPointConsoleTowerDomain,
                            email = plainTextEmail,
                            first_name = firstName,
                            last_name = lastName,
                            dob = dateOfBirth,
                            email_source = emailSource,
                            isFinal = "true",
                            label_domain = domain
                        })
                    }, new bool[] { false, false }),
                    "application/json");
        }        

        public static int PadCount(string str)
        {
            switch (str.Length % 4) 
            {
                case 0: return 0;
                case 2: return 2; 
                case 3: return 1; 
                default:
                    throw new System.Exception("Illegal base64url string!");
            }
        }

        private string Decrypt(string encryptedText, byte[] key)
        {
            RijndaelManaged aesEncryption = new RijndaelManaged();
            aesEncryption.BlockSize = 128;
            aesEncryption.KeySize = 128;

            aesEncryption.Mode = CipherMode.ECB;
            aesEncryption.Padding = PaddingMode.PKCS7;
            aesEncryption.Key = key;
            ICryptoTransform decrypto = aesEncryption.CreateDecryptor();
            byte[] encryptedBytes = Convert.FromBase64String(encryptedText);
            byte[] decryptedData = decrypto.TransformFinalBlock(encryptedBytes, 0, encryptedBytes.Length);
            return ASCIIEncoding.UTF8.GetString(decryptedData);
        }

        public async Task<string> CallTowerEmailApi(HttpContext context, string md5, string opaque)
        {
            string towerEmailPlainText = "";
            try
            {
                string towerEmailApi = this.TowerEmailApiUrl + "?api_key=" + this.TowerEmailApiKey + "&md5_email=" + md5;
                var jsonPlainEmail = await Utility.ProtocolClient.HttpGetAsync(towerEmailApi);
                await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                    "VisitorIdErrorLog",
                    Jw.Json(new
                    {
                        Sev = 1,
                        Proc = "DataService",
                        Meth = "CallTowerEmailApi",
                        Desc = Utility.Hashing.EncodeTo64("Tracking"),
                        Msg = Utility.Hashing.EncodeTo64("::ip=" + context.Connection.RemoteIpAddress + "::" + (!String.IsNullOrEmpty(jsonPlainEmail.Item2)
                            ? "CallEmailApi(Tower): " + md5 + "::" + jsonPlainEmail.Item2
                            : "CallEmailApi(Tower): " + md5 + "::" + "Null or empty jsonPlainEmail"))
                    }),
                    "");
                if (!String.IsNullOrEmpty(jsonPlainEmail.Item2) && jsonPlainEmail.Item1)
                {
                    IGenericEntity te = new GenericEntityJson();
                    var ts = (JObject)JsonConvert.DeserializeObject(jsonPlainEmail.Item2);
                    te.InitializeEntity(null, null, ts);
                    if (te.GetS("target_email") != null)
                    {
                        if (te.GetS("target_email").Length > 3)
                        {
                            towerEmailPlainText = te.GetS("target_email");
                        }
                    }
                    else
                    {
                        await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                            "VisitorIdErrorLog",
                            Jw.Json(new
                            {
                                Sev = 1,
                                Proc = "DataService",
                                Meth = "CallTowerEmailApi",
                                Desc = Utility.Hashing.EncodeTo64("Tracking"),
                                Msg = Utility.Hashing.EncodeTo64("::ip=" + context.Connection.RemoteIpAddress + "::" + ((jsonPlainEmail.Item2 != null)
                                    ? "CallEmailApi(Tower) Returned Null or Short Email: " + md5 + "::" + "|" + jsonPlainEmail.Item2 + "|"
                                    : "CallEmailApi(Tower) Returned Null or Short Email: " + md5 + "::" + "Null jsonPlainEmail"))
                            }),
                            "");
                    }
                }
            }
            catch (Exception tgException)
            {
                await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                    "VisitorIdErrorLog",
                    Jw.Json(new
                    {
                        Sev = 1000,
                        Proc = "DataService",
                        Meth = "CallTowerEmailApi",
                        Desc = Utility.Hashing.EncodeTo64("Exception"),
                        Msg = Utility.Hashing.EncodeTo64("TowerDataEmailApiFailed: " + $"{md5}||{opaque}" + "::" + tgException.ToString())
                    }),
                    "");
            }

            return towerEmailPlainText;
        }

        public async Task<string> ProcessTowerMessage(HttpContext context, string rawstring)
        {
            string pRawString = "";
            string opaque = "";
            string emailMd5 = "";

            await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                        "VisitorIdErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1,
                            Proc = "DataService",
                            Meth = "ProcessTowerMessage",
                            Desc = Utility.Hashing.EncodeTo64("Tracking"),
                            Msg = Utility.Hashing.EncodeTo64("Entry: " + rawstring + "::ip=" + context.Connection.RemoteIpAddress)
                        }),
                        "");

            try
            {
                string[] a = rawstring.Split("  ");
                a[a.Length - 1] = a[a.Length - 1].PadRight(a[a.Length - 1].Length + PadCount(a[a.Length - 1]), '=');
                pRawString = String.Join("\r\n", a);
                pRawString = pRawString.Replace('-', '+').Replace('_', '/');
            }
            catch (Exception ex)
            {
                await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                        "VisitorIdErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1000,
                            Proc = "DataService",
                            Meth = "ProcessTowerMessage",
                            Desc = Utility.Hashing.EncodeTo64("Exception"),
                            Msg = Utility.Hashing.EncodeTo64("Step1Fail " + $"string error::{rawstring}" + 
                                "::" + ex.ToString() + "::ip=" + context.Connection.RemoteIpAddress)
                        }),
                        "");
            }

            try
            {
                byte[] key = Utility.Hashing.StringToByteArray(this.TowerEncryptionKey);
                string result = Decrypt(pRawString, key);
                if (result.Contains("md5_email"))
                {
                    await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                        "VisitorIdErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1,
                            Proc = "DataService",
                            Meth = "ProcessTowerMessage",
                            Desc = Utility.Hashing.EncodeTo64("Tracking"),
                            Msg = Utility.Hashing.EncodeTo64("Step2Success: " + "Found md5" + "::" + result + "::ip=" + context.Connection.RemoteIpAddress)
                        }),
                        "");
                    var parsedstring = HttpUtility.ParseQueryString(result);
                    emailMd5 = parsedstring["md5_email"].ToString();
                    if (parsedstring["label"] != null)
                    {
                        opaque = parsedstring["label"].ToString();
                    }
                }
                else
                {
                    await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                        "VisitorIdErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1,
                            Proc = "DataService",
                            Meth = "ProcessTowerMessage",
                            Desc = Utility.Hashing.EncodeTo64("Error"),
                            Msg = Utility.Hashing.EncodeTo64("Step2Fail: " + "No md5" + "::" + result + "::ip=" + context.Connection.RemoteIpAddress)
                        }),
                        "");
                }
            }
            catch (Exception ex)
            {
                await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                        "VisitorIdErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1000,
                            Proc = "DataService",
                            Meth = "ProcessTowerMessage - Step3Fail",
                            Desc = Utility.Hashing.EncodeTo64("Exception"),
                            Msg = Utility.Hashing.EncodeTo64("Step3Fail: " + $"decrypt error::{rawstring}" + "::" +
                                ex.ToString() + "::ip=" + context.Connection.RemoteIpAddress)
                        }),
                        "");
            }

            if (String.IsNullOrEmpty(emailMd5) || 
                emailMd5.ToLower() == "none" || emailMd5.Length != 32)
            {
                if (!String.IsNullOrEmpty(emailMd5) && emailMd5.Length != 32)
                {
                    await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                    "VisitorIdErrorLog",
                    Jw.Json(new
                    {
                        Sev = 100,
                        Proc = "DataService",
                        Meth = "ProcessTowerMessage",
                        Desc = Utility.Hashing.EncodeTo64("Error"),
                        Msg = Utility.Hashing.EncodeTo64("Md5 is invalid: " + $"{emailMd5}" + "::ip=" + context.Connection.RemoteIpAddress)
                    }),
                    "");
                }

                return Jw.Json(new { Result = "Failure" });
            }

            try
            {

                await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                   "VisitorIdErrorLog",
                   Jw.Json(new
                   {
                       Sev = 1,
                       Proc = "DataService",
                       Meth = "ProcessTowerMessage",
                       Desc = Utility.Hashing.EncodeTo64("Tracking"),
                       Msg = Utility.Hashing.EncodeTo64("Before Parsing Label: " + $"{opaque}" + "::ip=" + context.Connection.RemoteIpAddress)
                   }),
                   "");

                byte[] byt = Convert.FromBase64String(opaque);
                string jsopaque = System.Text.Encoding.UTF8.GetString(byt, 0, byt.Length);
                IGenericEntity op = new GenericEntityJson();
                var opstate = JsonConvert.DeserializeObject(jsopaque);
                op.InitializeEntity(null, null, opstate);

                return await SaveSession(context, "Tower", 2, 7, op.GetS("sesid"), emailMd5, "", op.GetS("qs"), opaque);
            }
            catch (Exception ex)
            {
                try
                {
                    await SqlWrapper.SqlServerProviderEntry(this.VisitorIdConnectionString,
                        "VisitorIdErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1000,
                            Proc = "DataService",
                            Meth = "ProcessTowerMessage",
                            Desc = Utility.Hashing.EncodeTo64("Exception"),
                            Msg = Utility.Hashing.EncodeTo64("OuterException: " + ex.ToString() + "::ip=" + context.Connection.RemoteIpAddress)
                        }),
                        "");
                }
                catch (Exception inex)
                {
                    File.AppendAllText("DataService.log", $@"InsertErrorLog Failed::OuterException::{DateTime.Now}::{inex.ToString()}" +
                                Environment.NewLine);
                }
            }

            return Jw.Json(new { Result = "Failure" });
        }
    }
}
