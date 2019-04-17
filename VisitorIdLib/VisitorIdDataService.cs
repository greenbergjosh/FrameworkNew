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
using Utility.DataLayer;
using Extensions = Newtonsoft.Json.Linq.Extensions;
using Jw = Utility.JsonWrapper;
using Vutil = Utility.VisitorIdUtil;

namespace VisitorIdLib
{
    public class VisitorIdDataService
    {
        const string DataLayerName = "VisitorId";
        public FrameworkWrapper Fw;

        public Guid CodePathRsid;
        public bool CodePathEventsEnabled;
        public Guid CodePathRsGuid;
        public (Guid VidRsid, Guid DomainRsid, Guid PageRsid) RsConfigIds;
        public string TowerEncryptionKey;
        public Dictionary<string, List<(string Domain, bool isAsync, List<(string Md5provider, string EmailProviderSeq)>)>> VisitorIdMd5ProviderSequences =
            new Dictionary<string, List<(string Domain, bool isAsync, List<(string Md5provider, string EmailProviderSeq)>)>>();
        public Dictionary<string, List<string>> VisitorIdEmailProviderSequences = new Dictionary<string, List<string>>();
        public int SqlTimeoutSec;
        public TimeSpan SessionDuration;
        public string CookieName;
        public List<Guid> Md5ExcludeList;

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
            this.CodePathRsid = new Guid(fw.StartupConfiguration.GetS("Config/CodePathRsid"));
            this.CodePathEventsEnabled = fw.StartupConfiguration.GetB("Config/CodePathEventsEnabled");
            this.RsConfigIds = (VidRsid: new Guid(fw.StartupConfiguration.GetS("Config/VidRsid")),
                                DomainRsid: new Guid(fw.StartupConfiguration.GetS("Config/DomainRsid")),
                                PageRsid: new Guid(fw.StartupConfiguration.GetS("Config/PageRsid")));
            this.TowerEncryptionKey = fw.StartupConfiguration.GetS("Config/TowerEncryptionKey");
            this.SqlTimeoutSec = fw.StartupConfiguration.GetS("Config/SqlTimeoutSec").ParseInt() ?? 5;
            this.SessionDuration = new TimeSpan(fw.StartupConfiguration.GetS("Config/SessionDurationDays").ParseInt() ?? 75, 0, 0, 0);
            this.CookieName = fw.StartupConfiguration.GetS("Config/CookieName") ?? "vidck";
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
                DateTime visitTime = DateTime.UtcNow;
                this.CodePathRsGuid = Guid.NewGuid();
                await WriteCodePathRs(PL.O(new { method = nameof(Run) }), visitTime);


                if (!String.IsNullOrWhiteSpace(context.Request.Query["m"]))
                {
                    string m = context.Request.Query["m"];
                    switch (m)
                    {
                        case "VisitorId":
                            await WriteCodePathEvent(PL.O(new { branch = "VisitorId", loc = "start" }));
                            var resDV = await DoVisitorId(this.Fw, context);

                            result = resDV.Result;
                            resDV.CookieData.md5 = resDV.Md5.IfNullOrWhitespace(resDV.CookieData.md5);
                            resDV.CookieData.em = resDV.Email.IfNullOrWhitespace(resDV.CookieData.em);
                            resDV.CookieData.lv = visitTime;

                            context.SetCookie(this.CookieName,resDV.CookieData.ToJson(), new DateTime(2038, 1, 19));
                            await WriteCodePathEvent(PL.O(new { branch = "VisitorId", loc = "end", cookieData = resDV.CookieData.ToJson() },
                                                   new bool[] { true,                true,        false  } ));

                            break;
                        case "SaveSession":
                            await WriteCodePathEvent(PL.O(new { branch = "SaveSession", loc = "start" }));
                            var resSS = await SaveSession(this.Fw, context, ((string)context.Request.Query["pq"]).ParseBool() ?? false, true, true);

                            result = resSS.Result;

                            resSS.CookieData.md5 = resSS.Md5.IfNullOrWhitespace(resSS.CookieData.md5);
                            resSS.CookieData.em = resSS.Email.IfNullOrWhitespace(resSS.CookieData.em);
                            resSS.CookieData.lv = visitTime;
                            context.SetCookie(this.CookieName,resSS.CookieData.ToJson(), new DateTime(2038, 1, 19));
                            await WriteCodePathEvent(PL.O(new { branch = "SaveSession", loc = "end", cookieData = resSS.CookieData.ToJson() },
                                                   new bool[] { true,                   true,        false  } ));


                            break;
                        case "TestService":
                            await WriteCodePathEvent(PL.O(new { branch = "TestService", loc = "start" }));
                            var idx1 = context.Request.Query["i"].FirstOrDefault().ParseInt();
                            await WriteCodePathEvent(PL.O(new { branch = "TestService", loc = "body", idx = idx1 }));
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
                            await WriteCodePathEvent(PL.O(new { branch = "TestService", loc = "end", result },
                                                   new bool[] { true,                   true,        false }));
                            break;
                        default:
                            await this.Fw.Err(1000, "Start", "Error", "Unknown request: " + requestFromPost);
                            break;
                    }
                }
                else if (!String.IsNullOrWhiteSpace(context.Request.Query["eqs"]))
                {

                    await WriteCodePathEvent(PL.O(new { branch = "Tower", loc = "start" }));
                    (IGenericEntity op, string md5) = await TowerWrapper.ProcessTowerMessage(this.Fw, context, this.TowerEncryptionKey);
                    if (op == null)
                    {
                        result = Jw.Json(new { email = "", md5 = "" });
                    }
                    if (String.IsNullOrWhiteSpace(md5))
                    {
                        var opqVals = ValsFromOpaque(op);
                        bool foundMd5ProviderPid = false;

                        if (this.VisitorIdMd5ProviderSequences.ContainsKey(opqVals.afid))
                        {
                            foreach ((string domain, bool isAsync, List<(string, string)> slotSequence) sequence in VisitorIdMd5ProviderSequences[opqVals.afid])
                            {
                                if (sequence.domain == opqVals.host)
                                {
                                    foreach ((string md5Provider, string emailProvider) providers in sequence.slotSequence)
                                    {
                                        if (providers.md5Provider.Contains(opqVals.pid))
                                        {
                                            foundMd5ProviderPid = true;
                                        }
                                    }

                                }
                            }
                        }
                        if (foundMd5ProviderPid == false)
                        {
                            var msg = $"Unable to find referenced Md5 Provider Id pid '{opqVals.pid}' while processing Tower response";
                            await Fw.Error("TowerMd5Provider", msg);
                            result = Jw.Json(new { email = "", md5 = "" });
                            await WriteCodePathEvent(PL.O(new { branch = "Tower", loc = "body", eventPayload = PL.O(new { msg, opqVals.pid }) } ));
                        }
                        else
                        {
                            var payload = PL.O(new
                            {
                                et = "Md5ProviderResponse",
                                opqVals.afid,
                                pid = opqVals.pid,
                                slot = opqVals.slot,
                                page = opqVals.page,
                                eg = IsExpenseGenerating(this.Fw, opqVals.host, opqVals.lst, opqVals.pid),
                                ua = context.Request.Headers["User-Agent"],
                                vft = opqVals.vft,
                                succ = "0",
                                opqVals.lv,
                                opqVals.qstr,
                                qjs = QueryStringUtil.ParseQueryStringToJsonOrLog(opqVals.qstr, async (method, message) => { await this.Fw.Log(method, message); }),
                                opqVals.sid,
                                ip = context.Connection.RemoteIpAddress
                            });
                            EdwBulkEvent be = new EdwBulkEvent();
                            be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, opqVals.rsids, null, payload);
                            await this.Fw.EdwWriter.Write(be);
                            await WriteCodePathEvent(PL.O(new { branch = "Tower", loc = "body", eventPayload = payload.ToString() },
                                                   new bool[] { true, true, false }));
                            result = Jw.Json(new { email = "", md5 = "", slot = opqVals.slot, page = opqVals.page });
                        }
                    }
                    else if (op != null)
                    {
                        result = (await SaveSession(this.Fw, context, true, false, true, null, op, md5)).Result;
                    }
                    await WriteCodePathEvent(PL.O(new { branch = "Tower", loc = "end", result },
                                           new bool[] { true,             true,        false }));

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
            string opaque64, opaque = null, afid, tpid, eml, md5, osid, sid, qstr, host, path, qury, lv, lst;
            IGenericEntity opge;
            int slot, page;
            EdwBulkEvent be = null;
            await WriteCodePathEvent(PL.O(new { branch = nameof(DoVisitorId), loc = "start" }));

            try
            {
                opaque64 = c.Get("op", "");
                opaque = Hashing.Base64DecodeFromUrl(opaque64);
                opge = Jw.JsonToGenericEntity(opaque);
                var opqVals = ValsFromOpaque(opge);
                afid = opqVals.afid;
                tpid = opqVals.tpid;
                eml = opqVals.eml;
                md5 = opqVals.md5;
                slot = opqVals.slot;
                page = opqVals.page;
                osid = opqVals.sid.IsNullOrWhitespace() ? "" : opqVals.sid;
                qstr = opqVals.qstr;
                lst = opqVals.lst;
                lv = opqVals.lv ?? "";
                var u = opqVals.uri;
                host = u.Host ?? "";
                path = u.AbsolutePath ?? "";
                qury = u.Query ?? "";
            }
            catch (Exception e)
            {
                await fw.Err(ErrorSeverity.Error, nameof(DoVisitorId), ErrorDescriptor.Exception, $"Failed to load state data. Exception: {e.Message} Opaque: {(opaque.IsNullOrWhitespace() ? "Opaque was empty" : opaque)}");
                throw;
            }

            DateTime visitTime = DateTime.UtcNow;
            var cookieData = new CookieData(visitTime, c.Request.Cookies[this.CookieName], host, path, this.SessionDuration, this.RsConfigIds, newlyConstructed: slot == 0);
            lv = cookieData.lv == null ? "" : cookieData.lv.ToString();
            sid = cookieData.sid.ToString();

            if (! osid.IsNullOrWhitespace() && osid != sid )
            {
                TimeSpan lvToNow = visitTime - Convert.ToDateTime(lv.IsNullOrWhitespace() || lv == null ? DateTime.MinValue.ToString() : lv);
                var msg = $"Mismatch between opaque session id '{osid}' and cookie session id '{sid}'. Last visit delta: {lvToNow.TotalMinutes} mins";
                await fw.Err(ErrorSeverity.Warn, nameof(DoVisitorId), ErrorDescriptor.Log, msg);
                await WriteCodePathEvent(PL.O(new { branch = nameof(DoVisitorId), loc = "body", msg, osid, sid }));
            }


            // Consider accepting an existing Guid from opaque.rsid and using it or dropping
            // events to it, in addition to the events we drop specifically for vid
            if (slot == 0)
            {
                PL eventPayload = PL.O(new
                {
                    op = opaque,
                    qjs = QueryStringUtil.ParseQueryStringToJsonOrLog(qury, async (method, message) => { await this.Fw.Log(method, message); } ),
                    qs = qstr,
                    ip = c.Connection.RemoteIpAddress,
                    h = host,
                    p = path,
                    q = qury,
                    afid,
                    tpid,
                    ua = c.Request.Headers["User-Agent"],
                    vt = visitTime.ToString(),
                    lv
                }, new bool[]
                {
                    false, //op
                    false, //qjs
                    true,  //qs
                    true,  //ip
                    true,  //h
                    true,  //p
                    true,  //q
                    true,  //afid
                    true,  //tpid
                    true,  //u
                    true,  //
                    true   //lv
                });

                var visitEvents = cookieData.VisitEventsWithPayload(eventPayload);
                visitEvents.RsList.ForEach(async rs => await fw.Trace(nameof(DoVisitorId), $"Preparing to write Reporting Sequence event: {rs.ToString()}"));
                visitEvents.EventList.ForEach(async evt => await fw.Trace(nameof(DoVisitorId), $"Preparing to write Session event: {evt.ToString()}"));
                await WriteCodePathEvent(PL.O(new { branch = nameof(DoVisitorId), loc = "body", eventPayload = eventPayload.ToString() },
                                       new bool[] { true,                         true,         false}));

                CookieData.WriteVisitEvents(visitEvents, fw.EdwWriter);
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
                    if (slot == 0) // Drop an event at the beginning of the Md5 provider run
                    {
                        be = new EdwBulkEvent();
                        be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, cookieData.RsIdDict,
                            null, PL.O(new
                            {
                                et = "Md5ProviderSelectionInitiate",
                                count = visitorIdMd5ProviderSequence.Count,
                                slot,
                                page
                            }));
                        await fw.EdwWriter.Write(be);
                    }

                    var nextTask = visitorIdMd5ProviderSequence[slot].Md5provider;
                    var visitorIdEmailProviderSequence = visitorIdMd5ProviderSequence[slot].EmailProviderSeq;

                    if (nextTask.ToLower() == "cookie")
                    {


                        be = new EdwBulkEvent();
                        be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, cookieData.RsIdDict,
                            null, PL.O(new
                            {
                                et = "Md5ProviderSelected",
                                pid = "cookie",
                                slot,
                                page,
                                vft = cookieData.VeryFirstVisit
                            }));
                        await fw.EdwWriter.Write(be);
                        cookieData.AddOrUpdateProviderSelect("cookie", DateTime.UtcNow);

                        if (! cookieData.md5.IsNullOrWhitespace() &&
                            cookieData.md5.ParseGuid() != null &&
                            this.Md5ExcludeList.Contains(new Guid(cookieData.md5)))
                        {
                            await Fw.Log(nameof(DoVisitorId), $"Removing exclude list md5 value '{cookieData.md5}' from client cookie");
                            await WriteCodePathEvent(PL.O(new { branch = nameof(DoVisitorId), loc = "Md5ExcludeListRemoval" } ));
                            cookieData.md5 = "";
                        }

                        md5 = cookieData.md5;
                        eml = cookieData.em;

                        if (md5.IsNullOrWhitespace())
                        {
                            IGenericEntity lookupGe = await Data.CallFn("VisitorId",
                               "LookupBySessionId",
                               Jw.Json(new { Sid = cookieData.sid }),
                               "{}", null, null, this.SqlTimeoutSec);
                            eml = lookupGe.GetS("Em");
                            md5 = lookupGe.GetS("Md5");
                        }


                        if (md5.IsNullOrWhitespace())
                        {
                            be = new EdwBulkEvent();
                            be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, cookieData.RsIdDict,
                                null, PL.O(new
                                {
                                    et = "Md5ProviderResponse",
                                    pid = "cookie",
                                    slot,
                                    page,
                                    eg = false,
                                    vft = cookieData.VeryFirstVisit,
                                    succ = "0"
                                }));
                            await fw.EdwWriter.Write(be);
                        }
                        else
                        {
                            await SaveSession(fw, c, sid, "cookie", slot, page, md5, eml, isAsync, visitorIdEmailProviderSequence, cookieData.RsIdDict, host, false, true, lv, DateTime.UtcNow.ToString(),cookieData.VeryFirstVisit, afid, host, cookieData);
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
                            return new VisitorIdResponse(Jw.Json(new { done = "1", sid, lv }), md5, eml, cookieData);
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
                            return new VisitorIdResponse(Jw.Json(new { done = "1", sid, lv }), md5, eml, cookieData);
                        }
                    }
                    else if (nextTask.ToLower() == "breakonsuccessmd5")
                    {
                        if (!md5.IsNullOrWhitespace())
                        {
                            return new VisitorIdResponse(Jw.Json(new { done = "1", sid, lv }), md5, eml, cookieData);
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
                            return new VisitorIdResponse(Jw.Json(new { done = "1", sid, lv }), md5, eml, cookieData);
                        }
                        else
                        {
                            continueToNextSlot();
                            continue;
                        }
                    }
                    else if (nextTask.ToLower() == "break")
                    {
                        return new VisitorIdResponse(Jw.Json(new { done = "1", sid, lv }), md5, eml, cookieData);
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
                        opq["lv"] = lv;
                        opq["lst"] = cookieData.LastSelectTime(pid);
                        opq["vft"] = cookieData.VeryFirstVisit;
                        opq["rsid"] = JsonConvert.SerializeObject(cookieData.RsIdDict);
                        opaque64 = Utility.Hashing.Base64EncodeForUrl(opq.ToString(Formatting.None));

                        IGenericEntity s = await fw.Entities.GetEntityGe(new Guid(pid));
                        be = new EdwBulkEvent();
                        be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, cookieData.RsIdDict,
                            null, PL.O(new
                            {
                                et = "Md5ProviderSelected",
                                pid,
                                slot,
                                page,
                                vft = cookieData.VeryFirstVisit
                            }));
                        await fw.EdwWriter.Write(be);
                        cookieData.AddOrUpdateProviderSelect(pid, DateTime.UtcNow);

                        return new VisitorIdResponse(Jw.Json(new
                        {
                            config = ReplaceToken(s.GetS("Config"), opaque64),
                            sid,
                            pid,
                            slot,
                            page,
                            isAsync = isAsync ? "true" : "false",
                            lv,
                            vieps = visitorIdEmailProviderSequence
                        },
                        new bool[] { false, true, true, true, true, true }), md5, eml, cookieData);
                    }
                    else
                    {
                        await fw.Err(1000, "DoVisitorId", "Error", $"Unknown MD5 Provider Task Type: {nextTask} Slot: {slot} Page: {page}");
                        continueToNextSlot();
                    }
                }
                if (visitorIdMd5ProviderSequence.Count > 0) // Drop an event at the end of the Md5 provider run
                {
                    be = new EdwBulkEvent();
                    be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, cookieData.RsIdDict,
                        null, PL.O(new
                        {
                            et = "Md5ProviderSelectionTermination",
                            count = visitorIdMd5ProviderSequence.Count,
                            slot,
                            page
                        }));
                    await fw.EdwWriter.Write(be);
                }


            }
            catch (Exception ex)
            {
                await fw.Err(1000, "DoVisitorId", "Exception", ex.ToString());
            }

            await WriteCodePathEvent(PL.O(new { branch = nameof(DoVisitorId), loc = "end" } ));

            return new VisitorIdResponse(Jw.Json(new { done = "1", sid, lv }), md5, eml, cookieData);
        }

        public async Task<VisitorIdResponse> SaveSession(FrameworkWrapper fw, HttpContext c, string sid,
            string pid, int slot, int page, string md5, string email, bool isAsync, string visitorIdEmailProviderSequence,
            Dictionary<string, object> rsids, string pixelDomain, bool sendMd5ToPostingQueue, bool hasClientContext, string lastVisit, string lst, bool vft, string afid, string host, CookieData cookieData)
        {
            await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSession), loc = "start" }));
            string ip = c.Ip();
            var success = !md5.IsNullOrWhitespace();
            bool foundMd5ProviderPid = false;

            if (this.VisitorIdMd5ProviderSequences.ContainsKey(afid))
            {
                foreach ((string domain, bool isAsync, List<(string, string)> slotSequence) sequence in VisitorIdMd5ProviderSequences[afid])
                {
                    if (sequence.domain == host)
                    {
                        foreach ((string md5Provider, string emailProvider) providers in sequence.slotSequence)
                        {
                            if (providers.md5Provider.Contains(pid))
                            {
                                foundMd5ProviderPid = true;
                            }
                        }

                    }
                }
            }
            if (foundMd5ProviderPid == false)
            {
                var msg = $"Unable to find referenced Md5 Provider Id pid '{pid}' while processing Md5 provider response";
                await Fw.Error("TowerMd5Provider", msg);
                await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSession), loc = "body", eventPayload = PL.O(new { msg, pid }) } ));
                return new VisitorIdResponse(Jw.Json(new { slot, page, lv = lastVisit }), md5, email, cookieData);
            }


            EdwBulkEvent be = new EdwBulkEvent();
            var egBool = IsExpenseGenerating(fw, pixelDomain, lst, pid);

            be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                null, PL.O(new
                {
                    et = "Md5ProviderResponse",
                    pid,
                    slot,
                    page,
                    lst = lst ?? "",
                    domain = pixelDomain,
                    lv = lastVisit ?? "",
                    eg = egBool == null ? "" : egBool.ToString(),
                    vft,
                    succ = success ? "1" : "0"
                }));
            await fw.EdwWriter.Write(be);

            if (!success)
            {
                return new VisitorIdResponse(Jw.Json(new { Result = "Failure", slot, page, lv = lastVisit }), md5, email, cookieData);
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
                        md5,
                        lastVisit = lastVisit ?? ""
                    }).ToString()));
            }

            string clientIp = null, userAgent = null;

            if (hasClientContext)
            {
                clientIp = c.Connection.RemoteIpAddress?.ToString();
                userAgent = c.UserAgent();
            }

            email = visitorIdEmailProviderSequence.IsNullOrWhitespace() ? "" : await DoEmailProviders(fw, c, sid, md5, email, isAsync, visitorIdEmailProviderSequence, rsids, pid, slot, page, pixelDomain, clientIp, userAgent, lastVisit, cookieData);

            if (!email.IsNullOrWhitespace() &&
                 !md5.IsNullOrWhitespace() &&
                 !pid.IsNullOrWhitespace())
            {
                var postResult = await PostMd5LeadDataToConsole(fw, md5, pixelDomain, pid);
                if (postResult.success && ! postResult.postData.IsNullOrWhitespace() )
                {
                    be = new EdwBulkEvent();
                    be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                        null, PL.FromJsonString(postResult.postData).Add(PL.O(new { et = "ConsoleMd5PostLeadData" })));
                    await fw.EdwWriter.Write(be);
                }
            }

            await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSession), loc = "end" } ));
            return new VisitorIdResponse(Jw.Json(new { slot, page, lv = lastVisit }), md5, email, cookieData);
        }

        public static (
                string sid,
                int slot,
                int page,
                string pid,
                bool isAsync,
                string vieps,
                string md5,
                string eml,
                Dictionary<string, object> rsids,
                string host,
                Uri uri,
                string afid,
                string tpid,
                string qstr,
                string lst,
                bool vft,
                string lv)
            ValsFromOpaque(IGenericEntity opge)
        {
            string sid = opge.GetS("sd");
            int slot = Int32.Parse(opge.GetS("slot") ?? "0");
            int page = Int32.Parse(opge.GetS("page") ?? "0");
            string pid = opge.GetS("pid");
            bool isAsync = (opge.GetS("async") == "true");
            string vieps = opge.GetS("vieps");
            string md5 = opge.GetS("md5");
            string eml = Utility.Hashing.Base64DecodeFromUrl(opge.GetS("e"));
            var qstr = opge.GetS("qs");
            var uri = new Uri(HttpUtility.UrlDecode(qstr));
            var host = uri.Host ?? "";
            var lv = opge.GetS("lv");
            var afid = opge.GetS("afid");
            var tpid = opge.GetS("tpid");
            var lst = opge.GetS("lst");
            bool vft = (opge.GetS("vft") == "true");

            Dictionary<string, object> rsids = null;
            if (!string.IsNullOrWhiteSpace(opge.GetS("rsid")))
                rsids = JsonConvert.DeserializeObject<Dictionary<string, object>>(opge.GetS("rsid"));

            return (sid, slot, page, pid, isAsync, vieps, md5, eml, rsids, host, uri, afid, tpid, qstr, lst, vft, lv);
        }

        public async Task<VisitorIdResponse> SaveSession(FrameworkWrapper fw, HttpContext c, bool sendMd5ToPostingQueue, bool hasClientContext, bool canHaveCookie = true, CookieData cookieData = null, IGenericEntity op = null, string md5 = null)
        {
            await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSession), loc = "start" }));
            var opqVals = ValsFromOpaque(op ?? Vutil.OpaqueFromBase64(c.Get("op", "", false), async (method, message) => { await fw.Log(method, message); }));
            if (cookieData == null && canHaveCookie) // passed in a context where we haven't set it yet, but weren't called out of band from a real browser
            {
                cookieData = new CookieData(DateTime.UtcNow, c.Request.Cookies[this.CookieName], opqVals.host, opqVals.uri.AbsolutePath, this.SessionDuration, RsConfigIds);
            }

            var response = await SaveSession(fw, c, opqVals.sid, opqVals.pid, opqVals.slot, opqVals.page, (md5 ?? opqVals.md5), opqVals.eml, opqVals.isAsync, opqVals.vieps, opqVals.rsids, opqVals.host, sendMd5ToPostingQueue, hasClientContext, opqVals.lv, opqVals.lst, opqVals.vft, opqVals.afid, opqVals.host, cookieData);
            await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSession), loc = "end" } ));
            return response;
        }

        public async Task<string> DoEmailProviders(FrameworkWrapper fw, HttpContext context, string sid,
            string md5, string email, bool isAsync, string visitorIdEmailProviderSequence, Dictionary<string, object> rsids, string md5Pid, int md5Slot, int md5Page, string pixelDomain, string clientIp, string userAgent, string lastVisit, CookieData cookieData)
        {
            await WriteCodePathEvent(PL.O(new { branch = nameof(DoEmailProviders), loc = "start" }));
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

                    eml = cookieData.em;

                    if (eml.IsNullOrWhitespace())
                    {
                        var lookupGe = await Data.CallFn("VisitorId",
                            "LookupBySessionId",
                            Jw.Json(new { Sid = cookieData.sid }),
                            "", null, null, this.SqlTimeoutSec);
                        eml = lookupGe.GetS("Em");
                    }

                    if (!eml.IsNullOrWhitespace())
                    {
                        cookieEml = eml;
                        //PostVisitorIdToConsole(email, "VisitorId-cookie", pixelDomain, clientIp, userAgent);
                        var postResult = await PostVisitorIdToConsole(fw, eml, "cookie", pixelDomain, clientIp, userAgent, lastVisit);
                        if (postResult.success && ! postResult.postData.IsNullOrWhitespace() )
                        {
                            be = new EdwBulkEvent();
                            be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                                null, PL.FromJsonString(postResult.postData).Add(PL.O(new { et = "ConsoleMd5PostVisitorIdData", pid = "cookie" })));
                            await fw.EdwWriter.Write(be);
                        }

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
                        IGenericEntity emlProvider = await fw.Entities.GetEntityGe(new Guid(pid));
                        Guid lbmId = new Guid(emlProvider.GetS("Config/LbmId"));
                        var sendMd5ToPostingQueue = emlProvider.GetS("Config/SaveResult").ParseBool() ?? false;
                        string lbm = await fw.Entities.GetEntity(lbmId);

                        await fw.Trace(nameof(DoEmailProviders), $"Prior to evaluating LBM lbmId : {lbmId.ToString()}, lbm body: {lbm}, context is not null {context != null}, md5 : {md5 ?? ""}, emlProvider is not null: {emlProvider != null}");

                        eml = (string)await fw.RoslynWrapper.Evaluate(lbmId, lbm,
                            new { context, md5, provider = emlProvider, err = fw.Err }, new StateWrapper());

                        if (!eml.IsNullOrWhitespace())
                        {
                            //PostVisitorIdToConsole(email, $"VisitorId-{pid}", pixelDomain, clientIp, userAgent);
                            var postResult = await PostVisitorIdToConsole(fw, eml, pid, pixelDomain, clientIp, userAgent, lastVisit);
                            if (postResult.success && ! postResult.postData.IsNullOrWhitespace() )
                            {
                                be = new EdwBulkEvent();
                                be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                                    null, PL.FromJsonString(postResult.postData).Add(PL.O(new { et = "ConsoleMd5PostVisitorIdData", pid })));
                                await fw.EdwWriter.Write(be);
                            }

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
                                    eml,
                                    lastVisit
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
                await fw.PostingQueueWriter.Write(new PostingQueueEntry(DataLayerName, DateTime.Now,
                   PL.O(new
                   {
                       rsids,
                       sid,
                       slot,
                       page,
                       md5Pid,
                       md5Slot,
                       md5Page,
                       lastVisit
                   })
                   .Add(PL.N("seq", SL.C(this.VisitorIdEmailProviderSequences[visitorIdEmailProviderSequence])))
                   .Add(PL.N("rsids", PL.D(rsids))).ToString()));
            }

            await WriteCodePathEvent(PL.O(new { branch = nameof(DoEmailProviders), loc = "end" } ));
            return cookieEml;
        }

        public async Task SaveSessionEmailMd5 (FrameworkWrapper fw, VisitorIdResponse vidResp, string connection = DataLayerName)
        {
            if ( !string.IsNullOrWhiteSpace(vidResp.Email) )
            {
                await Data.CallFn(connection,
                "SaveSessionIdEmailMd5",
                JsonWrapper.Json(new { vidResp.CookieData.sid, vidResp.Email, vidResp.Md5 }),
                "");

                await fw.Log(nameof(SaveSessionEmailMd5), $"Successfully saved Visitor SessionId: {vidResp.CookieData.sid}, Email: {vidResp.Email}, Md5: {vidResp.Md5}");
            }

        }

        public async Task<bool> ProviderSessionMd5Exists(FrameworkWrapper fw, string pid, string sid, string md5)
        {
            if (pid.IsNullOrWhitespace() ||
                sid.IsNullOrWhitespace() ||
                md5.IsNullOrWhitespace() ||
                ! Guid.TryParse(pid, out Guid parsedPidGuid))
            {
                return false; // callers just go about their business
            }
            var result = await Data.CallFnString("VisitorId", "ProviderSessionMd5Check", "", Jw.Json(new { pid, vid = sid, md5 }));
            IGenericEntity geResult;
            try
            {
                geResult = Jw.JsonToGenericEntity(result);
            }
            catch (Exception e)
            {
                await fw.Error(nameof(ProviderSessionMd5Exists), $"Unable to deserialize output of database function for pid {pid}, sid {sid}, md5 {md5} : DB returned {result} to Json: {e.StackTrace}");
                return true;
            }
            if (geResult.GetS("r") == "dup")
            {
                await fw.Trace(nameof(ProviderSessionMd5Exists), $"Md5 Provider {pid} previously supplied md5 {md5} for session {sid}");
                return true;
            }
            else if (geResult.GetS("r") == "new" )
            {
                await fw.Trace(nameof(ProviderSessionMd5Exists), $"Md5 Provider {pid} supplied new md5 {md5} for session {sid}");
                return false;
            }
            else if (geResult.GetS("r") == "err" )
            {
                await fw.Error(nameof(ProviderSessionMd5Exists), $"Error checking for record on Md5 Provider {pid} for md5 {md5} for session {sid}: {geResult.GetS("msg")}");
                return true; // count this as a dupe since we don't want to add another Md5ProviderResponse to the EDW
            }
            else
            {
                await fw.Error(nameof(ProviderSessionMd5Exists), $"Error checking for record on Md5 Provider {pid} for md5 {md5} for session {sid}: Unexpected response from database");
                return true; // count this as a dupe since we don't want to add another Md5ProviderResponse to the EDW
            }
        }

        public async Task<(bool success, string postData)> PostMd5LeadDataToConsole(FrameworkWrapper fw, string md5, string domain, string provider)
        {
            await WriteCodePathEvent(PL.O(new { branch = nameof(PostMd5LeadDataToConsole), loc = "start" }));
            var header = Jw.Json(new { svc = 1, page = -1 }, new bool[] { false, false });
            var result = await Data.CallFnString("VisitorId", "LookupLeadByMd5", Jw.Json(new { md5 = md5 }), "{}",this.SqlTimeoutSec);
            if (result == null || result == Jw.Empty)
            {
                await fw.Log(nameof(PostMd5LeadDataToConsole), $"Unable to find adequate lead data for md5: {md5} on domain: {domain} from pid: {provider}");
                return (success: false, postData: "");
            }

            var ge = JsonWrapper.JsonToGenericEntity(result);
            var body = Jw.Json(new
            {
                domain_id = fw.StartupConfiguration.GetS("Config/OnPointConsoleDomainId"),
                email = ge.GetS("Email"),
                first_name = ge.GetS("FirstName"),
                last_name = ge.GetS("LastName"),
                zip_code = ge.GetS("Zip"),
                original_optin_date = ge.GetS("OptInDate"),
                original_optin_domain = ge.GetS("OptInDomain"),
                ip_address = ge.GetS("IP"),
                label_domain = domain,
                provider
            });
            await fw.Log(nameof(PostMd5LeadDataToConsole), $"Found adequate lead data for md5: {md5} on domain: {domain} from pid: {provider}, as: {ge.GetS("Email")}");
            var postResult = PostDataToConsole(fw, ge.GetS("Email"), header, body, nameof(PostMd5LeadDataToConsole));
            await WriteCodePathEvent(PL.O(new { branch = nameof(PostMd5LeadDataToConsole), loc = "end" }));
            return postResult;
        }

        public async Task<(bool success, string postData)> PostVisitorIdToConsole(FrameworkWrapper fw, string plainTextEmail, string provider, string domain, string clientIp, string userAgent, string lastVisit)
        {
            await WriteCodePathEvent(PL.O(new { branch = nameof(PostVisitorIdToConsole), loc = "start" }));
            var onPointConsoleDomainId = fw.StartupConfiguration.GetS("Config/OnPointConsoleDomainId");
            if (onPointConsoleDomainId.IsNullOrWhitespace())
            {
                await fw.Error(nameof(PostVisitorIdToConsole), $"Console domain id is not set, still posting to Console for email {plainTextEmail}");
            }
            var header = Jw.Json(new { svc = 1, page = -1 }, new bool[] { false, false });
            var body = Jw.Json(new
            {
                domain_id = onPointConsoleDomainId,
                email = plainTextEmail,
                user_ip = clientIp,
                user_agent = userAgent,
                email_source = "visitorid",
                provider,
                isFinal = "true",
                label_domain = domain,
                lastVisit
            });
            var postResult = PostDataToConsole(fw, plainTextEmail, header, body, nameof(PostVisitorIdToConsole));
            await WriteCodePathEvent(PL.O(new { branch = nameof(PostVisitorIdToConsole), loc = "end" }));
            return postResult;
        }

        public bool? IsExpenseGenerating(FrameworkWrapper fw, string host, string lastSelectedTimeStr, string pid)
        {
            bool? isExpenseGenerating = null;
            if (pid == "cookie") return false; // this shouldn't be hard-coded, fix at caller

            // Needs to be done here, since we're called from TraverseResponse as well, and this isn't in context
            var md5ProviderBillingModel = JsonConvert.DeserializeObject<Dictionary<Guid,string>>(fw.StartupConfiguration.GetS("Config/Md5BillingModel"));

            try
            {
                DateTime lastSelectedTime = string.IsNullOrWhiteSpace(lastSelectedTimeStr) ?  DateTime.MinValue : Convert.ToDateTime(lastSelectedTimeStr);
                if ( ! md5ProviderBillingModel.TryGetValue(new Guid(pid), out string billingModel) )
                {
                    fw.Error(nameof(IsExpenseGenerating), $"Billing model not found for host {host} on pid {pid}, marking as expense-generating as a precaution");
                    return isExpenseGenerating;
                }
                switch(billingModel)
                {
                    case "1d":
                        isExpenseGenerating = (DateTime.UtcNow - lastSelectedTime).TotalHours > 24;
                        break;
                    case "WithinMonth":
                        isExpenseGenerating = DateTime.UtcNow.Month == lastSelectedTime.Month;
                        break;
                    case "NoExpense":
                        isExpenseGenerating = false;
                        break;
                    default:
                        fw.Error(nameof(IsExpenseGenerating), $"Unexpected billing model value found for host {host} on pid {pid} when determining expense: {billingModel}");
                        break;
                }
            }
            catch (Exception e)
            {
                fw.Error(nameof(IsExpenseGenerating), $"Error determining billing model value for host {host} on pid {pid}: {e.UnwrapForLog()}");
            }
            fw.Trace(nameof(IsExpenseGenerating), $"Billing model for host {host} on pid {pid} determined provider response is {(isExpenseGenerating == true ? "" : "not ")}expense generating");
            return isExpenseGenerating;

        }

        public (bool success, string postData) PostDataToConsole(FrameworkWrapper fw, string key, string header, string body, string caller)
        {

            var onPointConsoleUrl = fw.StartupConfiguration.GetS("Config/OnPointConsoleUrl");
            if (onPointConsoleUrl.IsNullOrWhitespace())
            {
                fw.Error(caller, $"Console endpoint is not set. Failed to post {key} to Console  with data {body}");
                return (success: false, postData : "");
            }
            bool success = false;
            string postData = "";
            var task = new Func<Task>(async () =>
            {
                try
                {
                    postData = Jw.Json(new
                    {
                        header,
                        body
                    }, new bool[] { false, false });
                    await ProtocolClient.HttpPostAsync(onPointConsoleUrl, postData, "application/json");

                    await fw.Trace(caller, $"Successfully posted {key} to Console endpoint {onPointConsoleUrl} with data {postData}.");
                    success = true;
                }
                catch (Exception e)
                {
                    await fw.Error(caller, $"Failed to post {key} to Console endpoint {onPointConsoleUrl} with data {postData}. Exception: {e.UnwrapForLog()}");
                    success = false;
                }
            });
            Task.Run(task);
            return (success: success, postData: postData);
        }

        public async Task WriteCodePathRs(PL payload, DateTime timestamp, bool sendPayloadToLog = true)
        {
            if (!this.CodePathEventsEnabled) { return; }
            try
            {
                if (this.CodePathRsGuid == null)
                {
                    await this.Fw.Error(nameof(WriteCodePathRs), $"Attempt to write code path reporting sequence but ReportingSequenceId for run is not set");
                    return;
                }
                if (sendPayloadToLog)
                {
                    await this.Fw.Trace(nameof(WriteCodePathRs), payload.ToString());
                }
                var be = new EdwBulkEvent();
                be.AddRS(EdwBulkEvent.EdwType.Immediate, this.CodePathRsGuid, timestamp, payload, this.CodePathRsid);
                await this.Fw.EdwWriter.Write(be);
            }
            catch(Exception e)
            {
                try
                {
                    await this.Fw.Error(nameof(WriteCodePathRs), $"Attempt to write code path reporting sequence was catastrophic: {e.UnwrapForLog()}");
                }
                catch (Exception)
                {
                    // swallow for now
                }
            }

        }

        public async Task WriteCodePathEvent(PL payload, bool sendPayloadToLog = true)
        {
            if (!this.CodePathEventsEnabled) { return; }
            try
            {
                if (this.CodePathRsGuid == null)
                {
                    await this.Fw.Error(nameof(WriteCodePathRs), $"Attempt to write code path event but ReportingSequenceId for overall run is not set");
                    return;
                }
                if (sendPayloadToLog)
                {
                    await this.Fw.Trace(nameof(WriteCodePathEvent), payload.ToString());
                    return;
                }
                var be = new EdwBulkEvent();
                be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, new Dictionary<string, object> { { "CodePathRsGuid", this.CodePathRsGuid } }, null, payload);
                await this.Fw.EdwWriter.Write(be);
            }
            catch(Exception e)
            {
                try
                {
                    await this.Fw.Error(nameof(WriteCodePathRs), $"Attempt to write code path event was catastrophic: {e.UnwrapForLog()}");
                }
                catch (Exception)
                {
                    // swallow for now
                }
            }
        }

    }
}
