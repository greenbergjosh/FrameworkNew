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
        public FrameworkWrapper Fw;

        public Guid RsConfigGuid;
        public string TowerEmailApiUrl;
        public string TowerEmailApiKey;
        public string TowerEncryptionKey;
        public Dictionary<string, List<(string Domain, List<(string Md5provider, string EmailProviderSeq)>)>> VisitorIdMd5ProviderSequences = new Dictionary<string, List<(string Domain, List<(string Md5provider, string EmailProviderSeq)>)>>();
        public Dictionary<string, List<string>> VisitorIdEmailProviderSequences = new Dictionary<string, List<string>>();
        public int VisitorIdCookieExpDays = 10;

        public static int sequenceIndex;

        public void Config(FrameworkWrapper fw)
        {
            this.RsConfigGuid = new Guid(fw.StartupConfiguration.GetS("Config/RsConfigGuid"));
            this.TowerEmailApiUrl = fw.StartupConfiguration.GetS("Config/TowerEmailApiUrl");
            this.TowerEmailApiKey = fw.StartupConfiguration.GetS("Config/TowerEmailApiKey");
            this.TowerEncryptionKey = fw.StartupConfiguration.GetS("Config/TowerEncryptionKey");

            foreach (var afidCfg in fw.StartupConfiguration.GetL("Config/VisitorIdMd5ProviderSequences"))
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
            foreach (var gvip in fw.StartupConfiguration.GetL("Config/VisitorIdEmailProviderSequences"))
            {
                string emProviderSeqName = gvip.GetS("name");
                List<string> dseq = new List<string>();
                foreach (var dgvip in gvip.GetL("seq"))
                {
                    dseq.Add(dgvip.GetS(""));
                }
                VisitorIdEmailProviderSequences.Add(emProviderSeqName, dseq);
            }
            this.VisitorIdCookieExpDays = Int32.TryParse(fw.StartupConfiguration.GetS("Config/VisitorIdCookieExpDays"), out this.VisitorIdCookieExpDays)
                ? this.VisitorIdCookieExpDays : 10;  // ugly, should add a GetS that takes/returns a default value
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
                            result = await DoVisitorId(this.Fw, context);
                            await WriteResponse(context, result);
                            break;
                        case "SaveSession":
                            result = await SaveSession(this.Fw, context);
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
                            await this.Fw.Err(1000, "Start", "Error", "Unknown request: " + requestFromPost); 
                            break;
                    }
                    await context.Response.WriteAsync(result);
                }
                else if (!String.IsNullOrEmpty(context.Request.Query["eqs"]))
                {
                    string ret = null;
                    IGenericEntity op = await TowerWrapper.ProcessTowerMessage(this.Fw, context, this.TowerEncryptionKey);
                    if (op != null) ret = await SaveSession(this.Fw, context, "Tower", op.GetS("sesid"), op.GetS("md5"), "", 
                        op.GetS("qs"), op.GetS("opaque"), op.GetS("vieps"));
                    await WriteResponse(context, ret);
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

        // await ConsumerRepository.SaveMd5ToContact("ConsumerRepository", ckMd5, 1);
        // Need ConsumerRepository.SaveEmailPlainTextToContact()

        public async Task<string> DoVisitorId(FrameworkWrapper fw, HttpContext c)
        {
            // Consider an IGenericEntity that wraps the request dictionary
            int idx = c.Get("i", 0, x => Int32.Parse(x));
            string sid = c.Get("sd", Guid.NewGuid().ToString());
            string qstr = c.Get("qs", "");
            string opaque = c.Get("op", "");
            bool succ = c.Get("succ", false, x => x == "1" ? true : false);

            Uri u = new Uri(qstr);
            string host = u.Host ?? "";
            string path = u.AbsolutePath ?? "";
            string qury = u.Query ?? "";

            IGenericEntity opge = Jw.JsonToGenericEntity(opaque);
            string afid = opge.GetS("afid");

            // Consider accepting an existing Guid from opaque.rsid and using it or dropping
            // events to it, in addition to the events we drop specifically for vid
            Guid rsInstance = Guid.NewGuid();
            if (idx == 0)
            {
                EdwBulkEvent be = new EdwBulkEvent();
                be.AddRS(EdwBulkEvent.EdwType.Immediate, new Guid(sid), DateTime.UtcNow,
                    PL.O(new { qs = qstr, op = opaque, ip = c.Connection.RemoteIpAddress,
                        h = host, p = path, q = qury}), this.RsConfigGuid);
                be.AddEvent(Guid.NewGuid(), DateTime.UtcNow,
                    new Dictionary<string, object>() { { "vid", rsInstance.ToString() } },
                    null, PL.O(new { et = "SessionInitiate", qs = qstr, op = opaque,
                        ip = c.Connection.RemoteIpAddress,
                        h = host, p = path, q = qury }));
                await fw.SiloWriter.Write(be, 1);
            }
            
            List<(string Md5provider, string EmailProviderSeq)> visitorIdMd5ProviderSequence = null;
            foreach (var kvp in VisitorIdMd5ProviderSequences[afid])
            {
                if (host != "" && ((host == kvp.Domain) || host.EndsWith("." + kvp.Domain)))
                {
                    visitorIdMd5ProviderSequence = kvp.Item2;
                    break;
                }
                else if (kvp.Domain == "default") // allow default option anywhere in list
                {
                    if (visitorIdMd5ProviderSequence == null) visitorIdMd5ProviderSequence = kvp.Item2;
                }
            }

            try
            {
                string md5 = "";
                string eml = "";
                int nextIdx = idx;

                while (nextIdx < visitorIdMd5ProviderSequence.Count)
                {
                    var nextTask = visitorIdMd5ProviderSequence[nextIdx].Md5provider;
                    var visitorIdEmailProviderSequence = visitorIdMd5ProviderSequence[nextIdx].EmailProviderSeq;

                    if (nextTask.ToLower() == "cookie")
                    {
                        string cookieValueFromReq = c.Request.Cookies["vidck"];

                        if (!String.IsNullOrEmpty(cookieValueFromReq))
                        {
                            IGenericEntity gc = Jw.JsonToGenericEntity(cookieValueFromReq);
                            
                            md5 = gc.GetS("Md5");
                            if (!String.IsNullOrEmpty(md5))
                            {
                                eml = gc.GetS("Em");
                                await SaveSession(fw, c, "cookie", sid, md5, eml, qstr, opaque, visitorIdEmailProviderSequence);
                            }
                        }
                        nextIdx++;
                        continue;
                    }
                    else if (nextTask.ToLower() == "continue")
                    {
                        nextIdx++;
                        md5 = "";
                        eml = "";
                        continue;
                    }
                    else if (nextTask.ToLower() == "continueonsuccess")
                    {
                        if (succ)
                        {
                            nextIdx++;
                            md5 = "";
                            eml = "";
                            continue;
                        }
                        else
                        {
                            return Jw.Json(new { done = "1", ckmd5 = md5, ckemail = eml, sesid = sid });
                        }
                    }
                    else if (nextTask.ToLower() == "breakonsuccess")
                    {
                        if (succ)
                        {
                            return Jw.Json(new { done = "1", ckmd5 = md5, ckemail = eml, sesid = sid });
                        }
                        else
                        {
                            nextIdx++;
                            md5 = "";
                            eml = "";
                            continue;
                        }
                    }
                    else if (nextTask.ToLower() == "break")
                    {
                        return Jw.Json(new { done = "1", ckmd5 = md5, ckemail = eml, sesid = sid });
                    }
                    else if (nextTask[0] == '@')
                    {
                        IGenericEntity s = await fw.Entities.GetEntityGe(new Guid(nextTask.Substring(1)));
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
                                vieps = visitorIdEmailProviderSequence
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
                                vieps = visitorIdEmailProviderSequence
                            },
                            new bool[] { true, true, true, false, true, true, true, true, true });
                        }
                        else
                        {
                            await fw.Err(1000, "DoVisitorId", "Error", "Neither URL nor Script: " + s.GetS(""));
                            nextIdx++;
                        }
                    }
                    else
                    {
                        await fw.Err(1000, "DoVisitorId", "Error", "Unknown Task Type: " + nextTask);
                        nextIdx++;
                    }
                }
            }
            catch (Exception ex)
            {
                await fw.Err(1000, "DoVisitorId", "Exception", ex.ToString());
            }
            return Jw.Json(new { done = "1", ckmd5 = ckMd5, ckemail = ckEmail });
        }

        public async Task<string> SaveSession(FrameworkWrapper fw, HttpContext c, string serviceName, string sessionId, string md5,
            string email, string queryString, string opaque, string visitorIdEmailProviderSequence)
        {
            string ip = c.Ip();
            string userAgent = c.UserAgent();

            if (String.IsNullOrEmpty(md5)) return Jw.Json(new { Result = "Failure" });

            string em = await DoEmailProviders(fw, c, md5, email, visitorIdEmailProviderSequence);

            c.SetCookie("vidck",
                Jw.Json(new
                {
                    Sid = sessionId,
                    Md5 = md5,
                    Em = em
                }), this.VisitorIdCookieExpDays);

            return Jw.Json(new { email = em, md5 = md5 });
        }

        public async Task<string> SaveSession(FrameworkWrapper fw, HttpContext c)
        {
            return await SaveSession(fw, c, c.Get("sn", ""), c.Get("sd", ""),
                c.Get("md5", ""), c.Get("e", "", x => Hashing.DecodeUtf8From64(x)),
                c.Get("qs", ""), c.Get("op", ""), c.Get("vieps", ""));
        }

        public async Task<string> DoEmailProviders(FrameworkWrapper fw, HttpContext context, string md5, 
            string email, string visitorIdEmailProviderSequence)
        {
            string eml = "";
            int slotnum = 0;
            foreach (var s in this.VisitorIdEmailProviderSequences[visitorIdEmailProviderSequence])
            {
                if (s.ToLower() == "stopifemail")
                {
                    if (!String.IsNullOrEmpty(email)) return email;
                }
                else if (s.ToLower() == "cookie")
                {
                    string cookieValueFromReq = context.Request.Cookies["vidck"];

                    if (!String.IsNullOrEmpty(cookieValueFromReq))
                    {
                        IGenericEntity gc = Jw.JsonToGenericEntity(cookieValueFromReq);
                        if (!String.IsNullOrEmpty(md5)) eml = gc.GetS("Em");
                    }
                    slotnum++;
                    continue;
                }
                else if (s.ToLower() == "continue")
                {
                    slotnum++;
                    eml = "";
                    continue;
                }
                else if (s.ToLower() == "continueonsuccess")
                {
                    if (!String.IsNullOrEmpty(eml))
                    {
                        slotnum++;
                        eml = "";
                        continue;
                    }
                    else
                    {
                        return eml;
                    }
                }
                else if (s.ToLower() == "breakonsuccess")
                {
                    if (!String.IsNullOrEmpty(eml))
                    {
                        return eml;
                    }
                    else
                    {
                        slotnum++;
                        eml = "";
                        continue;
                    }
                }
                else if (s.ToLower() == "break")
                {
                    return eml;
                }
                else if (s[0] == '@')
                {
                    IGenericEntity p = await fw.Entities.GetEntityGe(new Guid(s.Substring(1)));
                    string lbm = await fw.Entities.GetEntity(new Guid(p.GetS("LbmId")));
                    eml = (string)await fw.RoslynWrapper[lbm](new { ge = p }, new StateWrapper());
                    slotnum++;
                }
                else
                {
                    await fw.Err(1000, "DoVisitorId", "Error", "Unknown Task Type: " + slotnum);
                    slotnum++;
                }
            }

            //IGenericEntity geplain = await ConsumerRepository.PlainTextFromMd5(this.VisitorIdConnectionString, bMd5, 240);
            //bEmail = Blank(geplain.GetS("Email"));

            //int plainTypeId = PlainImpressionTypeId;
            //if (String.IsNullOrEmpty(bEmail)) // Search Services for plaintext
            //{
            //    // Try to get plain text
            //    plainTypeId = 9; /*PlainNone*/
            //    if (serviceName == "Tower")
            //    {
            //        bEmail = Blank(await TowerWrapper.CallTowerEmailApi(context, bMd5, bOpaque,
            //            this.TowerEmailApiUrl, this.TowerEmailApiKey, Err));
            //        if (!String.IsNullOrEmpty(bEmail)) plainTypeId = PlainImpressionTypeId;
            //    }
            //}
        }
    }
}
