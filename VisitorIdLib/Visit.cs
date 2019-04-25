using System;
using System.Collections.Generic;
using System.Text;
using Utility;
using System.Linq;
using Newtonsoft.Json;

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

        public Visit()
        {
            this.ReportingSequenceName = "VisitorId";
        }

        public Visit( bool veryFirstVisit, DateTime visitDateTime, string domain, string page, Guid rsConfigId, Guid reportingSequenceId ) : this()
        {
            VeryFirstVisit = veryFirstVisit;
            VisitDateTime = visitDateTime;
            Domain = domain;
            Page = page;
            RsConfigId = rsConfigId;
            ReportingSequenceId = reportingSequenceId;
        }

        public EdwBulkEvent ReportingSequenceEvent (PL addlPayLoad = null)
        {
            var be = new EdwBulkEvent();
            be.AddRS(EdwBulkEvent.EdwType.Immediate, this.ReportingSequenceId, this.VisitDateTime, addlPayLoad == null ? ReportingSequencePayload() : ReportingSequencePayload().Add(addlPayLoad), this.RsConfigId);
            return be;
        }

        virtual public PL ReportingSequencePayload()
        {
            return PL.O(new { this.VisitDateTime, this.Domain, this.Page });
        }

        public EdwBulkEvent VisitEvent(PL payload, Dictionary<string, object> siblingRsids)
        {
            var be = new EdwBulkEvent();
            PL eventPayload = PL.O(new { et = this.EventName });
            eventPayload.Add(payload);
            be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, siblingRsids, null, eventPayload);

            return be;
        }


    }

    public class DomainVisit : Visit
    {

        public int VisitNum { get; set; }

        [JsonProperty("PageId")]
        public Guid PageReportingSequenceId { get; set; }
        public DateTime PageVisitDateTime { get; set; }

        [JsonIgnore]
        public DateTime? ExpiredVisitDateTime { get; set; }
        [JsonIgnore]
        public int? ExpiredVisitNum { get; set; }
        [JsonIgnore]
        public Guid? ExpiredReportingSequenceId { get; set; }

        public DomainVisit() : base()
        {
            this.ReportingSequenceName = "Domain";
        }

        public DomainVisit( DateTime visitDateTime, DateTime pageVisitDateTime, string domain, string page, Guid rsConfigId, Guid reportingSequenceId, Guid pageReportingSequenceId ) : this()
        {
            this.VisitDateTime = visitDateTime;
            this.Domain = domain;
            this.Page = page;
            this.RsConfigId = rsConfigId;
            this.ReportingSequenceId = reportingSequenceId;
            this.PageReportingSequenceId = pageReportingSequenceId;
            this.PageVisitDateTime = pageVisitDateTime;
        }

        public bool IsExpired (DateTime timeOfCurentVisit, TimeSpan sessionDuration)
        {
            // VisitDateTime is the time of the *last* visit.  This method is
            // to be called before the object has had its visit time updated to the
            // current visit time.
            return this.VisitDateTime.Add(sessionDuration) < timeOfCurentVisit;
        }

        public void Expire (DateTime newVisitDateTime)
        {

            this.ExpiredVisitDateTime = this.VisitDateTime;
            this.ExpiredVisitNum = this.VisitNum;
            this.ExpiredReportingSequenceId = this.ReportingSequenceId;
            this.VisitNum = 1;
            this.VisitDateTime = newVisitDateTime;
            this.PageVisitDateTime = newVisitDateTime;
            this.ReportingSequenceId = Guid.NewGuid();
        }

        public void UpdateVisitStats (DateTime newVisitDateTime)
        {
            this.VisitNum++;
            this.PageVisitDateTime = newVisitDateTime;
        }

        override public PL ReportingSequencePayload()
        {
            return this.ExpiredVisitDateTime == null ? base.ReportingSequencePayload() :
                base.ReportingSequencePayload().Add(PL.O(new { this.ExpiredVisitDateTime, this.ExpiredVisitNum, this.ExpiredReportingSequenceId } ));
        }

    }

    public class PageVisit : DomainVisit
    {
        public DateTime DomainVisitDateTime { get; set; }

        public PageVisit() : base()
        {
            this.ReportingSequenceName = "Page";
        }

        public PageVisit(DateTime visitDateTime, DateTime domainVisitDateTime, string domain, string page, Guid rsConfigId, Guid reportingSequenceId) : this()
        {
            this.VisitDateTime = visitDateTime;
            this.PageVisitDateTime = visitDateTime;
            this.Domain = domain;
            this.Page = page;
            this.RsConfigId = rsConfigId;
            this.ReportingSequenceId = reportingSequenceId;
            this.DomainVisitDateTime = domainVisitDateTime;
        }

        override public PL ReportingSequencePayload()
        {
            return PL.O(new { this.VisitDateTime, this.DomainVisitDateTime, this.Domain, this.Page, this.VisitNum });
        }

    }


}
