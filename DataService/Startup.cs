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
                        default:
                            File.AppendAllText("DataService.log", $@"{DateTime.Now}::{requestFromPost}::Unknown method" + Environment.NewLine);
                            break;
                    }
                    await context.Response.WriteAsync(result);
                }
                else if (!String.IsNullOrEmpty(context.Request.Query["eqs"]))
                {
                    string eqs = context.Request.Query["eqs"].ToString();
                    await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                        "TowerVisitorErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1,
                            Proc = "TowerPixelCapture",
                            Meth = "Router",
                            Desc = "",
                            Msg = Utility.Hashing.EncodeTo64(eqs)
                        }),
                        "");

                    string label = await ProcessTowerPixelCapture(eqs);
                    if (label == "testvisitorid")
                    {
                        //string ret = "{\"k2\":\"v2\"}";
                        //context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
                        string cookieValueFromReq = context.Request.Cookies["test2"];
                        if (String.IsNullOrEmpty(cookieValueFromReq))
                        {
                            SetCookie(context, "test2", "rich@hotmail.com", 30);
                        }

                        string ret = "{\"k2\":\"" + cookieValueFromReq + "\"}";
                        context.Response.StatusCode = 200;
                        context.Response.ContentType = "application/json";
                        context.Response.ContentLength = ret.Length;
                        //X-Content-Type-Options: nosniff
                        await context.Response.WriteAsync(ret);
                    }
                    else
                    {
                        //context.Response.ContentType = ContentType;
                        //context.Response.Headers.ContentLength = TowerPixelImage.Length;
                        //await context.Response.Body.WriteAsync(TowerPixelImage, 0, TowerPixelImage.Length);
                        string ret = "{\"label\":\"" + label + "\"}";
                        context.Response.StatusCode = 200;
                        context.Response.ContentType = "application/json";
                        context.Response.ContentLength = ret.Length;
                        //X-Content-Type-Options: nosniff
                        await context.Response.WriteAsync(ret);
                    }
                }
                else if (!String.IsNullOrEmpty(context.Request.Query["md5"]))
                {
                    // I don't know what this is - remove it if we don't know
                    string nf = Jw.Json(new { Email = "NotFound" });
                    context.Response.StatusCode = 200;
                    await context.Response.WriteAsync(nf);
                }
                else
                {
                    string ret = "{\"Error\":\"Unknown method\"}";
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

        public async Task<string> ProcessTowerPixelCapture(string rawstring)
        {
            string labelvalue = "";
            try
            {
                string[] a = rawstring.Split("  ");
                a[a.Length - 1] = a[a.Length - 1].PadRight(a[a.Length - 1].Length + PadCount(a[a.Length - 1]), '=');
                rawstring = String.Join("\r\n", a);
                rawstring = rawstring.Replace('-', '+').Replace('_', '/');
            }
            catch (Exception ex)
            {
                await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                        "TowerVisitorErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1000,
                            Proc = "TowerPixelCapture",
                            Meth = "ProcessTowerPixelCapture - Step1Fail",
                            Desc = Utility.Hashing.EncodeTo64($"string error::{rawstring}"),
                            Msg = Utility.Hashing.EncodeTo64(ex.ToString())
                        }),
                        "");
            }

            try
            {
                byte[] key = Utility.Hashing.StringToByteArray(this.TowerEncryptionKey);
                string result = Decrypt(rawstring, key);
                if (result.Contains("md5_email"))
                {
                    var parsedstring = HttpUtility.ParseQueryString(result);
                    string md5value = parsedstring["md5_email"].ToString();

                    
                    if (parsedstring["label"] != null)
                    {
                        labelvalue = CleanLabel(parsedstring["label"].ToString());
                    }
                    await ProcessTowerMessage(md5value, labelvalue);
                }
                else
                {
                    await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                        "TowerVisitorErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1000,
                            Proc = "TowerPixelCapture",
                            Meth = "ProcessTowerPixelCapture - Step2Fail",
                            Desc = Utility.Hashing.EncodeTo64($"{CleanLabel(result)}"),
                            Msg = Utility.Hashing.EncodeTo64("No md5")
                        }),
                        "");
                }
            }
            catch (Exception ex)
            {
                await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                        "TowerVisitorErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1000,
                            Proc = "TowerPixelCapture",
                            Meth = "ProcessTowerPixelCapture - Step3Fail",
                            Desc = Utility.Hashing.EncodeTo64($"decrypt error::{rawstring}"),
                            Msg = Utility.Hashing.EncodeTo64(ex.ToString())
                        }),
                        "");
            }

            return labelvalue;
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

        private string CleanLabel(string label)
        {
            string newlabel =  label.Replace("www.", "").Replace("http://", "").Replace("https://", "").Trim();
            return newlabel;
        }

        public async Task ProcessTowerMessage(string emailMd5, string label)
        {
            try
            {
                string dom = "";
                string page = "";
                if (label.Contains("|"))
                {
                    string[] array = label.Split('|');
                    dom = array[0];
                    page = array[1];
                }
                else
                {
                    dom = label;
                }

                if (!string.IsNullOrEmpty(emailMd5) && emailMd5.ToLower() == "none")
                {
                    await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                        "TowerVisitorErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1000,
                            Proc = "TowerPixelCapture",
                            Meth = "ProcessTowerMessage",
                            Desc = Utility.Hashing.EncodeTo64($"Md5 is empty"),
                            Msg = Utility.Hashing.EncodeTo64($"{emailMd5}||{label}||{dom}||{page}")
                        }),
                        "");
                }
                else if (!string.IsNullOrEmpty(emailMd5) && emailMd5.Length == 32)
                {
                    string lpfRes = await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                        "LogPixelFire",
                        Jw.Json(new { Em = emailMd5, Lb = label, Dm = dom, Pg = page }),
                        "", 240);
                    IGenericEntity geplain = new GenericEntityJson();
                    var stateplain = (JObject)JsonConvert.DeserializeObject(lpfRes);
                    geplain.InitializeEntity(null, null, stateplain);

                    string lpfEmRes = geplain.GetS("Result");
                    string plainText = geplain.GetS("Email");
                    string firstName = geplain.GetS("Fn");
                    string lastName = geplain.GetS("Ln");
                    string dateOfBirth = geplain.GetS("Dob");
                    string emailSource = "legacy";
                    if (lpfEmRes == "NotFound")
                    {
                        string towerEmailPlainText = null;
                        try
                        {
                            string towerEmailApi = this.TowerEmailApiUrl + "?api_key=" + this.TowerEmailApiKey + "&md5_email=" + emailMd5;
                            var jsonPlainEmail = await Utility.ProtocolClient.HttpGetAsync(towerEmailApi);
                            await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                                "TowerVisitorErrorLog",
                                Jw.Json(new
                                {
                                    Sev = 1,
                                    Proc = "TowerPixelCapture",
                                    Meth = "ProcessTowerMessage - CallEmailApi",
                                    Desc = Utility.Hashing.EncodeTo64(emailMd5),
                                    Msg = !String.IsNullOrEmpty(jsonPlainEmail.Item2) 
                                        ? Utility.Hashing.EncodeTo64(jsonPlainEmail.Item2) 
                                        : Utility.Hashing.EncodeTo64("Null or empty jsonPlainEmail")
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
                                        emailSource = "tower";
                                        towerEmailPlainText = te.GetS("target_email");
                                    }
                                }
                                else
                                {
                                    await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                                        "TowerVisitorErrorLog",
                                        Jw.Json(new
                                        {
                                            Sev = 1,
                                            Proc = "TowerPixelCapture",
                                            Meth = "ProcessTowerMessage - CallEmailApi Returned Null or Short Email",
                                            Desc = Utility.Hashing.EncodeTo64(emailMd5),
                                            Msg = jsonPlainEmail.Item2 != null
                                                ? Utility.Hashing.EncodeTo64("|" + jsonPlainEmail.Item2 + "|")
                                                : Utility.Hashing.EncodeTo64("Null jsonPlainEmail")
                                        }),
                                        "");
                                }
                            }
                        }
                        catch (Exception tgException)
                        {
                            await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                                "TowerVisitorErrorLog",
                                Jw.Json(new
                                {
                                    Sev = 1000,
                                    Proc = "TowerPixelCapture",
                                    Meth = "ProcessTowerMessage - TowerDataEmailApiFailed",
                                    Desc = Utility.Hashing.EncodeTo64($"{emailMd5}||{label}||{dom}||{page}"),
                                    Msg = Utility.Hashing.EncodeTo64(tgException.ToString())
                                }),
                                "");
                        }

                        if (towerEmailPlainText != null)
                        {
                            try
                            {
                                string anteRes = await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                                    "AddNewTowerEmail",
                                    Jw.Json(new { Email = towerEmailPlainText, Label = label }),
                                    "");
                                IGenericEntity anteGe = new GenericEntityJson();
                                var anteTs = (JObject)JsonConvert.DeserializeObject(anteRes);
                                anteGe.InitializeEntity(null, null, anteTs);
                                plainText = anteGe.GetS("Email");
                                firstName = anteGe.GetS("Fn");
                                lastName = anteGe.GetS("Ln");
                                dateOfBirth = anteGe.GetS("Dob");
                            }
                            catch (Exception exAddNewTowerEmail)
                            {
                                await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                                    "TowerVisitorErrorLog",
                                    Jw.Json(new
                                    {
                                        Sev = 1000,
                                        Proc = "TowerPixelCapture",
                                        Meth = "ProcessTowerMessage - Exception calling spAddNewTowerEmail",
                                        Desc = Utility.Hashing.EncodeTo64($"{emailMd5}||{label}||{dom}||{page}"),
                                        Msg = Utility.Hashing.EncodeTo64(exAddNewTowerEmail.ToString())
                                    }),
                                    "");
                            }
                        }
                    }

                    if (plainText != null)
                    {
                        try
                        {
                            await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                                "TowerVisitorErrorLog",
                                Jw.Json(new
                                {
                                    Sev = 1,
                                    Proc = "TowerPixelCapture",
                                    Meth = "ConsolePost",
                                    Desc = Utility.Hashing.EncodeTo64(plainText),
                                    Msg = Utility.Hashing.EncodeTo64(dom)
                                }),
                            "");

                            await Utility.ProtocolClient.HttpPostAsync(this.OnPointConsoleUrl,
                                Jw.Json(new
                                {
                                    header = Jw.Json(new { svc = 1, page = -1 }, new bool[] { false, false }),
                                    body = Jw.Json(new
                                    {
                                        domain_id = this.OnPointConsoleTowerDomain,
                                        email = plainText,
                                        first_name = firstName,
                                        last_name = lastName,
                                        dob = dateOfBirth,
                                        email_source = emailSource,
                                        isFinal = "true",
                                        label_domain = dom
                                    })
                                }, new bool[] { false, false }),
                                "application/json");
                        }
                        catch (Exception ex)
                        {
                            await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                                "TowerVisitorErrorLog",
                                Jw.Json(new
                                {
                                    Sev = 1000,
                                    Proc = "TowerPixelCapture",
                                    Meth = "ProcessTowerMessage - TowerDataEmailConsolePostError",
                                    Desc = Utility.Hashing.EncodeTo64($"{plainText}||{label}"),
                                    Msg = Utility.Hashing.EncodeTo64(ex.ToString())
                                }),
                                "");
                        }
                    }
                }
                else
                {
                    await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                        "TowerVisitorErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1000,
                            Proc = "TowerPixelCapture",
                            Meth = "ProcessTowerMessage",
                            Desc = Utility.Hashing.EncodeTo64($"Invalid query string"),
                            Msg = Utility.Hashing.EncodeTo64($"{emailMd5}||{label}||{dom}||{page}")
                        }),
                        "");
                }

            }
            catch (Exception ex)
            {
                try
                {
                    await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                        "TowerVisitorErrorLog",
                        Jw.Json(new
                        {
                            Sev = 1000,
                            Proc = "TowerPixelCapture",
                            Meth = "ProcessTowerMessage - OuterException",
                            Desc = Utility.Hashing.EncodeTo64($""),
                            Msg = Utility.Hashing.EncodeTo64(ex.ToString())
                        }),
                        "");
                }
                catch (Exception inex)
                {
                    File.AppendAllText("DataService.log", $@"InsertErrorLog Failed::OuterException::{DateTime.Now}::{inex.ToString()}" +
                                Environment.NewLine);
                }
            }
        }
    }
}
