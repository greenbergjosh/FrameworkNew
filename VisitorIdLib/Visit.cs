using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using Utility;
using Utility.EDW.Reporting;

namespace VisitorIdLib
{
    public class Visit
    {
        [JsonProperty(PropertyName = "Id")]
        public Guid ReportingSequenceId { get; set; }
        public string Domain { get; set; }
        public DateTime VisitDateTime { get; set; }

        [JsonIgnore]
        public string Page { get; set; }
        [JsonIgnore]
        public bool VeryFirstVisit;
        [JsonIgnore]
        public Guid RsConfigId { get; set; }
        [JsonIgnore]
        public string ReportingSequenceName;
        [JsonIgnore]
        public string EventName => ReportingSequenceName + "SessionInitiate";

        public Visit() => ReportingSequenceName = "VisitorId";

        public Visit(bool veryFirstVisit, DateTime visitDateTime, string domain, string page, Guid rsConfigId, Guid reportingSequenceId) : this()
        {
            VeryFirstVisit = veryFirstVisit;
            VisitDateTime = visitDateTime;
            Domain = domain;
            Page = page;
            RsConfigId = rsConfigId;
            ReportingSequenceId = reportingSequenceId;
        }

        public EdwBulkEvent ReportingSequenceEvent(PL addlPayLoad = null)
        {
            var be = new EdwBulkEvent();
            //be.AddRS(EdwBulkEvent.EdwType.Immediate, ReportingSequenceId, VisitDateTime, addlPayLoad == null ? ReportingSequencePayload() : ReportingSequencePayload().Add(addlPayLoad), RsConfigId);
            return be;
        }

        public virtual PL ReportingSequencePayload() => PL.O(new { VisitDateTime, Domain, Page });

        public EdwBulkEvent VisitEvent(PL payload, Dictionary<string, object> siblingRsids)
        {
            var be = new EdwBulkEvent();
            var eventPayload = PL.O(new { et = EventName });
            eventPayload.Add(payload);
            //be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, siblingRsids, null, eventPayload);

            return be;
        }


    }

    public class DomainVisit : Visit
    {
        public int VisitNum { get; set; }

        [JsonProperty("PageId")]
        public Guid PageReportingSequenceId { get; set; }
        public DateTime PageVisitDateTime { get; set; }

        public DateTime LastVisitDateTime { get; set; }

        [JsonIgnore]
        public DateTime? ExpiredVisitDateTime { get; set; }
        [JsonIgnore]
        public int? ExpiredVisitNum { get; set; }
        [JsonIgnore]
        public Guid? ExpiredReportingSequenceId { get; set; }

        public DomainVisit() : base() => ReportingSequenceName = "Domain";

        public DomainVisit(DateTime visitDateTime, DateTime pageVisitDateTime, string domain, string page, Guid rsConfigId, Guid reportingSequenceId, Guid pageReportingSequenceId) : this()
        {
            VisitDateTime = visitDateTime;
            Domain = domain;
            Page = page;
            RsConfigId = rsConfigId;
            ReportingSequenceId = reportingSequenceId;
            PageReportingSequenceId = pageReportingSequenceId;
            PageVisitDateTime = pageVisitDateTime;
        }

        public bool IsExpired(DateTime timeOfCurentVisit, TimeSpan sessionDuration)
        {
            // VisitDateTime is the time of the *last* visit.  This method is
            // to be called before the object has had its visit time updated to the
            // current visit time.
            return VisitDateTime.Add(sessionDuration) < timeOfCurentVisit;
        }

        public void Expire(DateTime newVisitDateTime)
        {
            ExpiredVisitDateTime = VisitDateTime;
            LastVisitDateTime = VisitDateTime;
            ExpiredVisitNum = VisitNum;
            ExpiredReportingSequenceId = ReportingSequenceId;
            VisitNum = 1;
            VisitDateTime = newVisitDateTime;
            PageVisitDateTime = newVisitDateTime;
            ReportingSequenceId = Guid.NewGuid();
        }

        public void UpdateVisitStats(DateTime newVisitDateTime)
        {
            VisitNum++;
            PageVisitDateTime = newVisitDateTime;
            LastVisitDateTime = VisitDateTime;
        }

        public override PL ReportingSequencePayload()
        {
            return ExpiredVisitDateTime == null ? base.ReportingSequencePayload() :
                base.ReportingSequencePayload().Add(PL.O(new { ExpiredVisitDateTime, ExpiredVisitNum, ExpiredReportingSequenceId }));
        }
    }

    public class PageVisit : DomainVisit
    {
        public DateTime DomainVisitDateTime { get; set; }

        public PageVisit() : base() => ReportingSequenceName = "Page";

        public PageVisit(DateTime visitDateTime, DateTime domainVisitDateTime, string domain, string page, Guid rsConfigId, Guid reportingSequenceId) : this()
        {
            VisitDateTime = visitDateTime;
            PageVisitDateTime = visitDateTime;
            Domain = domain;
            Page = page;
            RsConfigId = rsConfigId;
            ReportingSequenceId = reportingSequenceId;
            DomainVisitDateTime = domainVisitDateTime;
        }

        public override PL ReportingSequencePayload() => PL.O(new { VisitDateTime, DomainVisitDateTime, Domain, Page, VisitNum, VeryFirstVisit });
    }
}
