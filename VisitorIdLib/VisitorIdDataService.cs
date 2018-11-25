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
        public Dictionary<string, List<(string Domain, List<(string Md5provider, string EmailProviderSeq)>)>> VisitorIdMd5ProviderSequences = new Dictionary<string, List<(string Domain, List<(string Md5provider, string EmailProviderSeq)>)>>();
        public Dictionary<string, List<string>> VisitorIdEmailProviderSequences = new Dictionary<string, List<string>>();
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

            foreach (var afidCfg in gc.GetL("Config/VisitorIdMd5ProviderSequences"))
            {
                string afid = afidCfg.GetS("afid");
                List<(string Domain, List<(string Md5provider, string EmailProviderSeq)>)> afidSeqs = new List<(string Domain, List<(string Md5provider, string EmailProviderSeq)>)>();
                foreach (var afidCfgSeq in  afidCfg.GetL("seqs"))
                {
                    string domain = afidCfgSeq.GetS("dom");
                    List<(string Md5provider, string EmailProviderSeq)> md5seq = new List<(string Md5provider, string EmailProviderSeq)>();
                    foreach (var dgvipm in afidCfgSeq.GetL("seq"))
                    {
                        string md5ProviderStr = dgvipm.GetS("");
                        string[] md5ProviderStrParts = md5ProviderStr.Split('|');
                        md5seq.Add((md5ProviderStrParts[0], 
                            md5ProviderStrParts.Length > 1 ? md5ProviderStrParts[1] : null));
                    }
                    afidSeqs.Add((domain, md5seq));
                }
                VisitorIdMd5ProviderSequences.Add(afid, afidSeqs);
            }
            foreach (var gvip in gc.GetL("Config/VisitorIdEmailProviderSequences"))
            {
                string emProviderSeqName = gvip.GetS("name");
                List<string> dseq = new List<string>();
                foreach (var dgvip in gvip.GetL("seq"))
                {
                    dseq.Add(dgvip.GetS(""));
                }
                VisitorIdEmailProviderSequences.Add(emProviderSeqName, dseq);
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
        // ProviderMd5ToEmailResponse - email | failuretype | success
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
                    string ret = null;
                    IGenericEntity op = await TowerWrapper.ProcessTowerMessage(context, this.TowerEncryptionKey, Err);
                    if (op != null) ret = await SaveSession(context, "Tower", 2, 7, op.GetS("sesid"), emailMd5, "", op.GetS("qs"), opaque);
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

            // Fix this to use afid before regex
            // A client with many domains under a single afid could still be very slow
            // A siteid could eliminate that performance issue though in general
            // behavior will likely be the same for all sites under an afid.

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
            return x ?? "";
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

            // I search legacy for plaintext - I can convert this to a service / provider
            //  - when legacy is searched, the md5 is saved into legacy
            // I then test other plain text providers - all can be services

            if (String.IsNullOrEmpty(bEmail)) // Search Legacy for plaintext
            {
                IGenericEntity geplain = await ConsumerRepository.PlainTextFromMd5(this.VisitorIdConnectionString, bMd5, 240);
                bEmail = Blank(geplain.GetS("Email"));

                // Events are dropped on every provider hit, success or failure

                if (!String.IsNullOrEmpty(bEmail))
                {
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

            // Each md5 provider needs to be associated to a list of email providers to test

            int plainTypeId = PlainImpressionTypeId;
            if (String.IsNullOrEmpty(bEmail)) // Search Services for plaintext
            {
                // Try to get plain text
                plainTypeId = 9; /*PlainNone*/
                if (serviceName == "Tower")
                {
                    bEmail = Blank(await TowerWrapper.CallTowerEmailApi(context, bMd5, bOpaque, 
                        this.TowerEmailApiUrl, this.TowerEmailApiKey, Err));
                    if (!String.IsNullOrEmpty(bEmail)) plainTypeId = PlainImpressionTypeId;
                }
            }

            // No need for impressions, always just request/response from provider

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
