using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Utility;
using VisitorIdLib;
using Jw = Utility.JsonWrapper;
using Vutil = Utility.VisitorIdUtil;
using System.Runtime.Caching;
using Utility.DataLayer;
using Newtonsoft.Json;

namespace TraverseDataLib
{
    public class TraverseDataService
    {

        const string DataLayerName = "TraverseResponse";
        public FrameworkWrapper Fw;
        public VisitorIdDataService Vid;
        public int SqlTimeoutSec;
        static MemoryCache pidSidMd5Cache;
        List<Guid> md5ExcludeList;
        static int excludeSpanDays;
        const string responseMd5Key = "emailMd5Lower";

        public void Config(FrameworkWrapper fw)
        {
            this.Fw = fw;
            this.SqlTimeoutSec = fw.StartupConfiguration.GetS("Config/SqlTimeoutSec").ParseInt() ?? 5;
            this.Vid = new VisitorIdDataService().ConfigProviders(this.Fw);
            pidSidMd5Cache = MemoryCache.Default;
            this.md5ExcludeList = Vutil.Md5ExcludeList(this.Fw.StartupConfiguration.GetL("Config/Md5ExcludeList"));
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
            string requestFromPost = "";
            var result = Jw.Json(new { Error = "SeeLogs" });
            int resultHttpStatus = StatusCodes.Status400BadRequest;
            try
            {

                if (!String.IsNullOrWhiteSpace(context.Request.Query["m"]))
                {
                    string m = context.Request.Query["m"];

                    switch (m)
                    {
                        case "TraverseResponse":
                            var (fullBodyGe, opaqueGe) = await TraverseResponseAsGe(context);
                            var opqVals = VisitorIdDataService.ValsFromOpaque(opaqueGe);
                            var pidSidMd5 = new PidSidMd5() { Pid = opqVals.pid, Sid = opqVals.sid, Md5 = fullBodyGe.GetS(responseMd5Key), FirstSeen = DateTime.UtcNow };

                            VisitorIdResponse vidResp = new VisitorIdResponse("", "", "", null);
                            try
                            {
                                await WriteResponseEvent(opqVals.pid, opqVals.slot, opqVals.page, opqVals.lst, opqVals.host, opqVals.lv, opqVals.vft, opqVals.rsids, fullBodyGe.GetS(responseMd5Key));
                                if (!ExistsOrAddToMemoryCache(pidSidMd5, excludeSpanDays) &&
                                    !await ExistsOrAddToDbCache(pidSidMd5))
                                {
                                    await this.Fw.Trace(nameof(Run), $"Processing Traverse response from VID host {opqVals.host}, pid {opqVals.pid}, sid {opqVals.sid}, md5 {fullBodyGe.GetS(responseMd5Key)}");
                                    vidResp = await Vid.SaveSession(this.Fw, context, true, false, false, null, opaqueGe, fullBodyGe.GetS(responseMd5Key));
                                }
                                result = Jw.Json(vidResp);
                                resultHttpStatus = StatusCodes.Status202Accepted;
                            }
                            catch (Exception e)
                            {
                                resultHttpStatus = StatusCodes.Status500InternalServerError;
                                await this.Fw.Err(1000, nameof(Run), "Exception", $@"Caught exception in 'TraverseResponse' handler: {requestFromPost}::{e}, {e.UnwrapForLog()}");
                            }

                            break;
                        default:
                            await this.Fw.Err(1000, "Start", "Error", "Unknown request: " + requestFromPost);
                            break;
                    }
                }
                else
                {
                    await this.Fw.Err(1000, "Start", "Error", "Unknown request: " + requestFromPost);
                }
            }
            catch (Exception ex)
            {
                await this.Fw.Err(1000, "Start", "Exception", $@"{requestFromPost}::{ex}");
            }
            await WriteResponse(resultHttpStatus, context, result);

        }

        public async Task WriteResponseEvent(string pid, int slot, int page, string lastSeenTime, string host, string lastVisit, bool veryFirstTime, Dictionary<string, object> rsids, string md5)
        {
            EdwBulkEvent be = new EdwBulkEvent();
            be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids,
                null, PL.O(new
                {
                    et = "TraverseMd5Response",
                    pid,
                    slot,
                    page,
                    md5,
                    lst = lastSeenTime ?? "",
                    domain = host,
                    lv = lastVisit ?? "",
                    vft = veryFirstTime,
                    succ = 1 // Traverse only responds with Md5s
                }));
            await this.Fw.EdwWriter.Write(be);
        }

        public async Task WriteResponse(int StatusCode, HttpContext context, string resp)
        {
            context.Response.StatusCode = StatusCode;
            context.Response.ContentType = "application/json";
            context.Response.ContentLength = resp.Length;
            await context.Response.WriteAsync(resp);
        }

        async Task PrimeCache()
        {
            IGenericEntity recentMd5s = await GetRecentResponseMd5s();

            foreach (var datedMd5 in recentMd5s.GetL(""))
            {
                var pidSidMd5 = new PidSidMd5() { Pid = datedMd5.GetS("Pid"), Sid = datedMd5.GetS("Sid"), Md5 = datedMd5.GetS("Md5"), FirstSeen = Convert.ToDateTime(datedMd5.GetS("FirstSeen")) };
                var age = (DateTime.UtcNow - pidSidMd5.FirstSeen).TotalDays;
                var remaining = (double)excludeSpanDays - age;
                if (remaining <= 0)
                    continue;
                ExistsOrAddToMemoryCache(pidSidMd5, remaining);
            }
        }

        async Task<IGenericEntity> GetRecentResponseMd5s ()
        {
            return await Data.CallFn("TraverseResponse", "LookupRecentMd5Responses", JsonConvert.SerializeObject(new { days_ago = excludeSpanDays, exclude_list = this.md5ExcludeList }), Jw.Empty);
        }


        public async Task<bool> ExistsOrAddToDbCache(PidSidMd5 pidSidMd5)
        {
            return await Vid.ProviderSessionMd5Exists(this.Fw, pidSidMd5.Pid, pidSidMd5.Sid, pidSidMd5.Md5);
        }

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
            string fullBody = await c.GetRawBodyStringAsync();
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
