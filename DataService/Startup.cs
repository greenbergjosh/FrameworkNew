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

                        default:
                            File.AppendAllText("DataService.log", $@"{DateTime.Now}::{requestFromPost}::Unknown method" + Environment.NewLine);
                            break;
                    }
                    await context.Response.WriteAsync(result);
                }
                else if (!String.IsNullOrEmpty(context.Request.Query["eqs"]))
                {
                    await ProcessTowerPixelCapture(context.Request.Query["eqs"].ToString());
                    context.Response.ContentType = ContentType;
                    context.Response.Headers.ContentLength = TowerPixelImage.Length;
                    await context.Response.Body.WriteAsync(TowerPixelImage, 0, TowerPixelImage.Length);
                }
                else if (!String.IsNullOrEmpty(context.Request.Query["md5"]))
                {
                    string nf = Jw.Json(new { Email = "NotFound" });
                    context.Response.StatusCode = 200;
                    await context.Response.WriteAsync(nf);
                }
            }
            catch (Exception ex)
            {
                await SqlWrapper.InsertErrorLog(this.TowerDataDbConnectionString, 1, "TowerPixelCapture", "ProcessTowerPixelCapture", $@"{DateTime.Now}::{requestFromPost}", ex.ToString());
            }
        }

        public async Task<string> SaveOnPointConsoleLiveFeed(string request)
        {
            return await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                        "SaveOnPointConsoleLiveFeed",
                        "",
                        request);
        }

        public async Task ProcessTowerPixelCapture(string rawstring)
        {
            try
            {
                string[] a = rawstring.Split("  ");
                a[a.Length - 1] = a[a.Length - 1].PadRight(a[a.Length - 1].Length + PadCount(a[a.Length - 1]), '=');
                rawstring = String.Join("\r\n", a);
                rawstring = rawstring.Replace('-', '+').Replace('_', '/');
            }
            catch (Exception ex)
            {
                await SqlWrapper.InsertErrorLog(this.TowerDataDbConnectionString, 1, "TowerPixelCapture", "ProcessTowerPixelCapture", $"{DateTime.Now}::string error::{rawstring}", ex.ToString());
            }

            try
            {
                byte[] key = Utility.Hashing.StringToByteArray(this.TowerEncryptionKey);
                string result = Decrypt(rawstring, key);
                if (result.Contains("md5_email"))
                {
                    var parsedstring = HttpUtility.ParseQueryString(result);
                    string md5value = parsedstring["md5_email"].ToString();

                    string labelvalue = "";
                    if (parsedstring["label"] != null)
                    {
                        labelvalue = parsedstring["label"].ToString();
                    }
                    await ProcessTowerMessage(md5value, labelvalue);
                }
                else
                {
                    await SqlWrapper.InsertErrorLog(this.TowerDataDbConnectionString, 1, "TowerPixelCapture", "ProcessTowerPixelCapture", $"{DateTime.Now}::{result}", "No md5");
                }
            }
            catch (Exception ex)
            {
                File.AppendAllText("DataService.log", $@"{DateTime.Now}::Decrypt error: {rawstring}::{ex.ToString()}" + Environment.NewLine);
                await SqlWrapper.InsertErrorLog(this.TowerDataDbConnectionString, 1, "TowerPixelCapture", "ProcessTowerPixelCapture", $"{DateTime.Now}::decrypt error::{rawstring}", ex.ToString());
            }
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

        public static byte[] ToByteArray(String HexString)
        {
            int NumberChars = HexString.Length;
            byte[] bytes = new byte[NumberChars / 2];
            for (int i = 0; i < NumberChars; i += 2)
            {
                bytes[i / 2] = Convert.ToByte(HexString.Substring(i, 2), 16);
            }
            return bytes;
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

                if (!string.IsNullOrEmpty(emailMd5) && emailMd5.ToLower() == "none")
                {
                    await SqlWrapper.InsertErrorLog(this.TowerDataDbConnectionString, 1, "TowerPixelCapture",
                        "Main", $"{emailMd5}||{label}||{dom}||{page}", "None");
                }
                else if (!string.IsNullOrEmpty(emailMd5) && emailMd5.Length == 32)
                {
                    string lpfRes = await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                        "LogPixelFire",
                        Jw.Json(new { Em = emailMd5, Lb = label, Dm = dom, Pg = page }),
                        "");
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
                        try
                        {
                            string towerEmailApi = this.TowerEmailApiUrl + "?api_key=" + this.TowerEmailApiKey + "&md5_email=" + emailMd5;
                            string jsonPlainEmail = await Utility.ProtocolClient.HttpGetAsync(towerEmailApi);
                            await SqlWrapper.InsertErrorLog(this.TowerDataDbConnectionString, 50, "TowerPixelCapture",
                                "CallEmailApi", emailMd5, jsonPlainEmail);
                            IGenericEntity te = new GenericEntityJson();
                            var ts = (JObject)JsonConvert.DeserializeObject(jsonPlainEmail);
                            te.InitializeEntity(null, null, ts);
                            if (te.GetS("target_email").Length > 3)
                            {
                                emailSource = "tower";
                                plainText = te.GetS("target_email");
                            }
                        }
                        catch (Exception tgException)
                        {
                            await SqlWrapper.InsertErrorLog(this.TowerDataDbConnectionString, 1000, "TowerPixelCapture",
                                    "TowerDataEmailApiFailed", $"{emailMd5}||{label}||{dom}||{page}", tgException.ToString());
                        }

                        if (plainText != null)
                        {
                            string anteRes = await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                                "AddNewTowerEmail",
                                Jw.Json(new { Email = plainText }),
                                "");
                            IGenericEntity anteGe = new GenericEntityJson();
                            var anteTs = (JObject)JsonConvert.DeserializeObject(anteRes);
                            anteGe.InitializeEntity(null, null, anteTs);
                            plainText = geplain.GetS("Email");
                            firstName = geplain.GetS("Fn");
                            lastName = geplain.GetS("Ln");
                            dateOfBirth = geplain.GetS("Dob");
                        }
                    }

                    if (plainText != null)
                    {
                        await Utility.ProtocolClient.HttpPostAsync(this.OnPointConsoleUrl,
                            Jw.Json(new { header = Jw.Json(new { svc = 1, page = -1 }, new bool[] { false, false }),
                                           body = Jw.Json(new { domain_id = this.OnPointConsoleTowerDomain,
                                               email = plainText,
                                               first_name = firstName,
                                               last_name = lastName,
                                               dob = dateOfBirth,
                                               email_source = emailSource,
                                               isFinal = "true",
                                               label_domain = dom
                                           })}, new bool[] { false, false }),
                            "application/json");
                    }
                }
                else
                {
                    await SqlWrapper.InsertErrorLog(this.TowerDataDbConnectionString, 1000, "TowerPixelCapture",
                        "Main", "Invalid query string",
                        $"{emailMd5}||{label}||{dom}||{page}");
                }

            }
            catch (Exception ex)
            {
                try
                {
                    await SqlWrapper.InsertErrorLog(this.TowerDataDbConnectionString, 1000, "TowerPixelCapture",
                        "Main", "", ex.ToString());
                }
                catch (Exception inex)
                {
                    File.AppendAllText("DataService.log", $@"InsertErrorLog Failed::{DateTime.Now}::{inex.ToString()}" +
                                Environment.NewLine);
                }
            }
        }
    }
}
