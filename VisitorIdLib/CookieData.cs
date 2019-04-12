using System;
using System.Collections.Generic;
using Utility;
using Newtonsoft.Json;
using Jw = Utility.JsonWrapper;
using System.Threading.Tasks;

namespace VisitorIdLib
{
    public class CookieData
    {
        public string md5;
        public string em;
        public Guid sid;
        public DateTime? lv;
        public Dictionary<string, DomainVisit> Domains = new Dictionary<string, DomainVisit>();
        public Dictionary<string, DateTime> ProviderLastSelectTime = new Dictionary<string, DateTime>();

        [JsonIgnore]
        public Visit VidVisit;
        [JsonIgnore]
        public DomainVisit DomainVisit;
        [JsonIgnore]
        public PageVisit PageVisit;
        [JsonIgnore]
        public Dictionary<string, object> RsIdDict
        {
            get
            {
                return new Dictionary<string, object> {
                    { typeof(Visit).Name, this.sid },
                    { typeof(DomainVisit).Name, DomainVisit.ReportingSequenceId },
                    { typeof(PageVisit).Name, PageVisit.ReportingSequenceId } };
            }
        }
        [JsonIgnore]
        public bool VeryFirstVisit
        {
            get
            {
                return this.VidVisit?.VeryFirstVisit == true;
            }

        }

        public CookieData() { }

        public CookieData (DateTime timeOfCurrentVisit, string cookieAsString, string host, string path, TimeSpan sessionDuration, (Guid VidRsid, Guid DomainRsid, Guid PageRsid) RsConfigIds)
        {
            // This guy gets new'd up regardless of new or existing cookie
            this.PageVisit = new PageVisit(visitDateTime: timeOfCurrentVisit, domain: host, page: path, rsConfigId: RsConfigIds.PageRsid, reportingSequenceId: Guid.NewGuid());

            // New Vid Visit
            // New Domain Visit
            // New Page Visit (above)
            if (cookieAsString.IsNullOrWhitespace())
            {
                this.md5 = null;
                this.em = null;
                this.lv = null;
                this.sid = Guid.NewGuid();
                this.VidVisit = new Visit(veryFirstVisit: true, visitDateTime: timeOfCurrentVisit, domain: host, page: path, rsConfigId: RsConfigIds.VidRsid, reportingSequenceId: this.sid);
                this.DomainVisit = new DomainVisit(visitDateTime: timeOfCurrentVisit, domain: host, page: path, rsConfigId: RsConfigIds.DomainRsid, reportingSequenceId: Guid.NewGuid());
                this.PageVisit.VisitNum = this.DomainVisit.VisitNum = 1;
                this.PageVisit.VeryFirstVisit = this.DomainVisit.VeryFirstVisit = true;

                this.Domains.Add(host, this.DomainVisit);
                return;
            }

            //TODO: A lot of this logic belongs in the Visit class, as we're doing object
            //      manipulation that is best (?) hidden behind a method

            // Cookie exists in some form
            CookieData deserialized = JsonConvert.DeserializeObject<CookieData>(cookieAsString);

            // Existing domain, increment stats, or expire
            if (deserialized.Domains.ContainsKey(host))
            {
                var existingDomainVisit = deserialized.Domains[host];
                var lastVisitDateTime = existingDomainVisit.VisitDateTime;
                var lastVisitcount = existingDomainVisit.VisitNum;
                if (existingDomainVisit.IsExpired(timeOfCurrentVisit, sessionDuration))
                {
                    existingDomainVisit.Expire(timeOfCurrentVisit);
                }
                else
                {
                    existingDomainVisit.UpdateVisitStats(timeOfCurrentVisit);
                }
                this.Domains = deserialized.Domains;
                this.DomainVisit = existingDomainVisit;
                this.DomainVisit.Page = path;
                this.DomainVisit.RsConfigId = RsConfigIds.DomainRsid;
            }
            // New Domain, first visit
            else
            {
                this.DomainVisit = new DomainVisit(visitDateTime: timeOfCurrentVisit, domain: host, page: path, rsConfigId: RsConfigIds.DomainRsid, reportingSequenceId: Guid.NewGuid());
                this.DomainVisit.VisitNum = 1;
                this.PageVisit.VeryFirstVisit = this.DomainVisit.VeryFirstVisit = true;
                this.Domains = deserialized.Domains;
                this.Domains.Add(host, this.DomainVisit);
            }
            PruneExpiredVisits(timeOfCurrentVisit, sessionDuration);
            this.ProviderLastSelectTime = deserialized.ProviderLastSelectTime;
            this.PageVisit.VisitNum = this.DomainVisit.VisitNum;
            this.sid = deserialized.sid;
            this.md5 = deserialized.md5;
            this.em = deserialized.em;
            this.lv = deserialized.lv;
        }

        public static (string md5, string em, string sid) Md5EmailSessionIdFromCookie(string cookieString)
        {
            if (cookieString.IsNullOrWhitespace())
                return (md5: null, em: null, sid: null);

            var gc = Jw.JsonToGenericEntity(cookieString);
            return (md5: gc.GetS("md5"), em: gc.GetS("em"), sid: gc.GetS("sid"));
        }

        public void AddOrUpdateProviderSelect(string providerId, DateTime responseTime)
        {
            if (ProviderLastSelectTime.ContainsKey(providerId))
                ProviderLastSelectTime[providerId] = responseTime;
            else
                ProviderLastSelectTime.Add(providerId, responseTime);
        }

        public DateTime? LastSelectTime(string providerId)
        {
            return ProviderLastSelectTime.ContainsKey(providerId) ?
                (DateTime?) ProviderLastSelectTime[providerId] :
                null;
        }

        public CookieData PruneExpiredVisits(DateTime startTime, TimeSpan sessionDuration)
        {
            var prunedDomains = new Dictionary<string, DomainVisit>();
            this.Domains.ForEach(domain => { if (!domain.Value.IsExpired(startTime, sessionDuration)) prunedDomains.Add(domain.Key, domain.Value); });
            this.Domains = prunedDomains;
            return this;
        }

        public (List<EdwBulkEvent> RsList, List<EdwBulkEvent> EventList) VisitEventsWithPayload(PL payload)
        {
            var rsList = new List<EdwBulkEvent>();
            var eventList = new List<EdwBulkEvent>();

            rsList.Add(PageVisit.ReportingSequenceEvent(addlPayLoad: payload)); // Every visit has a PageVisit

            eventList.Add(this.PageVisit.VisitEvent(payload, this.RsIdDict));
            if (DomainVisit.VisitNum == 1) // Every new domain visit has a DomainVisit
            {
                rsList.Add(DomainVisit.ReportingSequenceEvent(addlPayLoad: payload));
                eventList.Add(this.DomainVisit.VisitEvent(payload,this.RsIdDict));
            }
            if (VidVisit != null ) // Visitor is new to VID pixel
            {
                rsList.Add(VidVisit.ReportingSequenceEvent(addlPayLoad: payload));
                eventList.Add(this.VidVisit.VisitEvent(payload, this.RsIdDict));
            }

            return (RsList: rsList, EventList: eventList);
        }

        public static void WriteVisitEvents((List<EdwBulkEvent> rsList, List<EdwBulkEvent> eventList) events, LoadBalancedWriter writer)
        {
            events.rsList.ForEach(async rs => await writer.Write(rs));
            events.eventList.ForEach(async evt => await writer.Write(evt));
        }

        public string ToJson()
        {
            return JsonConvert.SerializeObject(this);
        }
    }
}
