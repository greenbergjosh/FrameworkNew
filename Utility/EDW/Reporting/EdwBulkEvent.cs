using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace Utility.EDW.Reporting
{
    public class EdwBulkEvent
    {
        private enum EdwType
        {
            Event = 0,
            Immediate,
            Checked,
            CheckedDetail
        }

        private readonly Dictionary<EdwType, List<object>> _rsTypes = new()
        {
            { EdwType.Event, new List<object>() },
            { EdwType.Immediate, new List<object>() },
            { EdwType.Checked, new List<object>()},
            { EdwType.CheckedDetail, new List<object>()}
        };

        #region Event Methods
        public void AddEvent(Guid eventId, DateTime eventTimestamp, IDictionary<Guid, (Guid rsId, DateTime rsTimestamp)> reportingSequences, object body, TimeSpan aggregationTtl = default) => AddEvent(eventId, eventTimestamp, reportingSequences, body, (object)null, aggregationTtl);

        public void AddEvent(Guid eventId, DateTime eventTimestamp, IDictionary<Guid, (Guid rsId, DateTime rsTimestamp)> reportingSequences, object body, IEnumerable<(Guid eventId, DateTime eventTimestamp)> parentEvents, TimeSpan aggregationTtl = default)
        {
            var whep = parentEvents?.Any() == true ? parentEvents.Select(parentEvent => ToLinkedId(parentEvent.eventId, parentEvent.eventTimestamp)) : null;
            AddEvent(eventId, eventTimestamp, reportingSequences, body, whep, aggregationTtl);
        }

        public void AddEvent(Guid eventId, DateTime eventTimestamp, IDictionary<Guid, (Guid rsId, DateTime rsTimestamp)> reportingSequences, object body, IDictionary<string, (Guid eventId, DateTime eventTimestamp)> parentEvents, TimeSpan aggregationTtl = default)
        {
            var whep = parentEvents?.Any() == true ? parentEvents.ToDictionary(kvp => kvp.Key, kvp => ToLinkedId(kvp.Value.eventId, kvp.Value.eventTimestamp)) : null;
            AddEvent(eventId, eventTimestamp, reportingSequences, body, whep, aggregationTtl);
        }

        private void AddEvent(Guid eventId, DateTime eventTimestamp, IDictionary<Guid, (Guid rsId, DateTime rsTimestamp)> reportingSequences, object body, object parentEvents, TimeSpan aggregationTtl)
        {
            if (reportingSequences == null)
            {
                throw new ArgumentNullException(nameof(reportingSequences));
            }

            var agg_ttl_interval = ToTtlString(aggregationTtl);

            var payload = new Dictionary<string, object>
            {
                ["rsid"] = reportingSequences.ToDictionary(kvp => kvp.Key, kvp => ToLinkedId(kvp.Value.rsId, kvp.Value.rsTimestamp))
            };

            if (agg_ttl_interval != null)
            {
                payload["agg_ttl_interval"] = agg_ttl_interval;
            }

            if (parentEvents != null)
            {
                payload["whep"] = parentEvents;
            }

            if (body != null)
            {
                payload["body"] = body;
            }

            _rsTypes[EdwType.Event].Add(
                 new
                 {
                     id = eventId,
                     ts = eventTimestamp.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.ffffff"),
                     payload
                 }
            );
        }
        #endregion

        #region Reporting Sequence Methods
        public void AddReportingSequence(Guid rsId, DateTime rsTimestamp, object body, Guid rsConfigId, TimeSpan aggregationTtl = default) => AddRS(EdwType.Immediate, rsId, rsTimestamp, body, rsConfigId, aggregationTtl, default);

        public void AddCheckedReportingSequence(Guid rsId, DateTime rsTimestamp, object body, Guid rsConfigId, TimeSpan aggregationTtl = default, TimeSpan satisfactionTtl = default) => AddRS(EdwType.Checked, rsId, rsTimestamp, body, rsConfigId, aggregationTtl, satisfactionTtl);

        public void AddCheckedReportingSequenceDetail(Guid checkedRsId, DateTime checkedRsTimestamp, DateTime checkedDetailTimestamp, object body, Guid rsConfigId, TimeSpan satisfactionTtl = default) => AddRS(EdwType.CheckedDetail, checkedRsId, checkedRsTimestamp, body, rsConfigId, default, satisfactionTtl, ("checkedDetailTs", checkedDetailTimestamp));

        private void AddRS(EdwType type, Guid rsId, DateTime rsTimestamp, object body, Guid rsConfigId, TimeSpan aggregationTtl, TimeSpan satisfactionTtl, params (string key, object value)[] additionalPayload)
        {
            var agg_ttl_interval = ToTtlString(aggregationTtl);
            var satisfaction_ttl_interval = ToTtlString(satisfactionTtl);

            var payload = new Dictionary<string, object>(additionalPayload.ToDictionary(param => param.key, param => param.value));

            if (agg_ttl_interval != null)
            {
                payload["agg_ttl_interval"] = agg_ttl_interval;
            }

            if (satisfaction_ttl_interval != null)
            {
                payload["satisfaction_ttl_interval"] = satisfaction_ttl_interval;
            }

            if (body != null)
            {
                payload["body"] = body;
            }

            var rs = new Dictionary<string, object>
            {
                ["id"] = rsId,
                ["ts"] = rsTimestamp.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.ffffff"),
                ["payload"] = payload,
                ["rsid"] = rsConfigId
            };

            _rsTypes[type].Add(rs);
        }
        #endregion

        public override string ToString() => JsonConvert.SerializeObject(
            new
            {
                E = _rsTypes[EdwType.Event],
                IM = _rsTypes[EdwType.Immediate],
                CK = _rsTypes[EdwType.Checked],
                CD = _rsTypes[EdwType.CheckedDetail]
            }
        );

        #region Helper Methods
        private static string ToLinkedId(Guid id, DateTime timestamp) => id == default ? null : $"{id:N}.{timestamp.ToUniversalTime():yyMMddHHmmssffffff}";

        private static string ToTtlString(TimeSpan ttl)
        {
            string ttl_interval = null;

            if (ttl.Days > 0 && ttl.Hours == 0)
            {
                ttl_interval = $"{ttl.Days}d";
            }
            else if (ttl.Hours > 0)
            {
                ttl_interval = $"{ttl.Hours}h";
            }

            return ttl_interval;
        }
        #endregion
    }
}
