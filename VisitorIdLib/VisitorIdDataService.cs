using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Utility;
using Utility.DataLayer;
using Utility.EDW.Logging;
using Utility.EDW.Queueing;
using Utility.EDW.Reporting;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;
using Vutil = VisitorIdLib.Util;

namespace VisitorIdLib
{
    public class VisitorIdDataService
    {
        private const string DataLayerName = "VisitorId";
        public FrameworkWrapper Fw;

        public Guid CodePathRsid;
        public bool CodePathEventsEnabled;
        public (Guid VidRsid, Guid DomainRsid, Guid PageRsid) RsConfigIds;
        public string TowerEncryptionKey;
        public Dictionary<string, List<(string Domain, bool isAsync, List<(string Md5provider, string EmailProviderSeq)> SlotSequence)>> VisitorIdMd5ProviderSequences =
            new Dictionary<string, List<(string Domain, bool isAsync, List<(string Md5provider, string EmailProviderSeq)>)>>();
        public Dictionary<string, List<string>> VisitorIdEmailProviderSequences = new Dictionary<string, List<string>>();
        public List<(Guid IncidentId, Guid Md5Pid, DateTime StartDate, DateTime EndDate)> PoisonIncidentList = new List<(Guid IncidentId, Guid Md5Pid, DateTime StartDate, DateTime EndDate)>();
        public int SqlTimeoutSec;
        public TimeSpan SessionDuration;
        public string CookieName;
        public string CookieVersion;
        public List<Guid> Md5ExcludeList;
        public readonly DateTime CookieExpirationDate = new DateTime(2038, 1, 19);
        public string OnPointConsoleDomainId;
        public string OnPointConsoleUrl;
        public const string CookieMd5Pid = "B484C2D3-BD77-491F-B63B-BE3B010D73BE";
        public const string CookieEmailPid = "E4208B3A-0B21-4D06-B348-1CCC5715F66E";
        private string _consoleDomainId;

        public void Config(FrameworkWrapper fw)
        {
            Fw = fw;
            CodePathRsid = new Guid(fw.StartupConfiguration.GetS("Config/CodePathRsid"));
            CodePathEventsEnabled = fw.StartupConfiguration.GetB("Config/CodePathEventsEnabled");
            RsConfigIds = (VidRsid: new Guid(fw.StartupConfiguration.GetS("Config/VidRsid")),
                                DomainRsid: new Guid(fw.StartupConfiguration.GetS("Config/DomainRsid")),
                                PageRsid: new Guid(fw.StartupConfiguration.GetS("Config/PageRsid")));
            TowerEncryptionKey = fw.StartupConfiguration.GetS("Config/TowerEncryptionKey");
            SqlTimeoutSec = fw.StartupConfiguration.GetS("Config/SqlTimeoutSec").ParseInt() ?? 5;
            SessionDuration = new TimeSpan(fw.StartupConfiguration.GetS("Config/SessionDurationDays").ParseInt() ?? 75, 0, 0, 0);
            CookieName = fw.StartupConfiguration.GetS("Config/CookieName") ?? "vidck";
            CookieVersion = fw.StartupConfiguration.GetS("Config/CookieVersion") ?? "1";
            Md5ExcludeList = Vutil.Md5ExcludeList(fw.StartupConfiguration.GetL("Config/Md5ExcludeList"));
            OnPointConsoleDomainId = fw.StartupConfiguration.GetS("Config/OnPointConsoleDomainId");
            OnPointConsoleUrl = fw.StartupConfiguration.GetS("Config/OnPointConsoleUrl");
            ConfigProviders(Fw);

            IGenericEntity incidents = Data.CallFn("Config", "SelectConfigBody", Jw.Json(new { ConfigType = "VisitorIdPoisonIncident" }), "").GetAwaiter().GetResult();
            foreach (var incident in incidents.GetL("") )
            {
                PoisonIncidentList.Add(
                    (IncidentId : Guid.Parse(incident.GetS("Id")),
                     Md5Pid: Guid.Parse(incident.GetS("Config/md5pid")),
                     StartDate : Convert.ToDateTime(incident.GetS("Config/start_date")),
                     EndDate : Convert.ToDateTime(incident.GetS("Config/end_date")))
                );
            }
            _consoleDomainId = fw.StartupConfiguration.GetS("Config/OnPointConsoleDomainId");
        }

        public VisitorIdDataService ConfigProviders(FrameworkWrapper fw)
        {
            foreach (var afidCfg in fw.StartupConfiguration.GetL("Config/VisitorIdMd5ProviderSequences"))
            {
                var afid = afidCfg.GetS("afid");
                var isAsync = (afidCfg.GetS("async") == "true");
                var afidSeqs =
                    new List<(string Domain, bool isAsync, List<(string Md5provider, string EmailProviderSeq)>)>();
                foreach (var afidCfgSeq in afidCfg.GetL("seqs"))
                {
                    var domain = afidCfgSeq.GetS("dom");
                    var isAsyncDom = !afidCfgSeq.GetS("async").IsNullOrWhitespace() ? afidCfgSeq.GetS("async") == "true" : isAsync;
                    var md5seq = new List<(string Md5provider, string EmailProviderSeq)>();
                    foreach (var dgvipm in afidCfgSeq.GetL("seq"))
                    {
                        var md5ProviderStr = dgvipm.GetS("");
                        var md5ProviderStrParts = md5ProviderStr.Split('|');
                        md5seq.Add((md5ProviderStrParts[0],
                            md5ProviderStrParts.Length > 1 ? md5ProviderStrParts[1] : null));
                    }
                    afidSeqs.Add((domain, isAsyncDom, md5seq));
                }
                VisitorIdMd5ProviderSequences.Add(afid, afidSeqs);
            }

            foreach (var gvip in fw.StartupConfiguration.GetL("Config/VisitorIdEmailProviderSequences"))
            {
                var emProviderSeqName = gvip.GetS("name");
                var dseq = new List<string>();
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
            context.Response.Headers.Add("Cache-Control", "no-cache, no-store");
            context.Response.Headers.Add("Expires", "-1");
            var requestFromPost = "";
            var result = Jw.Json(new { Error = "SeeLogs" });
            try
            {
                requestFromPost = await context.GetRawBodyStringAsync();
                var visitTime = DateTime.UtcNow;
                var codePathRsid = Guid.NewGuid();
                var codePathRsidDict = new Dictionary<string, object> { { "CodePathRsid", codePathRsid } };
                await WriteCodePathRs(PL.O(new { method = nameof(Run) }), visitTime, codePathRsid);

                if (!string.IsNullOrWhiteSpace(context.Request.Query["m"]))
                {
                    string m = context.Request.Query["m"];
                    switch (m)
                    {
                        case "Initialize":
                            await WriteCodePathEvent(PL.O(new { branch = "Initialize", loc = "start" }), codePathRsidDict);
                            var initReturn = await WriteBlankCookieUnlessExists(Fw, context, codePathRsidDict);
                            result = initReturn.Result;
                            await WriteCodePathEvent(PL.O(new { branch = "Initialize", loc = "end" }), codePathRsidDict);
                            break;
                        case "VisitorId":
                            await WriteCodePathEvent(PL.O(new { branch = "VisitorId", loc = "start" }), codePathRsidDict);
                            var bootstrap = context.Request.Query["bootstrap"] == "1";
                            await WriteCodePathEvent(PL.O(new { branch = "VisitorId", loc = "body", bootstrap }), codePathRsidDict);

                            var resDV = await DoVisitorId(Fw, context, bootstrap, codePathRsidDict);

                            result = resDV.Result;
                            resDV.CookieData.md5 = resDV.Md5.IfNullOrWhitespace(resDV.CookieData.md5);
                            resDV.CookieData.em = resDV.Email.IfNullOrWhitespace(resDV.CookieData.em);
                            resDV.CookieData.md5pid = resDV.Md5Pid.IsNullOrWhitespace() ? resDV.CookieData.md5pid : resDV.Md5Pid;
                            resDV.CookieData.md5date = resDV.Md5Date.IsNullOrWhitespace() ? resDV.CookieData.md5date : resDV.Md5Date;

                            context.SetCookie(CookieName, resDV.CookieData.ToJson(), CookieExpirationDate);
                            await WriteCodePathEvent(PL.O(new { branch = "VisitorId", loc = "end", cookieData = resDV.CookieData.ToJson() },
                                                   new bool[] { true, true, false }), codePathRsidDict);
                            break;
                        case "dataSubmitted":
                            await DataSubmitted(Fw, context, codePathRsidDict);

                            break;
                        case "SaveSession":
                            await WriteCodePathEvent(PL.O(new { branch = "SaveSession", loc = "start" }), codePathRsidDict);
                            var resSS = await SaveSession(Fw, context, true, true);

                            result = resSS.Result;

                            resSS.CookieData.md5 = resSS.Md5.IfNullOrWhitespace(resSS.CookieData.md5);
                            resSS.CookieData.em = resSS.Email.IfNullOrWhitespace(resSS.CookieData.em);
                            resSS.CookieData.md5pid = resSS.Md5Pid.IsNullOrWhitespace() ? resSS.CookieData.md5pid : resSS.Md5Pid;
                            resSS.CookieData.md5date = resSS.Md5Date.IsNullOrWhitespace() ? resSS.CookieData.md5date : resSS.Md5Date;

                            context.SetCookie(CookieName, resSS.CookieData.ToJson(), CookieExpirationDate);
                            await WriteCodePathEvent(PL.O(new { branch = "SaveSession", loc = "end", cookieData = resSS.CookieData.ToJson() },
                                                   new bool[] { true, true, false }), codePathRsidDict);

                            break;
                        case "TestService":
                            await WriteCodePathEvent(PL.O(new { branch = "TestService", loc = "start" }), codePathRsidDict);
                            var idx1 = context.Request.Query["i"].FirstOrDefault().ParseInt();
                            await WriteCodePathEvent(PL.O(new { branch = "TestService", loc = "body", idx = idx1 }), codePathRsidDict);
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
                                                   new bool[] { true, true, false }), codePathRsidDict);
                            break;
                        default:
                            await Fw.Err(1000, "Start", "Error", "Unknown request: " + requestFromPost);
                            break;
                    }
                }
                else if (!string.IsNullOrWhiteSpace(context.Request.Query["eqs"]))
                {
                    await WriteCodePathEvent(PL.O(new { branch = "Tower", loc = "start" }), codePathRsidDict);
                    (var op, var md5) = await TowerWrapper.ProcessTowerMessage(Fw, context, TowerEncryptionKey);
                    if (op == null)
                    {
                        result = Jw.Json(new { email = "", md5 = "" });
                    }
                    else
                    {
                        result = (await SaveSession(Fw, context, true, true, null, op, md5)).Result;
                    }
                    await WriteCodePathEvent(PL.O(new { branch = "Tower", loc = "end", result },
                                           new bool[] { true, true, false }), codePathRsidDict);
                }
                else
                {
                    await Fw.Err(1000, "Start", "Tracking", "Unknown request: " + requestFromPost);
                }
            }
            catch (Exception ex)
            {
                await Fw.Err(1000, "Start", "Exception", $@"{requestFromPost}::{ex}");
            }

            await context.WriteSuccessRespAsync(result);
        }

        public static string ReplaceToken(string tokenized, string opaque) => tokenized.Replace("[=OPAQUE=]", opaque);

        public async Task<VisitorIdResponse> WriteBlankCookieUnlessExists(FrameworkWrapper fw, HttpContext c, Dictionary<string, object> codePathRsidDict)
        {
            await WriteCodePathEvent(PL.O(new { branch = nameof(WriteBlankCookieUnlessExists), loc = "start" }), codePathRsidDict);
            if (c.Request.Cookies[CookieName].IsNullOrWhitespace()) // don't clobber existing cookies!
            {
                c.SetCookie(CookieName, "", CookieExpirationDate);
            }
            await WriteCodePathEvent(PL.O(new { branch = nameof(WriteBlankCookieUnlessExists), loc = "end" }), codePathRsidDict);
            return new VisitorIdResponse(result: Jw.Json(new { Initialized = true }), md5: "", md5pid: "", md5date: "", email: "", cookieData: new CookieData());
        }

        public async Task DataSubmitted(FrameworkWrapper fw, HttpContext c, Dictionary<string, object> codePathRsidDict)
        {
            string opaque64, opaque = null, qstr, host, path, lst;
            IGenericEntity opge;
            EdwBulkEvent be = null;
            var opqRsids = new Dictionary<string, object>();
            await WriteCodePathEvent(PL.O(new { branch = nameof(DataSubmitted), loc = "start" }), codePathRsidDict);

            try
            {
                opaque64 = c.Get("op", "");
                opaque = Hashing.Base64DecodeFromUrl(opaque64);
                opge = Jw.JsonToGenericEntity(opaque);
                var opqVals = ValsFromOpaque(opge);
                qstr = opqVals.qstr;
                lst = opqVals.lst;
                var u = opqVals.uri;
                host = u.Host ?? "";
                path = u.AbsolutePath ?? "";
                opqRsids = opqVals.rsids;
            }
            catch (Exception e)
            {
                await fw.Err(ErrorSeverity.Error, nameof(DoVisitorId), ErrorDescriptor.Exception, $"Failed to load state data. Exception: {e.Message} Opaque: {(opaque.IsNullOrWhitespace() ? "Opaque was empty" : opaque)}");
                throw;
            }

            var visitTime = DateTime.UtcNow;
            if (c.Request.Cookies[CookieName].IsNullOrWhitespace())
            {
                return;
            }
            var cookieData = new CookieData(visitTime, c.Request.Cookies[CookieName], CookieVersion, host, path, SessionDuration, RsConfigIds, newlyConstructed: false);
            foreach (var rsid in opqRsids)
            {
                cookieData.RsIdDict.Add(rsid.Key, rsid.Value);
            }

            foreach (var rsid in cookieData.RsIdDict)
            {
                codePathRsidDict.Add(rsid.Key, rsid.Value);
            }

            be = new EdwBulkEvent();
            var eventPayload = PL.O(new
            {
                et = Hashing.Base64DecodeFromUrl(c.Request.Query["type"])
            });

            eventPayload.Add(PL.O(new { data = Hashing.Base64DecodeFromUrl(c.Request.Query["data"]) }, new bool[] { false }));
            be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, cookieData.RsIdDict, null, eventPayload);
            await fw.EdwWriter.Write(be);
            await WriteCodePathEvent(PL.O(new { branch = nameof(DataSubmitted), loc = "body", eventPayload = eventPayload.ToString()}), codePathRsidDict);
        }

        public async Task<VisitorIdResponse> DoVisitorId(FrameworkWrapper fw, HttpContext c, bool bootstrap, Dictionary<string, object> codePathRsidDict)
        {
            string opaque64, opaque = null, afid, tpid, eml, md5, osid, sid, qstr, host, path, qury, lst, omd5pid;
            IGenericEntity opge;
            bool pfail;
            int slot, page, pfailSlot, pfailPage;
            EdwBulkEvent be = null;
            var opqRsids = new Dictionary<string, object>();
            await WriteCodePathEvent(PL.O(new { branch = nameof(DoVisitorId), loc = "start" }), codePathRsidDict);

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
                var u = opqVals.uri;
                host = u.Host ?? "";
                path = u.AbsolutePath ?? "";
                qury = u.Query ?? "";
                opqRsids = opqVals.rsids;
                pfail = opqVals.pfail;
                pfailSlot = opqVals.pfailslot;
                pfailPage = opqVals.pfailpage;
                omd5pid = opqVals.md5pid;
            }
            catch (Exception e)
            {
                await fw.Err(ErrorSeverity.Error, nameof(DoVisitorId), ErrorDescriptor.Exception, $"Failed to load state data. Exception: {e.Message} Opaque: {(opaque.IsNullOrWhitespace() ? "Opaque was empty" : opaque)}");
                throw;
            }

            var visitTime = DateTime.UtcNow;
            var cookieData = new CookieData(visitTime, c.Request.Cookies[CookieName], CookieVersion, host, path, SessionDuration, RsConfigIds, newlyConstructed: bootstrap);
            foreach (var rsid in opqRsids)
            {
                cookieData.RsIdDict.Add(rsid.Key, rsid.Value);
            }

            foreach (var rsid in cookieData.RsIdDict)
            {
                codePathRsidDict.Add(rsid.Key, rsid.Value);
            }

            sid = cookieData.sid.ToString();

            if (!osid.IsNullOrWhitespace() && osid != sid)
            {
                var msg = $"Mismatch between opaque session id '{osid}' and cookie session id '{sid}'";
                await fw.Err(ErrorSeverity.Warn, nameof(DoVisitorId), ErrorDescriptor.Log, msg);
                await WriteCodePathEvent(PL.O(new { branch = nameof(DoVisitorId), loc = "body", msg, osid, sid }), codePathRsidDict);
            }

            if (pfail)
            {
                be = new EdwBulkEvent();
                var eventPayload = PL.O(new
                {
                    et = "Md5ProviderFailure",
                    md5pid = omd5pid,
                    md5slot = pfailSlot,
                    md5page = pfailPage
                });
                be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, cookieData.RsIdDict, null, eventPayload);
                await fw.EdwWriter.Write(be);
            }

            // Consider accepting an existing Guid from opaque.rsid and using it or dropping
            // events to it, in addition to the events we drop specifically for vid
            if (bootstrap)
            {
                var eventPayload = PL.O(new
                {
                    qs = qstr,
                    ip = c.Connection.RemoteIpAddress,
                    h = host,
                    p = path,
                    q = qury,
                    afid,
                    tpid,
                    ua = c.Request.Headers["User-Agent"],
                    vt = visitTime.ToString()
                });

                eventPayload.Add(PL.O(new { op = opaque }, new bool[] { false }));
                eventPayload.Add(PL.O(new { qjs = QueryStringUtil.ParseQueryStringToJsonOrLog(qury, async (method, message) => { await Fw.Log(method, message); }) }, new bool[] { false }));

                var visitEvents = cookieData.VisitEventsWithPayload(eventPayload);
                visitEvents.RsList.ForEach(async rs => await fw.Trace(nameof(DoVisitorId), $"Preparing to write Reporting Sequence event: {rs.ToString()}"));
                visitEvents.EventList.ForEach(async evt => await fw.Trace(nameof(DoVisitorId), $"Preparing to write Session event: {evt.ToString()}"));
                await WriteCodePathEvent(PL.O(new { branch = nameof(DoVisitorId), loc = "body", eventPayload = eventPayload.ToString() },
                                       new bool[] { true, true, false }), codePathRsidDict);

                if (!c.Request.Cookies.ContainsKey(CookieName))
                {
                    await WriteCodePathEvent(PL.O(new { branch = nameof(DoVisitorId), loc = "body", msg = "cannot write 3rd party cookie" }), codePathRsidDict);
                    visitEvents.RsList.ForEach(async rs => await fw.EdwWriter.Write(rs));
                    be = new EdwBulkEvent();
                    be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, cookieData.RsIdDict, null, PL.O(new { et = "ThirdPartyCookieDisabled" }).Add(eventPayload));
                    await fw.EdwWriter.Write(be);
                    return new VisitorIdResponse(result: "", md5: "", md5pid: "", md5date: "", email: "", cookieData: cookieData);
                }

                CookieData.WriteVisitEvents(visitEvents, fw.EdwWriter);
            }

            var isAsync = true;
            List<(string Md5provider, string EmailProviderSeq)> visitorIdMd5ProviderSequence = new List<(string Md5provider, string EmailProviderSeq)>();
            foreach (var kvp in VisitorIdMd5ProviderSequences[afid])
            {
                if (host != "" && ((host == kvp.Domain) || host.EndsWith("." + kvp.Domain)))
                {
                    visitorIdMd5ProviderSequence = kvp.SlotSequence;
                    isAsync = kvp.isAsync;
                    break;
                }
                else if (kvp.Domain == "default") // allow default option anywhere in list
                {
                    if (visitorIdMd5ProviderSequence == null)
                    {
                        visitorIdMd5ProviderSequence = kvp.SlotSequence;
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
                                md5slot = slot,
                                md5page = page
                            }));
                        await fw.EdwWriter.Write(be);
                    }

                    var nextTask = visitorIdMd5ProviderSequence[slot].Md5provider;
                    var visitorIdEmailProviderSequence = visitorIdMd5ProviderSequence[slot].EmailProviderSeq;

                    await WriteCodePathEvent(PL.O(new { branch = nameof(DoVisitorId), loc = "body", seq = nextTask.ToLower() }), codePathRsidDict);
                    if (nextTask.ToLower() == "cookie" || nextTask == $"@{CookieMd5Pid}")
                    {
                        be = new EdwBulkEvent();
                        be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, cookieData.RsIdDict,
                            null, PL.O(new
                            {
                                et = "Md5ProviderSelected",
                                md5pid = CookieMd5Pid,
                                md5slot = slot,
                                md5page = page
                            }));
                        await fw.EdwWriter.Write(be);
                        cookieData.AddOrUpdateProviderSelect(CookieMd5Pid, DateTime.UtcNow);

                        if (!cookieData.md5.IsNullOrWhitespace() &&
                            cookieData.md5.ParseGuid() != null &&
                            Md5ExcludeList.Contains(new Guid(cookieData.md5)))
                        {
                            await Fw.Log(nameof(DoVisitorId), $"Removing exclude list md5 value '{cookieData.md5}' from client cookie");
                            await WriteCodePathEvent(PL.O(new { branch = nameof(DoVisitorId), loc = "Md5ExcludeListRemoval" }), codePathRsidDict);
                            cookieData.md5 = "";
                        }

                        if (cookieData.md5.IsNullOrWhitespace())
                        {
                            var lookupGe = await Data.CallFn("VisitorId",
                               "LookupProviderMd5EmailBySessionId",
                               Jw.Json(new { Sid = cookieData.sid }),
                               "", null, null, SqlTimeoutSec);

                            if (!lookupGe.GetS("Md5").IsNullOrWhitespace() ||
                                !lookupGe.GetS("Em").IsNullOrWhitespace())
                            {
                                be = new EdwBulkEvent();
                                be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, cookieData.RsIdDict,
                                null, PL.O(new
                                {
                                    et = "Md5EmailBySessionId",
                                    md5 = lookupGe.GetS("Md5"),
                                    em = lookupGe.GetS("Em"),
                                    md5pid = lookupGe.GetS("Md5Pid"),
                                    md5date = lookupGe.GetS("Ts")
                                }));
                                await fw.EdwWriter.Write(be);
                            }

                            cookieData.md5 = lookupGe.GetS("Md5");
                            cookieData.em = lookupGe.GetS("Em");
                            cookieData.md5pid = lookupGe.GetS("Md5Pid");
                            cookieData.md5date = lookupGe.GetS("Ts");

                        }

                        // Check for md5s over a date range from a provider which were reported as incorrect
                        var poisonIncident = cookieData.CheckForPoisonedMd5(PoisonIncidentList);
                        if (poisonIncident.HasValue)
                        {
                            be = new EdwBulkEvent();
                            be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, cookieData.RsIdDict,
                            null, PL.O(new
                            {
                                et = "Md5PoisonIncident",
                                incidentid = poisonIncident?.IncidentId,
                                md5pid = poisonIncident?.Md5Pid,
                                cookieData.md5,
                                md5date = poisonIncident?.Md5Date
                            }));
                            await fw.EdwWriter.Write(be);
                            cookieData.ClearPoisonedData();
                        }


                        var vidResp = await SaveSession(fw, c, sid, CookieMd5Pid, slot, page, cookieData.md5, cookieData.em, isAsync, visitorIdEmailProviderSequence, cookieData.RsIdDict, true, DateTime.UtcNow.ToString(), cookieData.VeryFirstVisit, afid, tpid, host, path, cookieData, c.Connection.RemoteIpAddress.ToString(), c.Request.Headers["User-Agent"]);
                        md5 = vidResp.Md5;
                        eml = vidResp.Email;

                        if (!md5.IsNullOrWhitespace())
                        {
                            var s = await fw.Entities.GetEntity(new Guid(CookieMd5Pid));
                            return new VisitorIdResponse(Jw.Json(new
                            {
                                config = s.GetS("Config"),
                                sid,
                                md5pid = CookieMd5Pid,
                                slot,
                                page,
                                isAsync = isAsync ? "true" : "false",
                                vieps = visitorIdEmailProviderSequence,
                                md5,
                                email = eml
                            },
                            new bool[] { false, true, true, true, true, true }),
                            md5,
                            md5pid: cookieData.md5pid,
                            md5date: cookieData.md5date,
                            eml,
                            cookieData);
                        }
                        continueToNextSlot();
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
                            return new VisitorIdResponse(Jw.Json(new { done = "1", sid }), md5, cookieData.md5pid, cookieData.md5date, eml, cookieData);
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
                            return new VisitorIdResponse(Jw.Json(new { done = "1", sid }), md5, cookieData.md5pid, cookieData.md5date, eml, cookieData);
                        }
                    }
                    else if (nextTask.ToLower() == "breakonsuccessmd5")
                    {
                        if (!md5.IsNullOrWhitespace())
                        {
                            return new VisitorIdResponse(Jw.Json(new { done = "1", sid }), md5, cookieData.md5pid, cookieData.md5date, eml, cookieData);
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
                            return new VisitorIdResponse(Jw.Json(new { done = "1", sid }), md5, cookieData.md5pid, cookieData.md5date, eml, cookieData);
                        }
                        else
                        {
                            continueToNextSlot();
                            continue;
                        }
                    }
                    else if (nextTask.ToLower() == "break")
                    {
                        return new VisitorIdResponse(Jw.Json(new { done = "1", sid }), md5, cookieData.md5pid, cookieData.md5date, eml, cookieData);
                    }
                    else if (nextTask[0] == '@')
                    {
                        var md5pid = nextTask.Substring(1);
                        // Update the opaque parm with the newly identified isAsync value so it can
                        // be used for providers that redirect back to use directly which has us call
                        // SaveSession before returning back to the javascript where the opaque parm
                        // is further updated.
                        var opq = JObject.Parse(opaque);
                        opq["isAsync"] = isAsync ? "true" : "false";
                        opq["sd"] = sid;
                        opq["md5pid"] = md5pid;
                        opq["vieps"] = visitorIdEmailProviderSequence;
                        opq["slot"] = slot;
                        opq["page"] = page;
                        opq["lst"] = cookieData.LastSelectTime(md5pid);
                        opq["vft"] = cookieData.VeryFirstVisit;
                        opq["rsid"] = JsonConvert.SerializeObject(cookieData.RsIdDict);
                        opq["ip"] = c.Connection.RemoteIpAddress?.ToString();
                        opq["ua"] = c.Request.Headers["User-Agent"].ToString();

                        opaque64 = Utility.Hashing.Base64EncodeForUrl(opq.ToString(Formatting.None));

                        var s = await fw.Entities.GetEntity(new Guid(md5pid));
                        be = new EdwBulkEvent();
                        be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, cookieData.RsIdDict,
                            null, PL.O(new
                            {
                                et = "Md5ProviderSelected",
                                md5pid,
                                md5slot = slot,
                                md5page = page
                            }));
                        await fw.EdwWriter.Write(be);
                        cookieData.AddOrUpdateProviderSelect(md5pid, DateTime.UtcNow);

                        return new VisitorIdResponse(Jw.Json(new
                        {
                            config = ReplaceToken(s.GetS("Config"), opaque64),
                            sid,
                            md5pid,
                            slot,
                            page,
                            isAsync = isAsync ? "true" : "false",
                            vieps = visitorIdEmailProviderSequence
                        },
                        new bool[] { false, true, true, true, true, true }), md5, cookieData.md5pid, cookieData.md5date,eml, cookieData);
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
                            md5slot = slot,
                            md5page = page
                        }));
                    await fw.EdwWriter.Write(be);
                }
            }
            catch (Exception ex)
            {
                await fw.Err(1000, "DoVisitorId", "Exception", ex.UnwrapForLog());
            }

            await WriteCodePathEvent(PL.O(new { branch = nameof(DoVisitorId), loc = "end" }), codePathRsidDict);

            return new VisitorIdResponse(Jw.Json(new { done = "1", sid }), md5, cookieData.md5pid, cookieData.md5date, eml, cookieData);
        }

        public async Task<VisitorIdResponse> SaveSession(FrameworkWrapper fw, HttpContext c, string sid,
            string md5pid, int slot, int page, string md5, string email, bool isAsync, string visitorIdEmailProviderSequence,
            Dictionary<string, object> rsids, bool hasClientContext, string lst, bool vft, string afid, string tpid, string host, string path, CookieData cookieData, string ip, string ua)
        {
            await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSession), loc = "start" }), rsids);
            await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSession), loc = "args", sid = sid ?? "''", md5pid = md5pid ?? "''", slot, page, md5 = md5 ?? "''", email = email ?? "''", vieps = visitorIdEmailProviderSequence ?? "''", lst = lst ?? "''", vft, afid = afid ?? "''", host }), rsids);
            var success = !md5.IsNullOrWhitespace();
            var foundMd5ProviderPid = false;

            if (VisitorIdMd5ProviderSequences.ContainsKey(afid))
            {
                foreach (var sequence in VisitorIdMd5ProviderSequences[afid])
                {
                    if (sequence.Domain == host)
                    {
                        foreach (var (Md5provider, EmailProviderSeq) in sequence.SlotSequence)
                        {
                            if (Md5provider.Contains(md5pid ?? ""))
                            {
                                foundMd5ProviderPid = true;
                            }
                        }

                    }
                }
            }

            if (foundMd5ProviderPid == false)
            {
                var msg = $"Unable to find referenced Md5 Provider Id pid '{md5pid}' while processing Md5 provider response";
                await Fw.Error("SaveSession", msg);
                await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSession), loc = "body", eventPayload = PL.O(new { msg, md5pid }) }), rsids);
                // Don't leave the branch for now
                //return new VisitorIdResponse(Jw.Json(new { slot, page, lv = lastVisit }), md5, email, cookieData);
            }

            try
            {
                var be = new EdwBulkEvent();
                var egBool = IsExpenseGenerating(fw, host, lst, md5pid);

                be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                    null, PL.O(new
                    {
                        et = "Md5ProviderResponse",
                        md5,
                        md5pid,
                        md5slot = slot,
                        md5page = page,
                        lst = lst ?? "",
                        domain = host,
                        eg = egBool == null ? null : (egBool == true ? "1" : "0"),
                        succ = success ? "1" : "0"
                    }));
                await fw.EdwWriter.Write(be);
            }
            catch (Exception e)
            {
                await Fw.Error(nameof(SaveSession), $"Caught exception attempting to write Md5ProviderResponse for pid: '{md5pid ?? ""}': {e.UnwrapForLog()}");
            }

            if (!success)
            {
                return new VisitorIdResponse(Jw.Json(new { Result = "Failure", slot, page }), md5, cookieData.md5pid, cookieData.md5date, email, cookieData);
            }

            string clientIp = null, userAgent = null;

            if (hasClientContext)
            {
                clientIp = c.Connection.RemoteIpAddress?.ToString();
                userAgent = c.UserAgent();
            }
            else
            {
                clientIp = ip;
                userAgent = ua;
            }

            string emailpid;
            (email, emailpid) = visitorIdEmailProviderSequence.IsNullOrWhitespace() ? ("", null) : await DoEmailProviders(fw, c, sid, md5, email, isAsync, visitorIdEmailProviderSequence, rsids, md5pid, slot, page, host, clientIp, userAgent, cookieData);

            if (!Md5ExcludeList.Contains(Guid.Parse(md5)))
            {
                var payload = PL.O(new
                {
                    ts = DateTime.Now,
                    visitorIdSessionId = sid,
                    md5slot = slot,
                    md5page = page,
                    md5 = Guid.Parse(md5),
                    email = email.IfNullOrWhitespace((string) null),
                    ipAddress = clientIp,
                    md5ProviderId = md5pid,
                    emailProviderId = string.IsNullOrWhiteSpace(email) ? null : emailpid,
                    affiliateId = afid,
                    thirdPartyId = tpid.IfNullOrWhitespace((string) null),
                    userAgent,
                    domain = host,
                    page = path,
                    consoleDomainId = _consoleDomainId,
                });
                payload.Add( PL.O(new { rsids = JsonConvert.SerializeObject(rsids) }, new bool[] { false }));

                var be = new EdwBulkEvent();
                be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids, null, PL.O(new { et = "VisitorIdSignal" }).Add(payload));
                await fw.EdwWriter.Write(be);
                await fw.PostingQueueWriter.Write(new PostingQueueEntry("VisitorIdSignal", DateTime.Now, payload.ToString()));
            }

            await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSession), loc = "end" }), rsids);
            return new VisitorIdResponse(Jw.Json(new { slot, page }), md5, md5pid, DateTime.UtcNow.ToString(), email, cookieData);
        }

        public static (
            string sid,
            int slot,
            int page,
            string md5pid,
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
            string tjsv,
            bool pfail,
            int pfailslot,
            int pfailpage,
            string lv,
            string ip,
            string ua
        ) ValsFromOpaque(IGenericEntity opge)
        {
            try
            {
                var sid = opge.GetS("sd");
                var slot = int.Parse(opge.GetS("slot") ?? "0");
                var page = int.Parse(opge.GetS("page") ?? "0");
                var md5pid = opge.GetS("md5pid");
                var isAsync = (opge.GetS("async") ?? "").ToLower() == "true";
                var vieps = opge.GetS("vieps");
                var md5 = opge.GetS("md5");
                var eml = Utility.Hashing.Base64DecodeFromUrl(opge.GetS("e"));
                var qstr = opge.GetS("qs");
                var uri = new Uri(HttpUtility.UrlDecode(qstr.IfNullOrWhitespace("about:blank")));
                var host = uri.Host ?? "";
                var lv = opge.GetS("lv");
                var afid = opge.GetS("afid");
                var tpid = opge.GetS("tpid");
                var lst = opge.GetS("lst");
                var vft = (opge.GetS("vft") ?? "").ToLower() == "true";
                var pfail = ((opge.GetS("pfail") ?? "").ToLower() == "true");
                var pfailslot = int.Parse(opge.GetS("pfailSlot") ?? "0");
                var pfailpage = int.Parse(opge.GetS("pfailPage") ?? "0");
                var tjsv = opge.GetS("tjsv");
                var ip = opge.GetS("ip");
                var ua = opge.GetS("ua");

                Dictionary<string, object> rsids = null;
                if (!string.IsNullOrWhiteSpace(opge.GetS("rsid")))
                {
                    rsids = JsonConvert.DeserializeObject<Dictionary<string, object>>(opge.GetS("rsid"));
                }

                return (sid, slot, page, md5pid, isAsync, vieps, md5, eml, rsids, host, uri, afid, tpid, qstr, lst, vft, tjsv, pfail, pfailslot, pfailpage, lv, ip, ua);
            }
            catch (Exception e)
            {
                throw new Exception(string.Format("{0}: Caught error extracting values from opaque: {1}, Exception: {2}", nameof(ValsFromOpaque), opge == null ? "opaque value is null" : opge.GetS(""), e.UnwrapForLog()));
            }
        }

        public async Task<VisitorIdResponse> SaveSession(FrameworkWrapper fw, HttpContext c, bool hasClientContext, bool canHaveCookie = true, CookieData cookieData = null, IGenericEntity op = null, string md5 = null)
        {
            await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSession), loc = "start" }), new Dictionary<string, object>());
            var opqVals = ValsFromOpaque(op ?? Vutil.OpaqueFromBase64(c.Get("op", "", false), async (method, message) => { await fw.Log(method, message); }));
            var opqValsToPl = PL.O(new { canHaveCookie, sid = opqVals.sid ?? "", opqVals.slot, opqVals.page, md5pid = opqVals.md5pid ?? "", vieps = opqVals.vieps ?? "", argsMd5 = md5 ?? "", md5 = opqVals.md5 ?? "", host = opqVals.host ?? "", afid = opqVals.afid ?? "", lst = opqVals.lst ?? "", opqVals.vft });
            await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSession), loc = "body" }).Add(opqValsToPl), opqVals.rsids);
            if (cookieData == null && canHaveCookie) // passed in a context where we haven't set it yet, but weren't called out of band from a real browser
            {
                cookieData = new CookieData(DateTime.UtcNow, c.Request.Cookies[CookieName], CookieVersion, opqVals.host, opqVals.uri.AbsolutePath, SessionDuration, RsConfigIds);
                await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSession), loc = "body", tjsv = opqVals.tjsv ?? "", cookieObj = JsonConvert.SerializeObject(cookieData) },
                                       new bool[] { true, true, true, false }), opqVals.rsids);

                foreach (var cookie_rsid in cookieData?.RsIdDict)
                {
                    if (!opqVals.rsids.ContainsKey(cookie_rsid.Key))
                    {
                        opqVals.rsids[cookie_rsid.Key] = cookie_rsid.Value;
                    }
                }

            }

            var response = await SaveSession(fw, c, opqVals.sid, opqVals.md5pid, opqVals.slot, opqVals.page, (md5 ?? opqVals.md5), opqVals.eml, opqVals.isAsync, opqVals.vieps, opqVals.rsids, hasClientContext, opqVals.lst, opqVals.vft, opqVals.afid, opqVals.tpid, opqVals.host, opqVals.uri.AbsolutePath, cookieData, opqVals.ip, opqVals.ua);
            await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSession), loc = "end" }), opqVals.rsids);
            return response;
        }

        public async Task<(string email, string emailpid)> DoEmailProviders(FrameworkWrapper fw, HttpContext context, string sid,
            string md5, string email, bool isAsync, string visitorIdEmailProviderSequence, Dictionary<string, object> rsids, string md5pid, int md5Slot, int md5Page, string host, string clientIp, string userAgent, CookieData cookieData)
        {
            await WriteCodePathEvent(PL.O(new { branch = nameof(DoEmailProviders), loc = "start" }), rsids);
            var cookieEml = "";
            var eml = "";
            var emailpid = "";
            var emailslot = 0;
            var emailpage = 0;

            foreach (var s in VisitorIdEmailProviderSequences[visitorIdEmailProviderSequence])
            {
                await WriteCodePathEvent(PL.O(new { branch = nameof(DoEmailProviders), loc = "body", seq = s.ToLower() }), rsids);
                if (s.ToLower() == "stopifemail")
                {
                    if (!email.IsNullOrWhitespace())
                    {
                        return (email, "");
                    }
                }
                else if (s.ToLower() == "cookie" || s == $"@{CookieEmailPid}")
                {
                    emailpid = CookieEmailPid;
                    var be = new EdwBulkEvent();
                    be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                        null, PL.O(new
                        {
                            et = "EmailProviderSelected",
                            emailpid,
                            emailslot,
                            emailpage,
                            md5pid,
                            md5Slot,
                            md5Page
                        }));
                    await fw.EdwWriter.Write(be);

                    eml = cookieData?.em;

                    if (eml.IsNullOrWhitespace() && !sid.IsNullOrWhitespace())
                    {
                        var lookupGe = await Data.CallFn("VisitorId",
                            "LookupBySessionId",
                            Jw.Json(new { Sid = sid }),
                            "", null, null, SqlTimeoutSec);
                        eml = lookupGe.GetS("Em");
                    }

                    if (!eml.IsNullOrWhitespace())
                    {
                        cookieEml = eml;
                    }

                    be = new EdwBulkEvent();
                    be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                        null, PL.O(new
                        {
                            et = "EmailProviderResponse",
                            emailpid,
                            eg = 0,
                            emailslot,
                            emailpage,
                            md5pid,
                            md5Slot,
                            md5Page,
                            eml = eml.IsNullOrWhitespace() ? "" : eml,
                            succ = eml.IsNullOrWhitespace() ? "0" : "1"
                        }));
                    await fw.EdwWriter.Write(be);

                    emailslot++;
                    if (!eml.IsNullOrWhitespace())
                    {
                        emailpage++;
                    }

                    continue;
                }
                else if (s.ToLower() == "continue")
                {
                    emailslot++;
                    if (isAsync)
                    {
                        break;
                    }

                    eml = "";
                    continue;
                }
                else if (s.ToLower() == "continueonsuccess")
                {
                    if (!eml.IsNullOrWhitespace())
                    {
                        emailslot++;
                        if (isAsync)
                        {
                            break;
                        }

                        eml = "";
                        continue;
                    }
                    else
                    {
                        return (cookieEml, emailpid);
                    }
                }
                else if (s.ToLower() == "breakonsuccess")
                {
                    if (!eml.IsNullOrWhitespace())
                    {
                        return (cookieEml, emailpid);
                    }
                    else
                    {
                        emailslot++;
                        if (isAsync)
                        {
                            break;
                        }

                        eml = "";
                        continue;
                    }
                }
                else if (s.ToLower() == "break")
                {
                    return (cookieEml, emailpid);
                }
                else if (s[0] == '@')
                {
                    emailpid = s.Substring(1);
                    var be = new EdwBulkEvent();
                    be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                        null, PL.O(new
                        {
                            et = "EmailProviderSelected",
                            emailpid,
                            emailslot,
                            emailpage,
                            md5pid,
                            md5Slot,
                            md5Page
                        }));
                    await fw.EdwWriter.Write(be);

                    var lbmId = Guid.Empty;
                    var errorContext = string.Empty;

                    try
                    {
                        errorContext = $"GetEntity {emailpid}";
                        var emlProvider = await fw.Entities.GetEntity(new Guid(emailpid));
                        lbmId = new Guid(emlProvider.GetS("Config/LbmId"));
                        var lbm = (await fw.Entities.GetEntity(lbmId))?.GetS("Config");

                        await fw.Trace(nameof(DoEmailProviders), $"Prior to evaluating LBM lbmId : {lbmId.ToString()}, lbm body: {lbm}, context is not null {context != null}, md5 : {md5 ?? ""}, emlProvider is not null: {emlProvider != null}");

                        errorContext = $"Evaluate {lbmId} md5: {md5} provider: {emlProvider}";
                        eml = (string)await fw.RoslynWrapper.Evaluate(lbmId, lbm,
                            new { context, md5, provider = emlProvider, err = fw.Err }, new StateWrapper());

                        if (!eml.IsNullOrWhitespace())
                        {
                            await SaveSessionEmailMd5(fw, md5pid, sid, eml, md5, rsids);

                            var writeImmediatelyToContact = emlProvider.GetS("DirectWriteToContact").ParseBool() ?? false;
                            if (writeImmediatelyToContact)
                            {
                                await Data.CallFn("Contact", "ContactEmailMerge", Jw.Json(new { email = eml }), "", null, null, SqlTimeoutSec);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        await fw.Err(ErrorSeverity.Error, nameof(DoEmailProviders), ErrorDescriptor.Exception, $"Failed to evaluate LBM {lbmId} for email provider {emailpid}. ErrorContext: {errorContext} Exception: {ex}");
                        emailslot++;
                        emailpage++;
                        continue;
                    }

                    if (!eml.IsNullOrWhitespace())
                    {
                        cookieEml = eml;
                    }

                    try
                    {
                        var egBool = IsExpenseGenerating(fw, host, "", emailpid);
                        be = new EdwBulkEvent();
                        be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                            null, PL.O(new
                            {
                                et = "EmailProviderResponse",
                                eg = egBool == null ? "" : (egBool == true ? "1" : "0"),
                                emailpid,
                                emailslot,
                                emailpage,
                                md5pid,
                                md5Slot,
                                md5Page,
                                eml = eml.IsNullOrWhitespace() ? "" : eml,
                                succ = eml.IsNullOrWhitespace() ? "0" : "1"
                            }));
                        await fw.EdwWriter.Write(be);
                    }
                    catch (Exception e)
                    {
                        await Fw.Error(nameof(SaveSession), $"Caught exception attempting to write EmailProviderResponse for pid: '{emailpid ?? ""}': {e.UnwrapForLog()}");
                    }

                    emailslot++;
                    emailpage++;
                }
                else
                {
                    await fw.Err(1000, "DoVisitorId", "Error", $"Unknown Email Provider Task Type: {s} Slot: {emailslot} Page: {emailpage}");
                    emailslot++;
                }
            }

            if (isAsync && (emailslot < VisitorIdEmailProviderSequences[visitorIdEmailProviderSequence].Count))
            {
                // ToDo: For this to work we need to remove the dependency on HttpContext
                await fw.PostingQueueWriter.Write(new PostingQueueEntry(DataLayerName, DateTime.Now,
                   PL.O(new
                   {
                       rsids,
                       sid,
                       emailslot,
                       emailpage,
                       md5pid,
                       md5Slot,
                       md5Page
                   })
                   .Add(PL.N("seq", SL.C(VisitorIdEmailProviderSequences[visitorIdEmailProviderSequence])))
                   .Add(PL.N("rsids", PL.D(rsids))).ToString()));
            }

            await WriteCodePathEvent(PL.O(new { branch = nameof(DoEmailProviders), loc = "end" }), rsids);
            return (cookieEml, emailpid);
        }

        public async Task SaveSessionEmailMd5(FrameworkWrapper fw, string md5pid, string sid, string email, string md5, Dictionary<string, object> rsids, string connection = DataLayerName)
        {
            await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSessionEmailMd5), loc = "end" }), rsids);
            try
            {
                await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSessionEmailMd5), loc = "body", sid, email, md5 }), rsids);
                await Data.CallFn(connection, "SaveProviderSessionIdEmailMd5", JsonWrapper.Json(new { Md5Pid = md5pid, Sid = sid, Email = email, Md5 = md5 }), "");
                await fw.Log(nameof(SaveSessionEmailMd5), $"Successfully saved Visitor SessionId: {sid}, Email: {email}, Md5: {md5}");
            }
            catch (Exception e)
            {
                await fw.Error(nameof(SaveSessionEmailMd5), $"Caught exception attempting to write session id '{sid}', email '{email}', md5 '{md5}': {e.UnwrapForLog()}");
            }
            await WriteCodePathEvent(PL.O(new { branch = nameof(SaveSessionEmailMd5), loc = "end" }), rsids);
        }

        public async Task<bool> ProviderSessionMd5Exists(FrameworkWrapper fw, string md5pid, string sid, string md5)
        {
            if (md5pid.IsNullOrWhitespace() ||
                sid.IsNullOrWhitespace() ||
                md5.IsNullOrWhitespace() ||
                !Guid.TryParse(md5pid, out var parsedPidGuid))
            {
                return false; // callers just go about their business
            }
            var result = await Data.CallFnString(DataLayerName, "ProviderSessionMd5Check", Jw.Json(new { provider_id = md5pid, session_id = sid, md5 }), "");
            IGenericEntity geResult;
            try
            {
                geResult = Jw.JsonToGenericEntity(result);
            }
            catch (Exception e)
            {
                await fw.Error(nameof(ProviderSessionMd5Exists), $"Unable to deserialize output of database function for pid {md5pid}, sid {sid}, md5 {md5} : DB returned {result} to Json: {e.StackTrace}");
                return true;
            }
            if (geResult.GetS("r") == "dup")
            {
                await fw.Trace(nameof(ProviderSessionMd5Exists), $"Md5 Provider {md5pid} previously supplied md5 {md5} for session {sid}");
                return true;
            }
            else if (geResult.GetS("r") == "new")
            {
                await fw.Trace(nameof(ProviderSessionMd5Exists), $"Md5 Provider {md5pid} supplied new md5 {md5} for session {sid}");
                return false;
            }
            else if (geResult.GetS("r") == "err")
            {
                await fw.Error(nameof(ProviderSessionMd5Exists), $"Error checking for record on Md5 Provider {md5pid} for md5 {md5} for session {sid}: {geResult.GetS("msg")}");
                return true; // count this as a dupe since we don't want to add another Md5ProviderResponse to the EDW
            }
            else
            {
                await fw.Error(nameof(ProviderSessionMd5Exists), $"Error checking for record on Md5 Provider {md5pid} for md5 {md5} for session {sid}: Unexpected response from database");
                return true; // count this as a dupe since we don't want to add another Md5ProviderResponse to the EDW
            }
        }

        public bool? IsExpenseGenerating(FrameworkWrapper fw, string host, string lastSelectedTimeStr, string pid)
        {
            bool? isExpenseGenerating = null;

            // Needs to be done here, since we're called from TraverseResponse as well, and this isn't in context
            var providerBillingModel = JsonConvert.DeserializeObject<Dictionary<Guid, string>>(fw.StartupConfiguration.GetS("Config/ProviderBillingModel"));

            try
            {
                DateTime.TryParse(lastSelectedTimeStr, out var lastSelectedTime);
                if (!providerBillingModel.TryGetValue(new Guid(pid), out var billingModel))
                {
                    fw.Error(nameof(IsExpenseGenerating), $"Billing model not found for host {host} on pid {pid}, marking as expense-generating as a precaution");
                    return isExpenseGenerating;
                }
                switch (billingModel)
                {
                    case "1d":
                        isExpenseGenerating = (DateTime.UtcNow - lastSelectedTime).TotalHours > 24;
                        break;
                    case "WithinMonth":
                        isExpenseGenerating = !(DateTime.UtcNow.Month == lastSelectedTime.Month && DateTime.UtcNow.Year == lastSelectedTime.Year);
                        break;
                    case "NoExpense":
                        isExpenseGenerating = false;
                        break;
                    case "AlwaysExpense":
                        isExpenseGenerating = true;
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

        public async Task WriteCodePathRs(PL payload, DateTime timestamp, Guid codePathRsGuid, bool sendPayloadToLog = true)
        {
            if (!CodePathEventsEnabled) { return; }
            try
            {
                if (sendPayloadToLog)
                {
                    await Fw.Trace(nameof(WriteCodePathRs), payload.ToString());
                }
                var be = new EdwBulkEvent();
                be.AddRS(EdwBulkEvent.EdwType.Immediate, codePathRsGuid, timestamp, payload, CodePathRsid);
                await Fw.EdwWriter.Write(be);
            }
            catch (Exception e)
            {
                try
                {
                    await Fw.Error(nameof(WriteCodePathRs), $"Attempt to write code path reporting sequence was catastrophic: {e.UnwrapForLog()}");
                }
                catch
                {
                    // swallow for now
                }
            }
        }

        public async Task WriteCodePathEvent(PL payload, Dictionary<string, object> rsidDict, bool sendPayloadToLog = true)
        {
            if (!CodePathEventsEnabled) { return; }
            try
            {
                if (sendPayloadToLog)
                {
                    await Fw.Trace(nameof(WriteCodePathEvent), payload.ToString());
                    return;
                }
                var be = new EdwBulkEvent();
                be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsidDict, null, payload);
                await Fw.EdwWriter.Write(be);
            }
            catch (Exception e)
            {
                try
                {
                    await Fw.Error(nameof(WriteCodePathRs), $"Attempt to write code path event was catastrophic: {e.UnwrapForLog()}");
                }
                catch
                {
                    // swallow for now
                }
            }
        }
    }
}
