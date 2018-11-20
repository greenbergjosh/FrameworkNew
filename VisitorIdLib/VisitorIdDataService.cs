using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using Utility;
using Jw = Utility.JsonWrapper;

namespace VisitorIdLib
{
    public class VisitorIdDataService
    {
        public string TowerEmailApiUrl;
        public string TowerEmailApiKey;
        public string TowerEncryptionKey;
        public string VisitorIdConnectionString;
        public Dictionary<string, List<string>> VisitorIdProviderSequences = new Dictionary<string, List<string>>();
        public int VisitorIdCookieExpDays = 10;
        public Dictionary<string, IGenericEntity> Providers = new Dictionary<string, IGenericEntity>();

        EdwSiloLoadBalancedWriter SiloWriter;
        ErrorSiloLoadBalancedWriter ErrorWriter;

        public const string APPNAME = "VisitorId";
        public const int ERRTIMEOUT = 1;

        public static int sequenceIndex;
        public async Task Err(int severity, string method, string descriptor, string message)
        {
            await ErrorWriter.Write(new ErrorLogError(severity, APPNAME, method, descriptor, message), ERRTIMEOUT);
        }

        public void Config(IGenericEntity gc, EdwSiloLoadBalancedWriter siloWriter, ErrorSiloLoadBalancedWriter errorWriter)
        {
            this.SiloWriter = siloWriter;
            this.ErrorWriter = errorWriter;

            this.TowerEmailApiUrl = gc.GetS("Config/TowerEmailApiUrl");
            this.TowerEmailApiKey = gc.GetS("Config/TowerEmailApiKey");
            this.TowerEncryptionKey = gc.GetS("Config/TowerEncryptionKey");
            this.VisitorIdConnectionString = gc.GetS("Config/VisitorIdConnectionString");
            foreach (var gvip in gc.GetL("Config/VisitorIdProviderSequences"))
            {
                string dom = gvip.GetS("dom");
                List<string> dseq = new List <string>();
                foreach (var dgvip in gvip.GetL("seq"))
                {
                    dseq.Add(dgvip.GetS(""));
                }
                VisitorIdProviderSequences.Add(dom, dseq);
            }
            this.VisitorIdCookieExpDays = Int32.TryParse(gc.GetS("Config/VisitorIdCookieExpDays"), out this.VisitorIdCookieExpDays)
                ? this.VisitorIdCookieExpDays : 10;  // ugly, should add a GetS that takes/returns a default value

            IGenericEntity gp = SqlWrapper.SqlToGenericEntity(this.VisitorIdConnectionString,
                        "SelectProvider",
                        "{}",
                        "").GetAwaiter().GetResult();

            foreach (var provider in gp.GetL(""))
            {
                this.Providers.Add(provider.GetS("Id"), provider);
            }
        }

        //SessionInitiate, ProviderXAttempt, ProviderXCapture, ..., EmailCaptureFromWebsite
        // SI(Time, UserAgent, QueryString, IpAddress, SearchParms, DeviceType, Publisher)
        // ProviderSelected(Md5ProviderId, Slot#)  -- slot# will have to be passed between client/server
        //  SelectionFailed - this will go to errorlog, not to EDW
        // ProviderRequest - this is done from JavaScript, will not result in event
        // ProviderResponse --> md5 and [email] | failuretype | success
        //   ParseFailed - done at response type level
        //   DecryptionFailed - done at response type level
        // ProviderMd5toEmailRequest - need to know original provider id (I think this can come from savesession|opaque
        // ProviderMd5ToEmailResponse - email | faailuretype | success
        // ActualEmailCollected

        // Qs --> Domain, Publisher
        // UserAgent --> Mobile | Desktop

        // Rollup Table Definition
        // (Time, DeviceType, Domain, Publisher, Slot, Md5ProviderId, EmailProviderId, EventType {Req | RespSucc 
        //        | RespNotFound | RespParseErr | RespDescrError | RespFinalException}) 

        // App perspective - state management
        //  CarriedState --> Slot#, MdProviderId - decision is to hold state in the app and drop in each event
        //  (RS) --> Time, DeviceType, Domain, Publisher

        //                          VisitCount,   Selected, RespSucc, ActualEmailCollectedCt, ExactMatchCt, RespFail, RespNotFound, RespParseErr, RespDecrError, RespFinalException
        // Time (1/1/2018 11:00)       100  (#SI)
        //   Domain  (dmv.com)          50  (#SI where domain='dmv.com')
        //     Publisher (google)       40  (#SI where domain='dmv.com' and publisher='google') // maybe utm_* granularity
        //       Slot1
        //         Md5Provider1                      30      20                                                10          9             1            0
        //           EmailProvider1                  20      5                                                 15          10            2            3 
        //           EmailProvider2                  15      5                                                 10
        //         Md5Provider2                      10
        //           EmailProvider1
        //           EmailProvider3

        // Domain-specific provider list

        public async Task Start(HttpContext context)
        {
            string requestFromPost = "";
            var result = Jw.Json(new { Error = "SeeLogs" });
            try
            {
                StreamReader reader = new StreamReader(context.Request.Body);
                requestFromPost = await reader.ReadToEndAsync();

                if (!String.IsNullOrEmpty(context.Request.Query["m"]))
                {
                    string m = context.Request.Query["m"];
                    switch (m)
                    {
                        case "VisitorId":
                            result = await DoVisitorId(context);
                            await WriteResponse(context, result);
                            break;
                        case "SaveSession":
                            result = await SaveSession(context);
                            await WriteResponse(context, result);
                            break;
                        case "TestService":
                            int idx1 = Int32.Parse(context.Request.Query["i"]);
                            if (idx1 % 2 == 0)
                                result = Jw.Json(new { t0email = "t0@hotmail.com", t0md5 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });
                            else if (idx1 % 2 == 1)
                                result = Jw.Json(new { t1email = "t1@hotmail.com", t1md5 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });
                            else
                                result = Jw.Json(new { result = "NoMd5" });

                            await WriteResponse(context, result);
                            break;
                        default:
                            await Err(1000, "Start", "Error", "Unknown request: " + requestFromPost); 
                            break;
                    }
                    await context.Response.WriteAsync(result);
                }
                else if (!String.IsNullOrEmpty(context.Request.Query["eqs"]))
                {
                    string ret = await ProcessTowerMessage(context);
                    await WriteResponse(context, ret);
                }
                else
                {
                    await Err(1000, "Start", "Tracking", "Unknown request: " + requestFromPost);
                }
            }
            catch (Exception ex)
            {
                await Err(1000, "Start", "Exception", $@"{requestFromPost}::{ex.ToString()}");
            }
        }

        public async Task WriteResponse(HttpContext context, string resp)
        {
            context.Response.StatusCode = 200;
            context.Response.ContentType = "application/json";
            context.Response.ContentLength = resp.Length;
            await context.Response.WriteAsync(resp);
        }

        public static string ReplaceToken(string tokenized, string sesid, string opaque)
        {
            return tokenized.Replace("[=SESSIONID=]", sesid).Replace("[=OPAQUE=]", opaque);
        }

        public async Task<string> DoVisitorId(HttpContext context)
        {
            string ckMd5 = "";
            string ckEmail = "";

            int idx = Int32.Parse(context.Request.Query["i"]);
            string sid = context.Request.Query["sd"];
            if (String.IsNullOrEmpty(sid)) sid = Guid.NewGuid().ToString();
            string qstr = context.Request.Query["qs"];
            string opaque = context.Request.Query["op"];
            bool succ = context.Request.Query["succ"] == "1" ? true : false;

            Uri u = new Uri(qstr);
            string host = u.Host ?? "";
            string path = u.AbsolutePath ?? "";
            string qury = u.Query ?? "";

            IGenericEntity opge = Jw.JsonToGenericEntity(opaque);
            string afid = opge.GetS("afid");

            //Regex rgx = new Regex(@"^(.*?\.)?xyz\.com$");
            List<string> VisitorIdProviderSequence = null;
            foreach (var kvp in VisitorIdProviderSequences)
            {
                // If this becomes a performance issue
                // Don't use regex - custom parse char[]
                Regex rgx = new Regex(kvp.Key);
                if (rgx.IsMatch(host)) VisitorIdProviderSequence = kvp.Value;
            }
            if (VisitorIdProviderSequence == null)
            {
                VisitorIdProviderSequences.TryGetValue("default", out VisitorIdProviderSequence);
                if (VisitorIdProviderSequence == null)
                {
                    VisitorIdProviderSequence = new List<string>() { "cookie" };
                }
            }

            try
            {
                int nextIdx = idx;

                while (nextIdx < VisitorIdProviderSequence.Count)
                {
                    var nextTask = VisitorIdProviderSequence[nextIdx];

                    if (nextTask.ToLower() == "cookie")
                    {
                        string cookieValueFromReq = context.Request.Cookies["vidck"];

                        if (!String.IsNullOrEmpty(cookieValueFromReq))
                        {
                            IGenericEntity gc = Jw.JsonToGenericEntity(cookieValueFromReq);
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
                            await Err(1000, "DoVisitorId", "Error", "Neither URL nor Script: " + s.GetS(""));
                            nextIdx++;
                        }
                    }
                    else
                    {
                        await Err(1000, "DoVisitorId", "Error", "Unknown Task Type: " + nextTask);
                        nextIdx++;
                    }
                }
            }
            catch (Exception ex)
            {
                await Err(1000, "DoVisitorId", "Exception", ex.ToString());
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
                IGenericEntity geplain = await SqlWrapper.SqlToGenericEntity(this.VisitorIdConnectionString,
                    "Md5ToLegacyEmail",
                    Jw.Json(new
                    {
                        Md5It = M5dImpressionTypeId,
                        Sid = bSessionId,
                        Md5 = bMd5,
                        Ip = bIp,
                        Qs = bQueryString,
                        Ua = bUserAgent,
                        Op = bOpaque
                    }),
                    "", null, null, 240);
                bEmail = Blank(geplain.GetS("Email"));

                if (!String.IsNullOrEmpty(bEmail))
                {
                    // Already created the Impression in spMd5ToLegacyEmail
                    //firstName = geplain.GetS("Fn");
                    //lastName = geplain.GetS("Ln");
                    //dateOfBirth = geplain.GetS("Dob");
                    //EmIt = Int32.Parse(geplain.GetS("EmIt"));
                    HttpWrapper.SetCookie(context, "vidck",
                        Jw.Json(new
                        {
                            Sid = bSessionId,
                            Md5 = bMd5,
                            Em = bEmail
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
                IGenericEntity anteGe = await SqlWrapper.SqlToGenericEntity(this.VisitorIdConnectionString,
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
                bEmail = Blank(anteGe.GetS("Email"));
                //firstName = anteGe.GetS("Fn");
                //lastName = anteGe.GetS("Ln");
                //dateOfBirth = anteGe.GetS("Dob");
            }
            catch (Exception exInsertImpression)
            {
                await Err(1000, "SaveSession", "Exception", "InsertImpression fails: " + bEmail + "::" + exInsertImpression.ToString());
            }

            HttpWrapper.SetCookie(context, "vidck",
                Jw.Json(new { Sid = bSessionId, Md5 = md5, Em = bEmail }), this.VisitorIdCookieExpDays);

            return Jw.Json(new { email = bEmail, md5 = bMd5 });
        }

        public async Task<string> SaveSession(HttpContext context)
        {
            string encssemail = context.Request.Query["e"];
            var byt = Convert.FromBase64String(encssemail);
            var email = System.Text.Encoding.UTF8.GetString(byt, 0, byt.Length);
            string md5 = context.Request.Query["md5"];
            string serviceName = context.Request.Query["sn"];
            string sessionId = context.Request.Query["sd"];
            string queryString = context.Request.Query["qs"];
            string opaque = context.Request.Query["op"];
            int M5dImpressionTypeId = ServiceMd5ImpressionTypeId[serviceName];
            int PlainImpressionTypeId = !String.IsNullOrEmpty(email) ? ServicePlainImpressionTypeId[serviceName] : 0;

            return await SaveSession(context, serviceName, M5dImpressionTypeId, PlainImpressionTypeId, sessionId,
                md5, email, queryString, opaque);
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
                await Err(1, "CallTowerEmailApi", "Tracking",
                    "::ip=" + context.Connection.RemoteIpAddress + "::" + (!String.IsNullOrEmpty(jsonPlainEmail.Item2)
                            ? "CallEmailApi(Tower): " + md5 + "::" + jsonPlainEmail.Item2
                            : "CallEmailApi(Tower): " + md5 + "::" + "Null or empty jsonPlainEmail"));

                if (!String.IsNullOrEmpty(jsonPlainEmail.Item2) && jsonPlainEmail.Item1)
                {
                    IGenericEntity te = Jw.JsonToGenericEntity(jsonPlainEmail.Item2);
                    if (te.GetS("target_email") != null)
                    {
                        if (te.GetS("target_email").Length > 3)
                        {
                            towerEmailPlainText = te.GetS("target_email");
                        }
                    }
                    else
                    {
                        await Err(1, "CallTowerEmailApi", "Tracking", "::ip=" + context.Connection.RemoteIpAddress + "::" + ((jsonPlainEmail.Item2 != null)
                                    ? "CallEmailApi(Tower) Returned Null or Short Email: " + md5 + "::" + "|" + jsonPlainEmail.Item2 + "|"
                                    : "CallEmailApi(Tower) Returned Null or Short Email: " + md5 + "::" + "Null jsonPlainEmail"));
                    }
                }
            }
            catch (Exception tgException)
            {
                await Err(1000, "CallTowerEmailApi", "Exception", "TowerDataEmailApiFailed: " + $"{md5}||{opaque}" + "::" + tgException.ToString());
            }

            return towerEmailPlainText;
        }

        public async Task<string> ProcessTowerMessage(HttpContext context)
        {
            string pRawString = "";
            string opaque = "";
            string emailMd5 = "";

            string rawstring = context.Request.Query["eqs"].ToString();

            await Err(1, "ProcessTowerMessage", "Tracking", "Entry: " + rawstring + "::ip=" + context.Connection.RemoteIpAddress);

            try
            {
                string[] a = rawstring.Split("  ");
                a[a.Length - 1] = a[a.Length - 1].PadRight(a[a.Length - 1].Length + PadCount(a[a.Length - 1]), '=');
                pRawString = String.Join("\r\n", a);
                pRawString = pRawString.Replace('-', '+').Replace('_', '/');
            }
            catch (Exception ex)
            {
                await Err(1000, "ProcessTowerMessage", "Exception", "Step1Fail " + $"string error::{rawstring}" +
                                "::" + ex.ToString() + "::ip=" + context.Connection.RemoteIpAddress);
            }

            try
            {
                byte[] key = Utility.Hashing.StringToByteArray(this.TowerEncryptionKey);
                string result = Decrypt(pRawString, key);
                if (result.Contains("md5_email"))
                {
                    await Err(1, "ProcessTowerMessage", "Tracking", "Step2Success: " + "Found md5" + "::" + result + "::ip=" + context.Connection.RemoteIpAddress);
                    var parsedstring = HttpUtility.ParseQueryString(result);
                    emailMd5 = parsedstring["md5_email"].ToString();
                    if (parsedstring["label"] != null)
                    {
                        opaque = parsedstring["label"].ToString();
                    }
                }
                else
                {
                    await Err(1, "ProcessTowerMessage", "Error", "Step2Fail: " + "No md5" + "::" + result + "::ip=" + context.Connection.RemoteIpAddress);
                }
            }
            catch (Exception ex)
            {
                await Err(1000, "ProcessTowerMessage", "Exception", "Step3Fail: " + $"decrypt error::{rawstring}" + "::" +
                                ex.ToString() + "::ip=" + context.Connection.RemoteIpAddress);
            }

            if (String.IsNullOrEmpty(emailMd5) ||
                emailMd5.ToLower() == "none" || emailMd5.Length != 32)
            {
                if (!String.IsNullOrEmpty(emailMd5) && emailMd5.Length != 32)
                {
                    await Err(100, "ProcessTowerMessage", "Error", "Md5 is invalid: " + $"{emailMd5}" + "::ip=" + context.Connection.RemoteIpAddress);
                }

                return Jw.Json(new { Result = "Failure" });
            }

            try
            {
                await Err(1, "ProcessTowerMessage", "Tracking", "Before Parsing Label: " + $"{opaque}" + "::ip=" + context.Connection.RemoteIpAddress);

                byte[] byt = Convert.FromBase64String(opaque);
                string jsopaque = System.Text.Encoding.UTF8.GetString(byt, 0, byt.Length);
                IGenericEntity op = new GenericEntityJson();
                var opstate = JsonConvert.DeserializeObject(jsopaque);
                op.InitializeEntity(null, null, opstate);

                return await SaveSession(context, "Tower", 2, 7, op.GetS("sesid"), emailMd5, "", op.GetS("qs"), opaque);
            }
            catch (Exception ex)
            {
                await Err(1000, "ProcessTowerMessage", "Exception", "OuterException: " + ex.ToString() + "::ip=" + context.Connection.RemoteIpAddress);
            }

            return Jw.Json(new { Result = "Failure" });
        }

        public void JunkHolder()
        {
            //try
            //{
            //    //EdwSiloEndpoint.ExecuteSql("{\"TestAction\": \"Walkaway\"}", "[dbo].[spCreateTestRecord]", silo1, 3)
            //    //    .ConfigureAwait(true).GetAwaiter().GetResult();
            //    string s = "123456789012345678901234567890123456789012345678901234567890";
            //    s = s + "123456789012345678901234567890123456789012345678901234567890";
            //    EdwSiloEndpoint.ExecuteSql("{\"TestAction\": \"Success\", \"V\": \"" + s + "\"}", "[dbo].[spCreateTestRecord]", silo1, 3)
            //        .ConfigureAwait(true).GetAwaiter().GetResult();
            //}
            //catch (Exception ex)
            //{
            //    int hij = 1;
            //}

            //for (int i = 0; i < 20; i++)
            //{
            //    await siloWriter.Write("{\"TestAction\": \"Success\", \"V\": \"" + i + "\"}", 10);
            //}

            //await siloWriter.Write("{\"TestAction\": \"RemoveEndpoint\"}", 10);

            //for (int i = 20; i < 40; i++)
            //{
            //    await siloWriter.Write("{\"TestAction\": \"Success\", \"V\": \"" + i + "\"}", 10);
            //}
        }
    }
}
