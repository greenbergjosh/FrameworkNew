using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Runtime.Caching;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.EDW.Reporting;
using VisitorIdLib;
using Jw = Utility.JsonWrapper;
using Vutil = VisitorIdLib.Util;

namespace TraverseDataLib
{
    public class TraverseDataService
    {
        private const string DataLayerName = "TraverseResponse";
        public FrameworkWrapper Fw;
        public VisitorIdDataService Vid;
        public int SqlTimeoutSec;
        private static MemoryCache pidSidMd5Cache;
        private List<Guid> md5ExcludeList;
        private static int excludeSpanDays;
        private const string responseMd5Key = "emailMd5Lower";

        public void Config(FrameworkWrapper fw)
        {
            Fw = fw;
            SqlTimeoutSec = fw.StartupConfiguration.GetS("Config/SqlTimeoutSec").ParseInt() ?? 5;
            Vid = new VisitorIdDataService();
            Vid.Config(Fw);
            pidSidMd5Cache = MemoryCache.Default;
            md5ExcludeList = Vutil.Md5ExcludeList(Fw.StartupConfiguration.GetL("Config/Md5ExcludeList"));
            excludeSpanDays = fw.StartupConfiguration.GetS("Config/ExcludeSpanDays").IsNullOrWhitespace() ?
                30 :
                (int)fw.StartupConfiguration.GetS("Config/ExcludeSpanDays").ParseInt();
            PrimeCache().GetAwaiter().GetResult();
        }

        public static bool ExistsOrAddToMemoryCache(PidSidMd5 pidSidMd5, double cacheTimeInDays)
        {
            var cacheName = $"{pidSidMd5.Pid}.{pidSidMd5.Sid}.{pidSidMd5.Md5}";

            if (pidSidMd5Cache[cacheName] != null) { return true; }
            pidSidMd5Cache.Set(cacheName, pidSidMd5, new CacheItemPolicy() { AbsoluteExpiration = DateTimeOffset.Now.AddDays(cacheTimeInDays) });
            return false;
        }

        public async Task Run(HttpContext context)
        {
            var requestFromPost = "";
            var result = Jw.Json(new { Error = "SeeLogs" });
            var resultHttpStatus = StatusCodes.Status400BadRequest;
            try
            {

                if (!string.IsNullOrWhiteSpace(context.Request.Query["m"]))
                {
                    string m = context.Request.Query["m"];

                    switch (m)
                    {
                        case "TraverseResponse":
                            var (fullBodyGe, opaqueGe) = await TraverseResponseAsGe(context);
                            var (sid, slot, page, md5pid, isAsync, vieps, md5, eml, rsids, host, uri, afid, tpid, qstr, lst, vft, tjsv, pfail, pfailslot, pfailpage, lv, _, _) = VisitorIdDataService.ValsFromOpaque(opaqueGe);
                            var pidSidMd5 = new PidSidMd5() { Pid = md5pid, Sid = sid, Md5 = fullBodyGe.GetS(responseMd5Key), FirstSeen = DateTime.UtcNow };

                            var vidResp = new VisitorIdResponse("", "", "", null);
                            try
                            {
                                await WriteResponseEvent(md5pid, slot, page, lst, host, lv, vft, rsids, fullBodyGe.GetS(responseMd5Key));
                                if (!ExistsOrAddToMemoryCache(pidSidMd5, excludeSpanDays) &&
                                    !await ExistsOrAddToDbCache(pidSidMd5))
                                {
                                    await Fw.Trace(nameof(Run), $"Processing Traverse response from VID host {host}, pid {md5pid}, sid {sid}, md5 {fullBodyGe.GetS(responseMd5Key)}");
                                    vidResp = await Vid.SaveSession(Fw, context, false, false, null, opaqueGe, fullBodyGe.GetS(responseMd5Key));
                                }
                                else
                                {
                                    await WriteResponseEvent(md5pid, slot, page, lst, host, lv, vft, rsids, fullBodyGe.GetS(responseMd5Key), dupe: true);
                                }
                                result = JsonConvert.SerializeObject(vidResp);
                                resultHttpStatus = StatusCodes.Status202Accepted;
                            }
                            catch (Exception e)
                            {
                                resultHttpStatus = StatusCodes.Status500InternalServerError;
                                await Fw.Err(1000, nameof(Run), "Exception", $@"Caught exception in 'TraverseResponse' handler: {requestFromPost}::{e}, {e.UnwrapForLog()}");
                            }

                            break;
                        default:
                            await Fw.Err(1000, "Start", "Error", "Unknown request: " + requestFromPost);
                            break;
                    }
                }
                else
                {
                    await Fw.Err(1000, "Start", "Error", "Unknown request: " + requestFromPost);
                }
                await Fw.Trace(nameof(Run), $"On finish of request, returning http status {resultHttpStatus}");
            }
            catch (Exception ex)
            {
                await Fw.Err(1000, "Start", "Exception", $@"{requestFromPost}::{ex}");
            }
            await WriteResponse(resultHttpStatus, context, result);

        }

        public async Task WriteResponseEvent(string pid, int slot, int page, string lastSeenTime, string host, string lastVisit, bool veryFirstTime, Dictionary<string, object> rsids, string md5, bool dupe = false)
        {
            var rsidDict = new Dictionary<string, object>();
            if (rsids == null)
            {
                await Fw.Log(nameof(WriteResponseEvent), $"Called with null 'rsids' dictionary, supplying event with no related report sequence ids for pid '{pid ?? ""}', md5 {md5}, for host {host}");
            }
            var be = new EdwBulkEvent();
            var payload = PL.O(new
            {
                et = "TraverseMd5Response",
                pid = pid ?? "",
                slot,
                page,
                md5,
                lst = lastSeenTime ?? "",
                domain = host,
                lv = lastVisit ?? "",
                vft = veryFirstTime,
                dupe = dupe ? "1" : "0",
                succ = 1 // Traverse only responds with Md5s
            });
            be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids, null, payload);
            await Fw.EdwWriter.Write(be);
        }

        public async Task WriteResponse(int StatusCode, HttpContext context, string resp)
        {
            context.Response.StatusCode = StatusCode;
            context.Response.ContentType = "application/json";
            context.Response.ContentLength = resp.Length;
            await context.Response.WriteAsync(resp);
        }

        private async Task PrimeCache()
        {
            var recentMd5s = await GetRecentResponseMd5s();

            foreach (var datedMd5 in recentMd5s.GetL(""))
            {
                var pidSidMd5 = new PidSidMd5() { Pid = datedMd5.GetS("Pid"), Sid = datedMd5.GetS("Sid"), Md5 = datedMd5.GetS("Md5"), FirstSeen = Convert.ToDateTime(datedMd5.GetS("FirstSeen")) };
                var age = (DateTime.UtcNow - pidSidMd5.FirstSeen).TotalDays;
                var remaining = excludeSpanDays - age;
                if (remaining <= 0)
                {
                    continue;
                }

                ExistsOrAddToMemoryCache(pidSidMd5, remaining);
            }
        }

        private async Task<IGenericEntity> GetRecentResponseMd5s() => await Data.CallFn("TraverseResponse", "LookupRecentMd5Responses", JsonConvert.SerializeObject(new { days_ago = excludeSpanDays, exclude_list = md5ExcludeList }), Jw.Empty);


        public async Task<bool> ExistsOrAddToDbCache(PidSidMd5 pidSidMd5) => await Vid.ProviderSessionMd5Exists(Fw, pidSidMd5.Pid, pidSidMd5.Sid, pidSidMd5.Md5);

        public async Task<(IGenericEntity fullBodyGe, IGenericEntity opaqueGe)> TraverseResponseAsGe(HttpContext c)
        {
            /* From:https://traversedata.github.io/activity-identification-notification#consuming-identification-notifications 
               As of: 1/16/2019
               {
                 "campaignId": "6a11644c-690d-4bf3-bb19-4c3efba5a5a5",
                 "emailMd5Lower": "1105677c8d9decfa1e36a73ff5fb5531",
                 "emailSha1Lower": "ba9d46a037766855efca2730031bfc5db095c654",
                 "listIds": ["772823bd-b7be-4d23-bd78-96a577d02765"],
                 "advertiserProperties": {
                   "impressionId": "f53f6078-f802-4c98-90ca-e90aa56995ab",
                   "foo": "bar"
                  }
               }
               
               VisitorId sticks opaque into the path: 'advertiserProperties.op'
                
            */
            var fullBody = await c.GetRawBodyStringAsync();
            IGenericEntity fullBodyGe = null;
            IGenericEntity opaqueGe = null;
            try
            {
                fullBodyGe = Jw.JsonToGenericEntity(fullBody);
                opaqueGe = Vutil.OpaqueFromBase64(fullBodyGe.GetS("advertiserProperties.op"), async (method, message) => { await Fw.Log(method, message); });
            }
            catch (Exception e)
            {
                throw new ArgumentException($"Unable to parse values passed in from Traverse response: {fullBody}. Exception: {e.Message}", e);
            }
            return (fullBodyGe, opaqueGe);
        }

        public class PidSidMd5
        {
            public string Pid { get; set; }
            public string Sid { get; set; }
            public string Md5 { get; set; }
            public DateTime FirstSeen { get; set; }
        }


    }
}
