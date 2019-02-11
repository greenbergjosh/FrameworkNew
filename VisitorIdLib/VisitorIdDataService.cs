using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Utility;
using Extensions = Newtonsoft.Json.Linq.Extensions;
using Jw = Utility.JsonWrapper;
using Vutil = Utility.VisitorIdUtil;

namespace VisitorIdLib
{
    public class VisitorIdDataService
    {
        public FrameworkWrapper Fw;

        public Guid RsConfigGuid;
        public string OnPointConsoleUrl;
        public string OnPointConsoleDomainId;
        public string TowerEncryptionKey;
        public Dictionary<string, List<(string Domain, bool isAsync, List<(string Md5provider, string EmailProviderSeq)>)>> VisitorIdMd5ProviderSequences =
            new Dictionary<string, List<(string Domain, bool isAsync, List<(string Md5provider, string EmailProviderSeq)>)>>();
        public Dictionary<string, List<string>> VisitorIdEmailProviderSequences = new Dictionary<string, List<string>>();
        public int VisitorIdCookieExpDays = 10;
        public int SqlTimeoutSec;

        //public void test()
        //{
        //    int slotnum = 2;
        //    int pagenum = 3;
        //    string visitorIdEmailProviderSequence = "abc";
        //    Dictionary<string, object> rsids = new Dictionary<string, object>() { { "bob", "jones" } };

        //    Fw.PostingQueueWriter.Write(new PostingQueueEntry("VisitorId", DateTime.Now,
        //           PL.O(new
        //           {
        //               slotnum,
        //               pagenum
        //           }, new bool[] { false, true, true } )
        //           .Add(PL.N("seq", SL.C(this.VisitorIdEmailProviderSequences[visitorIdEmailProviderSequence])))
        //           .Add(PL.N("rsids", PL.D(rsids))).ToString()), 1).GetAwaiter().GetResult();

        //}

        public void Config(FrameworkWrapper fw)
        {
            this.Fw = fw;

            this.RsConfigGuid = new Guid(fw.StartupConfiguration.GetS("Config/RsConfigGuid"));
            this.OnPointConsoleUrl = fw.StartupConfiguration.GetS("Config/OnPointConsoleUrl");
            this.OnPointConsoleDomainId = fw.StartupConfiguration.GetS("Config/OnPointConsoleDomainId");
            this.TowerEncryptionKey = fw.StartupConfiguration.GetS("Config/TowerEncryptionKey");
            this.SqlTimeoutSec = fw.StartupConfiguration.GetS("Config/SqlTimeoutSec").ParseInt() ?? 5;
            this.VisitorIdCookieExpDays = Int32.TryParse(fw.StartupConfiguration.GetS("Config/VisitorIdCookieExpDays"), out this.VisitorIdCookieExpDays)
                ? this.VisitorIdCookieExpDays : 10;  // ugly, should add a GetS that takes/returns a default value
            ConfigProviders(this.Fw);
        }

        public VisitorIdDataService ConfigProviders(FrameworkWrapper fw)
        {
            foreach (var afidCfg in fw.StartupConfiguration.GetL("Config/VisitorIdMd5ProviderSequences"))
            {
                string afid = afidCfg.GetS("afid");
                bool isAsync = (afidCfg.GetS("async") == "true");
                List<(string Domain, bool isAsync, List<(string Md5provider, string EmailProviderSeq)>)> afidSeqs =
                    new List<(string Domain, bool isAsync, List<(string Md5provider, string EmailProviderSeq)>)>();
                foreach (var afidCfgSeq in afidCfg.GetL("seqs"))
                {
                    string domain = afidCfgSeq.GetS("dom");
                    bool isAsyncDom = !afidCfgSeq.GetS("async").IsNullOrWhitespace() ? afidCfgSeq.GetS("async") == "true" : isAsync;
                    List<(string Md5provider, string EmailProviderSeq)> md5seq = new List<(string Md5provider, string EmailProviderSeq)>();
                    foreach (var dgvipm in afidCfgSeq.GetL("seq"))
                    {
                        string md5ProviderStr = dgvipm.GetS("");
                        string[] md5ProviderStrParts = md5ProviderStr.Split('|');
                        md5seq.Add((md5ProviderStrParts[0],
                            md5ProviderStrParts.Length > 1 ? md5ProviderStrParts[1] : null));
                    }
                    afidSeqs.Add((domain, isAsyncDom, md5seq));
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
            return this;
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
                requestFromPost = await context.GetRawBodyStringAsync();

                if (!String.IsNullOrWhiteSpace(context.Request.Query["m"]))
                {
                    string m = context.Request.Query["m"];
                    var cookie = GetCookieData(context);

                    switch (m)
                    {
                        case "VisitorId":
                            var resDV = await DoVisitorId(this.Fw, context);

                            result = resDV.Result;

                            context.SetCookie("vidck", Jw.Json(new
                            {
                                sid = resDV.Sid.IfNullOrWhitespace(cookie.sid),
                                md5 = resDV.Md5.IfNullOrWhitespace(cookie.md5),
                                em = resDV.Email.IfNullOrWhitespace(cookie.em)
                            }), this.VisitorIdCookieExpDays);

#if DEBUG
                            var replaceDomain = "v-track.net";
                            if (System.Diagnostics.Debugger.IsAttached) result = result.Replace(replaceDomain, context.Request.Host.Value);
#endif

                            break;
                        case "SaveSession":
                            var resSS = await SaveSession(this.Fw, context, ((string)context.Request.Query["pq"]).ParseBool() ?? false, true);

                            result = resSS.Result;

                            context.SetCookie("vidck", Jw.Json(new
                            {
                                sid = resSS.Sid.IfNullOrWhitespace(cookie.sid),
                                md5 = resSS.Md5.IfNullOrWhitespace(cookie.md5),
                                em = resSS.Email.IfNullOrWhitespace(cookie.em)
                            }), this.VisitorIdCookieExpDays);

                            break;
                        case "TestService":
                            var idx1 = context.Request.Query["i"].FirstOrDefault().ParseInt();
                            var md5s = new Dictionary<int, string>()
                            {
                                // OnPointEmailProvider New Md5s
                                {3,"D2C9A2582C8D49177CB65EB6DEC54DE0" },{4,"AD84C4D935678CF0FBEB7D3B2931B46C" },{5,"B1F65047C45D2ED62E4653989F91C592" },
                                { 6,"D76390CBCC9F9C1AF07F05FBBE0FE5C6" },{7,"ECF2579E76EF5E9A3CAC4E176FA39263" },{8,"5D23538C43F6D9669B7907DCBABADD9A" },
                                // OnPointEmailProvider Old Md5s
                                { 9,"23242543C2ADDB23F48A752433F7801D" },{10,"7E99FDEE2B4CA772B3B22AAB34123508" },
                                // LegacyEmailProvider
                                { 11,"92306443ED2DF27B1293C12FF8296350" },{ 12,"28511984A236C6D589DF5D2C1BF43037" },{ 13,"160D388576AB55C4F96AE34DC3575D96" },
                                { 14,"3AF45A3655103ABAF17194874569DCEB" },{ 15,"6D2E64535729A4E2E7AD7173F4BD9CB2" },{16,"EB385FFCFA3F22F17AB3636B87D554FD" },
                                { 17,"3218507EE4B18A593C7FCE3C768BAB82" },{18,"3E0E46A40A29D5151D16E40062A5DFB0" }
                            };

                            switch (idx1)
                            {
                                case 0:
                                    result = Jw.Json(new { t0email = "t0@hotmail.com", t0md5 = "00000000000000000000000000000000" });
                                    break;
                                case 1:
                                    result = Jw.Json(new { t1email = "t1@hotmail.com", t1md5 = "11111111111111111111111111111111" });
                                    break;
                                default:
                                    var md5 = md5s.GetValueOrDefault(idx1);

                                    result = md5.IsNullOrWhitespace() ? Jw.Json(new { md5 = "" }) : Jw.Json(new { md5 });
                                    break;
                            }
                            break;
                        default:
                            await this.Fw.Err(1000, "Start", "Error", "Unknown request: " + requestFromPost);
                            break;
                    }
                }
                else if (!String.IsNullOrWhiteSpace(context.Request.Query["eqs"]))
                {
                    (IGenericEntity op, string md5) = await TowerWrapper.ProcessTowerMessage(this.Fw, context, this.TowerEncryptionKey);
                    if (String.IsNullOrWhiteSpace(md5))
                    {
                        var opqVals = ValsFromOpaque(op);
                        EdwBulkEvent be = new EdwBulkEvent();
                        be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, opqVals.rsids,
                            null, PL.O(new
                            {
                                et = "Md5ProviderResponse",
                                pid = opqVals.pid,
                                slot = opqVals.slot,
                                page = opqVals.page,
                                succ = "0"
                            }));
                        await this.Fw.EdwWriter.Write(be);
                        result = Jw.Json(new { email = "", md5 = "", slot = opqVals.slot, page = opqVals.page });
                    }
                    else
                    {
                        result = (await SaveSession(this.Fw, context, true, false, op, md5)).Result;
                    }
                }
                else
                {
                    await this.Fw.Err(1000, "Start", "Tracking", "Unknown request: " + requestFromPost);
                }
            }
            catch (Exception ex)
            {
                await this.Fw.Err(1000, "Start", "Exception", $@"{requestFromPost}::{ex}");
            }
            await context.WriteSuccessRespAsync(result);
        }

        public static string ReplaceToken(string tokenized, string opaque)
        {
            return tokenized.Replace("[=OPAQUE=]", opaque);
        }

        public async Task<VisitorIdResponse> DoVisitorId(FrameworkWrapper fw, HttpContext c)
        {
            string opaque64, opaque = null, afid, tpid, eml, md5, sid, qstr, host, path, qury;
            IGenericEntity opge;
            int slot, page;
            EdwBulkEvent be = null;

            try
            {
                opaque64 = c.Get("op", "");
                opaque = Hashing.Base64DecodeFromUrl(opaque64);
                opge = Jw.JsonToGenericEntity(opaque);
                afid = opge.GetS("afid");
                tpid = opge.GetS("tpid");
                eml = opge.GetS("eml");
                md5 = opge.GetS("md5");
                slot = Int32.Parse(opge.GetS("slot") ?? "0");
                page = Int32.Parse(opge.GetS("page") ?? "0");
                sid = opge.GetS("sd");
                sid = sid.IsNullOrWhitespace() ? Guid.NewGuid().ToString() : sid;
                qstr = opge.GetS("qs");
                var u = new Uri(HttpUtility.UrlDecode(qstr));
                host = u.Host ?? "";
                path = u.AbsolutePath ?? "";
                qury = u.Query ?? "";
            }
            catch (Exception e)
            {
                await fw.Err(ErrorSeverity.Error, nameof(DoVisitorId), ErrorDescriptor.Exception, $"Failed to load state data. Exception: {e.Message} Opaque: {(opaque.IsNullOrWhitespace() ? "Opaque was empty" : opaque)}");
                throw;
            }

            var rsids = new Dictionary<string, object> { { "visid", sid } };

            foreach (var rsid in opge.GetD("rsid")) rsids.Add(rsid.Item1, rsid.Item2);

            // Consider accepting an existing Guid from opaque.rsid and using it or dropping
            // events to it, in addition to the events we drop specifically for vid
            if (slot == 0)
            {
                be = new EdwBulkEvent();
                be.AddRS(EdwBulkEvent.EdwType.Immediate, new Guid(sid), DateTime.UtcNow,
                    PL.O(new
                    {
                        qs = qstr,
                        op = opaque,
                        ip = c.Connection.RemoteIpAddress,
                        h = host,
                        p = path,
                        q = qury,
                        afid,
                        tpid
                    }, new bool[] { true, false, true, true, true, true, true, true }), this.RsConfigGuid);
                be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                    null, PL.O(new
                    {
                        et = "SessionInitiate",
                        qs = qstr,
                        op = opaque,
                        ip = c.Connection.RemoteIpAddress,
                        h = host,
                        p = path,
                        q = qury,
                        tpid
                    }, new bool[] { true, true, false, true, true, true, true, true }));
                await fw.EdwWriter.Write(be);
            }

            bool isAsync = true;
            List<(string Md5provider, string EmailProviderSeq)> visitorIdMd5ProviderSequence = null;
            foreach (var kvp in VisitorIdMd5ProviderSequences[afid])
            {
                if (host != "" && ((host == kvp.Domain) || host.EndsWith("." + kvp.Domain)))
                {
                    visitorIdMd5ProviderSequence = kvp.Item3;
                    isAsync = kvp.isAsync;
                    break;
                }
                else if (kvp.Domain == "default") // allow default option anywhere in list
                {
                    if (visitorIdMd5ProviderSequence == null)
                    {
                        visitorIdMd5ProviderSequence = kvp.Item3;
                        isAsync = kvp.isAsync;
                    }
                }
            }

            try
            {
                void continueToNextSlot()
                {
                    slot++;
                    md5 = "";
                    eml = "";
                }

                while (slot < visitorIdMd5ProviderSequence.Count)
                {
                    var nextTask = visitorIdMd5ProviderSequence[slot].Md5provider;
                    var visitorIdEmailProviderSequence = visitorIdMd5ProviderSequence[slot].EmailProviderSeq;

                    if (nextTask.ToLower() == "cookie")
                    {
                        be = new EdwBulkEvent();
                        be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                            null, PL.O(new
                            {
                                et = "Md5ProviderSelected",
                                pid = "cookie",
                                slot,
                                page
                            }));
                        await fw.EdwWriter.Write(be);

                        var cookie = GetCookieData(c);

                        md5 = cookie.md5;
                        eml = cookie.em;

                        if (!cookie.sid.IsNullOrWhitespace() && md5.IsNullOrWhitespace())
                        {
                            IGenericEntity lookupGe = await fw.RootDataLayerClient.GenericEntityFromEntry("VisitorId",
                               "LookupBySessionId",
                               Jw.Json(new { Sid = cookie.sid }),
                               "", null, null, this.SqlTimeoutSec);
                            eml = lookupGe.GetS("Em");
                            md5 = lookupGe.GetS("Md5");
                        }


                        if (md5.IsNullOrWhitespace())
                        {
                            be = new EdwBulkEvent();
                            be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                                null, PL.O(new
                                {
                                    et = "Md5ProviderResponse",
                                    pid = "cookie",
                                    slot,
                                    page,
                                    succ = "0"
                                }));
                            await fw.EdwWriter.Write(be);
                        }
                        else
                        {
                            await SaveSession(fw, c, sid, "cookie", slot, page, md5, eml, isAsync, visitorIdEmailProviderSequence, rsids, host, false, true);
                        }
                        continueToNextSlot();
                        page++;
                        continue;
                    }
                    else if (nextTask.ToLower() == "continue")
                    {
                        continueToNextSlot();
                        continue;
                    }
                    else if (nextTask.ToLower() == "continueonsuccessmd5")
                    {
                        if (!md5.IsNullOrWhitespace())
                        {
                            continueToNextSlot();
                            continue;
                        }
                        else
                        {
                            return new VisitorIdResponse(Jw.Json(new { done = "1", sid }), md5, eml, sid);
                        }
                    }
                    else if (nextTask.ToLower() == "continueonsuccessemail")
                    {
                        if (!eml.IsNullOrWhitespace())
                        {
                            continueToNextSlot();
                            continue;
                        }
                        else
                        {
                            return new VisitorIdResponse(Jw.Json(new { done = "1", sid }), md5, eml, sid);
                        }
                    }
                    else if (nextTask.ToLower() == "breakonsuccessmd5")
                    {
                        if (!md5.IsNullOrWhitespace())
                        {
                            return new VisitorIdResponse(Jw.Json(new { done = "1", sid }), md5, eml, sid);
                        }
                        else
                        {
                            continueToNextSlot();
                            continue;
                        }
                    }
                    else if (nextTask.ToLower() == "breakonsuccessemail")
                    {
                        if (!eml.IsNullOrWhitespace())
                        {
                            return new VisitorIdResponse(Jw.Json(new { done = "1", sid }), md5, eml, sid);
                        }
                        else
                        {
                            continueToNextSlot();
                            continue;
                        }
                    }
                    else if (nextTask.ToLower() == "break")
                    {

                        return new VisitorIdResponse(Jw.Json(new { done = "1", sid }), md5, eml, sid);
                    }
                    else if (nextTask[0] == '@')
                    {
                        string pid = nextTask.Substring(1);
                        // Update the opaque parm with the newly identified isAsync value so it can
                        // be used for providers that redirect back to use directly which has us call
                        // SaveSession before returning back to the javascript where the opaque parm
                        // is further updated.
                        var opq = JObject.Parse(opaque);
                        opq["isAsync"] = isAsync ? "true" : "false";
                        opq["sd"] = sid;
                        opq["pid"] = pid;
                        opq["vieps"] = visitorIdEmailProviderSequence;
                        opq["slot"] = slot;
                        opq["page"] = page;
                        opaque64 = Utility.Hashing.Base64EncodeForUrl(opq.ToString(Formatting.None));

                        IGenericEntity s = await fw.Entities.GetEntityGe(new Guid(pid), fw.RootDataLayerClient);
                        be = new EdwBulkEvent();
                        be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                            null, PL.O(new
                            {
                                et = "Md5ProviderSelected",
                                pid,
                                slot,
                                page
                            }));
                        await fw.EdwWriter.Write(be);

                        return new VisitorIdResponse(Jw.Json(new
                        {
                            config = ReplaceToken(s.GetS("Config"), opaque64),
                            sid,
                            pid,
                            slot,
                            page,
                            isAsync = isAsync ? "true" : "false",
                            vieps = visitorIdEmailProviderSequence
                        },
                        new bool[] { false, true, true, true, true, true }), md5, eml, sid);
                    }
                    else
                    {
                        await fw.Err(1000, "DoVisitorId", "Error", $"Unknown MD5 Provider Task Type: {nextTask} Slot: {slot} Page: {page}");
                        continueToNextSlot();
                    }
                }
            }
            catch (Exception ex)
            {
                await fw.Err(1000, "DoVisitorId", "Exception", ex.ToString());
            }

            return new VisitorIdResponse(Jw.Json(new { done = "1", sid }), md5, eml, sid);
        }

        public async Task<VisitorIdResponse> SaveSession(FrameworkWrapper fw, HttpContext c, string sid,
            string pid, int slot, int page, string md5, string email, bool isAsync, string visitorIdEmailProviderSequence,
            Dictionary<string, object> rsids, string pixelDomain, bool sendMd5ToPostingQueue, bool hasClientContext)
        {
            string ip = c.Ip();
            var success = !md5.IsNullOrWhitespace();

            EdwBulkEvent be = new EdwBulkEvent();
            be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                null, PL.O(new
                {
                    et = "Md5ProviderResponse",
                    pid,
                    slot,
                    page,
                    succ = success ? "1" : "0"
                }));
            await fw.EdwWriter.Write(be);

            if (!success)
            {
                return new VisitorIdResponse(Jw.Json(new { Result = "Failure", slot, page }), md5, email, sid);
            }

            if (sendMd5ToPostingQueue)
            {
                await fw.PostingQueueWriter.Write(new PostingQueueEntry("VisitorIdProviderResult", DateTime.Now,
                    PL.O(new
                    {
                        md5Slot = slot,
                        md5Page = page,
                        sid,
                        pid,
                        md5
                    }).ToString()));
            }

            string clientIp = null, userAgent = null;

            if (hasClientContext)
            {
                clientIp = c.Connection.RemoteIpAddress?.ToString();
                userAgent = c.UserAgent();
            }

            email = visitorIdEmailProviderSequence.IsNullOrWhitespace() ? "" : await DoEmailProviders(fw, c, sid, md5, email, isAsync, visitorIdEmailProviderSequence, rsids, pid, slot, page, pixelDomain, clientIp, userAgent);

            return new VisitorIdResponse(Jw.Json(new { email, md5, slot, page }), md5, email, sid);
        }

        public static (
                string sid,
                int slot,
                int page,
                string pid,
                bool isAsync,
                string vieps,
                string emd5,
                string eml,
                Dictionary<string,
                object> rsids,
                string host)
            ValsFromOpaque(IGenericEntity opge)
        {
            string sid = opge.GetS("sd");
            int slot = Int32.Parse(opge.GetS("slot") ?? "0");
            int page = Int32.Parse(opge.GetS("page") ?? "0");
            string pid = opge.GetS("pid");
            bool isAsync = (opge.GetS("async") == "true");
            string vieps = opge.GetS("vieps");
            string emd5 = opge.GetS("md5");
            string eml = Utility.Hashing.Base64DecodeFromUrl(opge.GetS("e"));
            var qstr = opge.GetS("qs");
            var u = new Uri(HttpUtility.UrlDecode(qstr));
            var host = u.Host ?? "";
            Dictionary<string, object> rsids = new Dictionary<string, object> { { "visid", sid } };
            foreach (var rsid in opge.GetD("rsid")) rsids.Add(rsid.Item1, rsid.Item2);

            return (sid, slot, page, pid, isAsync, vieps, emd5, eml, rsids, host);
        }

        public async Task<VisitorIdResponse> SaveSession(FrameworkWrapper fw, HttpContext c, bool sendMd5ToPostingQueue, bool hasClientContext, IGenericEntity op = null, string md5 = null)
        {
            var opqVals = ValsFromOpaque(op ?? Vutil.OpaqueFromBase64(c.Get("op", "", false)));
            return await SaveSession(fw, c, opqVals.sid, opqVals.pid, opqVals.slot, opqVals.page, (md5 ?? opqVals.emd5), opqVals.eml, opqVals.isAsync, opqVals.vieps, opqVals.rsids, opqVals.host, sendMd5ToPostingQueue, hasClientContext);
        }

        private (string md5, string em, string sid) GetCookieData(HttpContext context)
        {
            var cookieValueFromReq = context.Request.Cookies["vidck"];

            if (!cookieValueFromReq.IsNullOrWhitespace())
            {
                var gc = Jw.JsonToGenericEntity(cookieValueFromReq);
                var sid = gc.GetS("sid");
                var em = gc.GetS("em");
                var md5 = gc.GetS("md5");

                return (md5: md5, em: em, sid: sid);
            }

            return (md5: null, em: null, sid: null);
        }

        public async Task<string> DoEmailProviders(FrameworkWrapper fw, HttpContext context, string sid,
            string md5, string email, bool isAsync, string visitorIdEmailProviderSequence, Dictionary<string, object> rsids, string md5Pid, int md5Slot, int md5Page, string pixelDomain, string clientIp, string userAgent)
        {
            string cookieEml = "";
            string eml = "";
            int slot = 0;
            int page = 0;
            foreach (var s in this.VisitorIdEmailProviderSequences[visitorIdEmailProviderSequence])
            {
                if (s.ToLower() == "stopifemail")
                {
                    if (!email.IsNullOrWhitespace()) return email;
                }
                else if (s.ToLower() == "cookie")
                {
                    EdwBulkEvent be = new EdwBulkEvent();
                    be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                        null, PL.O(new
                        {
                            et = "EmailProviderSelected",
                            pid = "cookie",
                            slot,
                            page,
                            md5Pid,
                            md5Slot,
                            md5Page
                        }));
                    await fw.EdwWriter.Write(be);

                    var cookieData = GetCookieData(context);

                    eml = cookieData.em;

                    if (eml.IsNullOrWhitespace() && !cookieData.sid.IsNullOrWhitespace())
                    {
                        var lookupGe = await fw.RootDataLayerClient.GenericEntityFromEntry("VisitorId",
                            "LookupBySessionId",
                            Jw.Json(new { Sid = cookieData.sid }),
                            "", null, null, this.SqlTimeoutSec);
                        eml = lookupGe.GetS("Em");
                    }

                    if (!eml.IsNullOrWhitespace())
                    {
                        cookieEml = eml;
                        //PostVisitorIdToConsole(email, "VisitorId-cookie", pixelDomain, clientIp, userAgent);
                        PostVisitorIdToConsole(eml, "cookie", pixelDomain, clientIp, userAgent);
                    }

                    be = new EdwBulkEvent();
                    be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                        null, PL.O(new
                        {
                            et = "EmailProviderResponse",
                            pid = "cookie",
                            slot,
                            page,
                            md5Pid,
                            md5Slot,
                            md5Page,
                            succ = eml.IsNullOrWhitespace() ? "0" : "1"
                        }));
                    await fw.EdwWriter.Write(be);

                    slot++;
                    if (!eml.IsNullOrWhitespace()) page++;
                    continue;
                }
                else if (s.ToLower() == "continue")
                {
                    slot++;
                    if (isAsync) break;
                    eml = "";
                    continue;
                }
                else if (s.ToLower() == "continueonsuccess")
                {
                    if (!eml.IsNullOrWhitespace())
                    {
                        slot++;
                        if (isAsync) break;
                        eml = "";
                        continue;
                    }
                    else
                    {
                        return cookieEml;
                    }
                }
                else if (s.ToLower() == "breakonsuccess")
                {
                    if (!eml.IsNullOrWhitespace())
                    {
                        return cookieEml;
                    }
                    else
                    {
                        slot++;
                        if (isAsync) break;
                        eml = "";
                        continue;
                    }
                }
                else if (s.ToLower() == "break")
                {
                    return cookieEml;
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
                            slot,
                            page,
                            md5Pid,
                            md5Slot,
                            md5Page
                        }));
                    await fw.EdwWriter.Write(be);

                    try
                    {
                        IGenericEntity emlProvider = await fw.Entities.GetEntityGe(new Guid(pid), fw.RootDataLayerClient);
                        Guid lbmId = new Guid(emlProvider.GetS("Config/LbmId"));
                        var sendMd5ToPostingQueue = emlProvider.GetS("Config/SaveResult").ParseBool() ?? false;
                        string lbm = await fw.Entities.GetEntity(lbmId, fw.RootDataLayerClient);

                        eml = (string)await fw.RoslynWrapper.Evaluate(lbmId, lbm,
                            new { context, md5, dataLayerClient = fw.RootDataLayerClient, provider = emlProvider, err = Fw.Err }, new StateWrapper());

                        if (!eml.IsNullOrWhitespace())
                        {
                            //PostVisitorIdToConsole(email, $"VisitorId-{pid}", pixelDomain, clientIp, userAgent);
                            PostVisitorIdToConsole(eml, pid, pixelDomain, clientIp, userAgent);

                            if (sendMd5ToPostingQueue)
                            {
                            await fw.PostingQueueWriter.Write(new PostingQueueEntry("VisitorIdProviderResult", DateTime.Now,
                                PL.O(new
                                {
                                    emailSlot = slot,
                                    emailPage = page,
                                    md5Pid,
                                    md5Slot,
                                    md5Page,
                                    sid,
                                    pid,
                                    md5,
                                    eml
                                }).ToString()));
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        await fw.Err(ErrorSeverity.Error, nameof(DoEmailProviders), ErrorDescriptor.Exception, $"Failed to evaluate LBM {pid}. Exception: {ex}");
                        slot++;
                        page++;
                        continue;
                    }

                    if (!eml.IsNullOrWhitespace()) cookieEml = eml;

                    be = new EdwBulkEvent();
                    be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                        null, PL.O(new
                        {
                            et = "EmailProviderResponse",
                            pid,
                            slot,
                            page,
                            md5Pid,
                            md5Slot,
                            md5Page,
                            succ = eml.IsNullOrWhitespace() ? "0" : "1"
                        }));
                    await fw.EdwWriter.Write(be);

                    slot++;
                    page++;
                }
                else
                {
                    await fw.Err(1000, "DoVisitorId", "Error", $"Unknown Email Provider Task Type: {s} Slot: {slot} Page: {page}");
                    slot++;
                }
            }

            if (isAsync && (slot < this.VisitorIdEmailProviderSequences[visitorIdEmailProviderSequence].Count))
            {
                // ToDo: For this to work we need to remove the dependency on HttpContext
                await fw.PostingQueueWriter.Write(new PostingQueueEntry("VisitorId", DateTime.Now,
                   PL.O(new
                   {
                       rsids,
                       sid,
                       slot,
                       page,
                       md5Pid,
                       md5Slot,
                       md5Page
                   })
                   .Add(PL.N("seq", SL.C(this.VisitorIdEmailProviderSequences[visitorIdEmailProviderSequence])))
                   .Add(PL.N("rsids", PL.D(rsids))).ToString()));
            }

            return cookieEml;
        }

        public void PostVisitorIdToConsole(string plainTextEmail, string provider, string domain, string clientIp, string userAgent)
        {
            if (this.OnPointConsoleUrl.IsNullOrWhitespace()) return;

            var task = new Func<Task>(async () =>
            {
                try
                {
                    await ProtocolClient.HttpPostAsync(this.OnPointConsoleUrl,
                        Jw.Json(new
                        {
                            header = Jw.Json(new { svc = 1, page = -1 }, new bool[] { false, false }),
                            body = Jw.Json(new
                            {
                                domain_id = OnPointConsoleDomainId,
                                email = plainTextEmail,
                                user_ip = clientIp,
                                user_agent = userAgent,
                                email_source = "visitorid",
                                provider,
                                isFinal = "true",
                                label_domain = domain
                            })
                        }, new bool[] { false, false }), "application/json");

                    await Fw.Log(nameof(PostVisitorIdToConsole), $"Successfully posted {plainTextEmail} to Console");
                }
                catch (Exception e)
                {
                    await Fw.Error(nameof(PostVisitorIdToConsole), $"Failed to post {plainTextEmail} to Console: {e.UnwrapForLog()}");
                }
            });

            Task.Run(task);
        }

    }
}
