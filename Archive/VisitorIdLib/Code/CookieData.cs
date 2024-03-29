﻿using System;
using System.Collections.Generic;
using Utility;
using Newtonsoft.Json;
using Jw = Utility.JsonWrapper;
using System.Threading.Tasks;
using Utility.EDW;
using Utility.EDW.Reporting;
using System.Linq;

namespace VisitorIdLib
{
    public class CookieData
    {
        public string md5;
        public string em;
        public Guid sid;
        public string version;
        public string md5pid;
        public string md5date;
        public Dictionary<string, DomainVisit> Domains = new Dictionary<string, DomainVisit>();
        public Dictionary<string, DateTime> ProviderLastSelectTime = new Dictionary<string, DateTime>();

        [JsonIgnore]
        public Visit VidVisit;
        [JsonIgnore]
        public DomainVisit DomainVisit;
        [JsonIgnore]
        public PageVisit PageVisit;
        [JsonIgnore]
        public Dictionary<string, object> RsIdDict;
        [JsonIgnore]
        public bool VeryFirstVisit
        {
            get
            {
                return this.VidVisit?.VeryFirstVisit == true;
            }

        }

        [JsonIgnore]
        public DateTime LastDomainVisitDate;

        public CookieData() { }

        public CookieData (DateTime timeOfCurrentVisit, string cookieAsString, string version, string host, string path, TimeSpan sessionDuration, (Guid VidRsid, Guid DomainRsid, Guid PageRsid) RsConfigIds, bool newlyConstructed = false)
        {
            // New Vid Visit
            // New Domain Visit
            // New Page Visit
            if (cookieAsString.IsNullOrWhitespace() ||
                JsonConvert.DeserializeObject<CookieData>(cookieAsString).version != version) // current upgrade path is just wiping out the old
            {
                this.md5 = null;
                this.em = null;
                this.sid = Guid.NewGuid();
                this.version = version;
                this.PageVisit = new PageVisit(visitDateTime: timeOfCurrentVisit, domainVisitDateTime: timeOfCurrentVisit, domain: host, page: path, rsConfigId: RsConfigIds.PageRsid, reportingSequenceId: Guid.NewGuid());
                this.DomainVisit = new DomainVisit(visitDateTime: timeOfCurrentVisit, pageVisitDateTime: timeOfCurrentVisit, domain: host, page: path, rsConfigId: RsConfigIds.DomainRsid, reportingSequenceId: Guid.NewGuid(), pageReportingSequenceId: this.PageVisit.ReportingSequenceId);
                this.VidVisit = new Visit(veryFirstVisit: true, visitDateTime: timeOfCurrentVisit, domain: host, page: path, rsConfigId: RsConfigIds.VidRsid, reportingSequenceId: this.sid);
                this.PageVisit.VisitNum = this.DomainVisit.VisitNum = 1;
                this.PageVisit.VeryFirstVisit = this.DomainVisit.VeryFirstVisit = true;
                this.Domains.Add(host, this.DomainVisit);
                this.RsIdDict = new Dictionary<string, object> {
                        { typeof(Visit).Name, this.sid },
                        { typeof(DomainVisit).Name, DomainVisit.ReportingSequenceId },
                        { typeof(PageVisit).Name, PageVisit.ReportingSequenceId }
                };

                return;
            }

            //TODO: A lot of this logic belongs in the Visit class, as we're doing object
            //      manipulation that is best (?) hidden behind a method

            // Cookie exists in some form
            CookieData deserialized = JsonConvert.DeserializeObject<CookieData>(cookieAsString);
            LastDomainVisitDate = deserialized.Domains.Values.Max(v => v.VisitDateTime);

            // Existing domain, increment stats, or expire
            if (deserialized.Domains.ContainsKey(host))
            {
                var existingDomainVisit = deserialized.Domains[host];

                // Expire only if we're in the beginning of a run. Wait until
                // the next visit to do so otherwise, so we don't split our
                // session details between two sets of RS's. Either way, update
                // our visit counts in this case.
                if (newlyConstructed)
                {
                    if (existingDomainVisit.IsExpired(timeOfCurrentVisit, sessionDuration))
                    {
                        existingDomainVisit.Expire(timeOfCurrentVisit);
                    }
                    else
                    {
                        existingDomainVisit.UpdateVisitStats(timeOfCurrentVisit);
                    }
                    // This counts as a new visit to a page, so make a new RSID for it
                    existingDomainVisit.PageReportingSequenceId = Guid.NewGuid();
                }
                // new up Page visit with an RSID from the existing domain visit.  See above where we shim a new guid as appropriat
                // based on whether this is a new visit or mid-cycle
                this.PageVisit = new PageVisit(visitDateTime: newlyConstructed ? timeOfCurrentVisit : existingDomainVisit.PageVisitDateTime, domainVisitDateTime: existingDomainVisit.VisitDateTime, domain: host, page: path, rsConfigId: RsConfigIds.PageRsid, reportingSequenceId: existingDomainVisit.PageReportingSequenceId);
                this.Domains = deserialized.Domains;
                this.DomainVisit = existingDomainVisit;
                this.DomainVisit.Page = path;
                this.DomainVisit.RsConfigId = RsConfigIds.DomainRsid;
            }
            // New Domain, first visit
            else
            {
                this.PageVisit = new PageVisit(visitDateTime: timeOfCurrentVisit, domainVisitDateTime: timeOfCurrentVisit, domain: host, page: path, rsConfigId: RsConfigIds.PageRsid, reportingSequenceId: Guid.NewGuid());
                this.DomainVisit = new DomainVisit(visitDateTime: timeOfCurrentVisit, pageVisitDateTime: timeOfCurrentVisit, domain: host, page: path, rsConfigId: RsConfigIds.DomainRsid, reportingSequenceId: Guid.NewGuid(), pageReportingSequenceId: this.PageVisit.ReportingSequenceId);
                this.DomainVisit.VisitNum = 1;
                this.PageVisit.VeryFirstVisit = this.DomainVisit.VeryFirstVisit = true;
                this.Domains = deserialized.Domains;
                this.Domains.Add(host, this.DomainVisit);
            }
            if (newlyConstructed)
            {
                // Only do this when we're not mid-cycle
                PruneExpiredVisits(timeOfCurrentVisit, sessionDuration);
            }
            this.ProviderLastSelectTime = deserialized.ProviderLastSelectTime;
            this.PageVisit.VisitNum = this.DomainVisit.VisitNum;
            this.sid = deserialized.sid;
            this.md5 = deserialized.md5;
            this.md5pid = deserialized.md5pid;
            this.md5date = deserialized.md5date;
            this.em = deserialized.em;
            this.version = deserialized.version;
            this.RsIdDict = new Dictionary<string, object> {
                    { typeof(Visit).Name, this.sid },
                    { typeof(DomainVisit).Name, DomainVisit.ReportingSequenceId },
                    { typeof(PageVisit).Name, PageVisit.ReportingSequenceId }
            };

        }

        public (Guid IncidentId, Guid Md5Pid, DateTime Md5Date)? CheckForPoisonedMd5 (List<(Guid IncidentId, Guid Md5Pid, DateTime StartDate, DateTime EndDate)> poisonList)
        {
            if (DateTime.TryParse(this.md5date, out var Md5DateAsDate) == false ||
                Guid.TryParse(this.md5pid, out var Md5PidAsGuid) == false )
            {
                return null;
            }
            foreach (var poisonIncident in poisonList)
            {
                if (poisonIncident.Md5Pid == Md5PidAsGuid &&
                    Md5DateAsDate >= poisonIncident.StartDate &&
                    Md5DateAsDate <= poisonIncident.EndDate )
                {
                    return (poisonIncident.IncidentId, poisonIncident.Md5Pid, Md5Date : Md5DateAsDate);
                }
            }
            return null;
        }

        public void ClearPoisonedData()
        {
            md5 = md5date = md5pid = em = "";
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
            var lcProviderId = providerId.ToLower();

            if (ProviderLastSelectTime.ContainsKey(lcProviderId))
                ProviderLastSelectTime[lcProviderId] = responseTime;
            else
                ProviderLastSelectTime.Add(lcProviderId, responseTime);
        }

        public DateTime? LastSelectTime(string providerId)
        {
            var lcProviderId = providerId.ToLower();
            return ProviderLastSelectTime.ContainsKey(lcProviderId) ?
                (DateTime?) ProviderLastSelectTime[lcProviderId] :
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
                var domainPL = PL.O(new { LastDomainVisitDate = LastDomainVisitDate == DateTime.MinValue ? null : LastDomainVisitDate.ToString() }).Add(payload); // Date of the last domain visit across all domains
                rsList.Add(DomainVisit.ReportingSequenceEvent(addlPayLoad: domainPL));
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
