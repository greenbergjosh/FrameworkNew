using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Utility;
using Jw = Utility.JsonWrapper;

namespace VisitorIdLib
{
    public class VisitorIdDataService
    {
        public FrameworkWrapper Fw;

        public Guid RsConfigGuid;
        public string TowerEncryptionKey;
        public Dictionary<string, List<(string Domain, List<(string Md5provider, string EmailProviderSeq)>)>> VisitorIdMd5ProviderSequences = new Dictionary<string, List<(string Domain, List<(string Md5provider, string EmailProviderSeq)>)>>();
        public Dictionary<string, List<string>> VisitorIdEmailProviderSequences = new Dictionary<string, List<string>>();
        public int VisitorIdCookieExpDays = 10;

        public void Config(FrameworkWrapper fw)
        {
            this.Fw = fw;

            this.RsConfigGuid = new Guid(fw.StartupConfiguration.GetS("Config/RsConfigGuid"));
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
        
        public async Task Run(HttpContext context)
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
                            break;
                        case "SaveSession":
                            result = await SaveSession(this.Fw, context);
                            break;
                        case "TestService":
                            int idx1 = Int32.Parse(context.Request.Query["i"]);
                            if (idx1 % 2 == 0)
                                result = Jw.Json(new { t0email = "t0@hotmail.com", t0md5 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });
                            else if (idx1 % 2 == 1)
                                result = Jw.Json(new { t1email = "t1@hotmail.com", t1md5 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });
                            else
                                result = Jw.Json(new { result = "NoMd5" });
                            break;
                        default:
                            await this.Fw.Err(1000, "Start", "Error", "Unknown request: " + requestFromPost); 
                            break;
                    }
                }
                else if (!String.IsNullOrEmpty(context.Request.Query["eqs"]))
                {
                    (IGenericEntity op, string md5) = await TowerWrapper.ProcessTowerMessage(this.Fw, context, this.TowerEncryptionKey);
                    if (!String.IsNullOrEmpty(md5)) result = await SaveSession(this.Fw, context, op, md5);
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

        public static string ReplaceToken(string tokenized, string opaque)
        {
            return tokenized.Replace("[=OPAQUE=]", opaque);
        }

        public async Task<string> DoVisitorId(FrameworkWrapper fw, HttpContext c)
        {
            string opaque64 = c.Get("op", "");
            string opaque = Utility.Hashing.Base64DecodeFromUrl(opaque64);
            IGenericEntity opge = Jw.JsonToGenericEntity(opaque);
            string afid = opge.GetS("afid");
            string tpid = opge.GetS("tpid");
            string eml = opge.GetS("eml");
            string md5 = opge.GetS("md5");
            int slot = Int32.Parse(opge.GetS("slot"));
            int page = Int32.Parse(opge.GetS("page"));
            string sid = opge.GetS("sd");
            sid = String.IsNullOrEmpty(sid) ? Guid.NewGuid().ToString() : sid;
            string qstr = opge.GetS("qs");
            Uri u = new Uri(qstr);
            string host = u.Host ?? "";
            string path = u.AbsolutePath ?? "";
            string qury = u.Query ?? "";
            Dictionary<string, object> rsids = new Dictionary<string, object> { { "visid", sid } };
            foreach (var rsid in opge.GetD("rsid")) rsids.Add(rsid.Item1, rsid.Item2);

            // Consider accepting an existing Guid from opaque.rsid and using it or dropping
            // events to it, in addition to the events we drop specifically for vid
            if (slot == 0)
            {
                EdwBulkEvent be = new EdwBulkEvent();
                be.AddRS(EdwBulkEvent.EdwType.Immediate, new Guid(sid), DateTime.UtcNow,
                    PL.O(new { qs = qstr, op = opaque, ip = c.Connection.RemoteIpAddress,
                        h = host, p = path, q = qury, afid}), this.RsConfigGuid);
                be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                    null, PL.O(new { et = "SessionInitiate", qs = qstr, op = opaque,
                        ip = c.Connection.RemoteIpAddress,
                        h = host, p = path, q = qury }));
                await fw.EdwWriter.Write(be, 1);
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
                int nextIdx = slot;
                int nextPage = page;

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
                                await SaveSession(fw, c, sid, "cookie", slot, page, md5, eml, visitorIdEmailProviderSequence, rsids);
                            }
                        }

                        EdwBulkEvent be = new EdwBulkEvent();                        
                        be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                            null, PL.O(new
                            {
                                et = "Md5ProviderSelected",
                                pid = "cookie",
                                slot,
                                page
                            }));
                        await fw.EdwWriter.Write(be, 1);

                        nextIdx++;
                        nextPage++;
                        continue;
                    }
                    else if (nextTask.ToLower() == "continue")
                    {
                        nextIdx++;
                        md5 = "";
                        eml = "";
                        continue;
                    }
                    else if (nextTask.ToLower() == "continueonsuccessmd5")
                    {
                        if (!String.IsNullOrEmpty(md5))
                        {
                            nextIdx++;
                            md5 = "";
                            eml = "";
                            continue;
                        }
                        else
                        {
                            return Jw.Json(new { done = "1", sesid = sid });
                        }
                    }
                    else if (nextTask.ToLower() == "continueonsuccessemail")
                    {
                        if (!String.IsNullOrEmpty(eml))
                        {
                            nextIdx++;
                            md5 = "";
                            eml = "";
                            continue;
                        }
                        else
                        {
                            return Jw.Json(new { done = "1", sesid = sid });
                        }
                    }
                    else if (nextTask.ToLower() == "breakonsuccessmd5")
                    {
                        if (!String.IsNullOrEmpty(md5))
                        {
                            return Jw.Json(new { done = "1", sesid = sid });
                        }
                        else
                        {
                            nextIdx++;
                            md5 = "";
                            eml = "";
                            continue;
                        }
                    }
                    else if (nextTask.ToLower() == "breakonsuccessemail")
                    {
                        if (!String.IsNullOrEmpty(eml))
                        {
                            return Jw.Json(new { done = "1", sesid = sid });
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
                        return Jw.Json(new { done = "1", sesid = sid });
                    }
                    else if (nextTask[0] == '@')
                    {
                        string pid = nextTask.Substring(1);
                        IGenericEntity s = await fw.Entities.GetEntityGe(new Guid(pid));

                        EdwBulkEvent be = new EdwBulkEvent();
                        be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                            null, PL.O(new
                            {
                                et = "Md5ProviderSelected",
                                pid,
                                slot,
                                page
                            }));
                        await fw.EdwWriter.Write(be, 1);

                        return Jw.Json(new
                        {
                            config = ReplaceToken(s.GetS("Config"), opaque64),
                            sesid = sid,
                            pid,
                            slot = nextIdx + 1,
                            page = nextPage + 1,
                            vieps = visitorIdEmailProviderSequence
                        },
                        new bool[] { false, true, true, true, true, true });
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
            return Jw.Json(new { done = "1", sesid = sid });
        }

        public async Task<string> SaveSession(FrameworkWrapper fw, HttpContext c, string sessionId, 
            string pid, int slot, int page, string md5, string email, string visitorIdEmailProviderSequence, 
            Dictionary<string, object> rsids)
        {
            string ip = c.Ip();
            string userAgent = c.UserAgent();

            EdwBulkEvent be = new EdwBulkEvent();
            be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                null, PL.O(new
                {
                    et = "Md5ProviderResponse",
                    pid,
                    slot,
                    page,
                    succ = !String.IsNullOrEmpty(md5) ? "1" : "0"
                }));
            await fw.EdwWriter.Write(be, 1);

            if (String.IsNullOrEmpty(md5)) return Jw.Json(new { Result = "Failure" });

            string em = await DoEmailProviders(fw, c, md5, email, sessionId, visitorIdEmailProviderSequence, rsids);

            c.SetCookie("vidck",
                Jw.Json(new
                {
                    Sid = sessionId,
                    Md5 = md5,
                    Em = em
                }), this.VisitorIdCookieExpDays);

            return Jw.Json(new { email = em, md5 = md5 });
        }

        public async Task<string> SaveSession(FrameworkWrapper fw, HttpContext c, 
            IGenericEntity op = null, string md5 = null)
        {
            IGenericEntity opge;
            if (op == null)
            {
                string opaque64 = c.Get("op", "");
                string opaque = Utility.Hashing.Base64DecodeFromUrl(opaque64);
                opge = Jw.JsonToGenericEntity(opaque);
            }
            else
            {
                opge = op;
            }
            
            string sid = opge.GetS("sd");
            int slot = Int32.Parse(opge.GetS("slot"));
            int page = Int32.Parse(opge.GetS("page"));
            string pid = opge.GetS("pid");
            string vieps = opge.GetS("vieps");
            string emd5 = md5 ?? opge.GetS("md5");
            string eml = Utility.Hashing.Base64DecodeFromUrl(opge.GetS("e"));            
            Dictionary<string, object> rsids = new Dictionary<string, object> { { "visid", sid } };
            foreach (var rsid in opge.GetD("rsid")) rsids.Add(rsid.Item1, rsid.Item2);

            return await SaveSession(fw, c, sid, pid, slot-1, page-1, emd5, eml, vieps, rsids);
        }

        public async Task<string> DoEmailProviders(FrameworkWrapper fw, HttpContext context, string sessionId,
            string md5, string email, string visitorIdEmailProviderSequence, Dictionary<string, object> rsids)
        {
            string eml = "";
            int slotnum = 0;
            int pagenum = 0;
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

                    EdwBulkEvent be = new EdwBulkEvent();
                    be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                        null, PL.O(new
                        {
                            et = "EmailProviderSelected",
                            pid = "cookie",
                            slotnum,
                            pagenum
                        }));
                    await fw.EdwWriter.Write(be, 1);

                    slotnum++;
                    pagenum++;
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
                    string pid = s.Substring(1);
                    EdwBulkEvent be = new EdwBulkEvent();
                    be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                        null, PL.O(new
                        {
                            et = "EmailProviderSelected",
                            pid,
                            slotnum,
                            pagenum
                        }));
                    await fw.EdwWriter.Write(be, 1);

                    IGenericEntity emlProvider = await fw.Entities.GetEntityGe(new Guid(pid));
                    Guid lbmId = new Guid(emlProvider.GetS("Config/LbmId"));
                    string lbm = await fw.Entities.GetEntity(lbmId);
                    eml = (string) await fw.RoslynWrapper.Evaluate(lbmId, lbm, new { context, md5, provider = emlProvider, err = Fw.Err }, new StateWrapper(), true, "e:\\workspace\\scripts\\debug");

                    be = new EdwBulkEvent();
                    be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                        null, PL.O(new
                        {
                            et = "EmailProviderResponse",
                            pid,
                            slotnum,
                            pagenum,
                            succ = !String.IsNullOrEmpty(eml) ? "1" : "0"
                        }));
                    await fw.EdwWriter.Write(be, 1);

                    slotnum++;
                    pagenum++;
                }
                else
                {
                    await fw.Err(1000, "DoVisitorId", "Error", "Unknown Task Type: " + slotnum);
                    slotnum++;
                }
            }

            return eml;
        }
    }
}
