﻿using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace Utility.EDW.Reporting
{
    public class EdwBulkEvent
    {
        public enum EdwType
        {
            Event = 0,
            Immediate,
            Checked,
            CheckedDetail
        }

        public Dictionary<EdwType, List<object>> RsTypes { get; } = new Dictionary<EdwType, List<object>>()
        {
            { EdwType.Event, new List<object>() },
            { EdwType.Immediate, new List<object>() },
            { EdwType.Checked, new List<object>()},
            { EdwType.CheckedDetail, new List<object>()}
        };

        #region Event Methods
        public void AddEvent(Guid eventId, DateTime eventTimestamp, IDictionary<Guid, (Guid rsId, DateTime rsTimestamp)> reportingSequences, object body)
        {
            AddEvent(eventId, eventTimestamp, reportingSequences, body, (object)null, TimeSpan.Zero);
        }

        public void AddEvent(Guid eventId, DateTime eventTimestamp, IDictionary<Guid, (Guid rsId, DateTime rsTimestamp)> reportingSequences, object body, IEnumerable<(Guid eventId, DateTime eventTimestamp)> parentEvents = null, TimeSpan aggregationTtl = default)
        {
            var whep = parentEvents?.Any() == true ? parentEvents.Select(parentEvent => ToLinkedId(parentEvent.eventId, parentEvent.eventTimestamp)) : null;
            AddEvent(eventId, eventTimestamp, reportingSequences, body, whep, aggregationTtl);
        }

        public void AddEvent(Guid eventId, DateTime eventTimestamp, IDictionary<Guid, (Guid rsId, DateTime rsTimestamp)> reportingSequences, object body, IDictionary<string, (Guid eventId, DateTime eventTimestamp)> parentEvents = null, TimeSpan aggregationTtl = default)
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

            RsTypes[EdwType.Event].Add(
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
        public void AddReportingSequence(Guid rsId, DateTime rsTimestamp, object body, Guid rsConfigId, TimeSpan aggregationTtl = default)
        {
            AddRS(EdwType.Immediate, rsId, rsTimestamp, body, rsConfigId, aggregationTtl, default);
        }

        public void AddCheckedReportingSequence(Guid rsId, DateTime rsTimestamp, object body, Guid rsConfigId, TimeSpan aggregationTtl = default, TimeSpan satisfactionTtl = default)
        {
            AddRS(EdwType.Checked, rsId, rsTimestamp, body, rsConfigId, aggregationTtl, satisfactionTtl);
        }

        public void AddCheckedReportingSequenceDetail(Guid checkedRsId, DateTime checkedRsTimestamp, DateTime checkedDetailTimestamp, object body, Guid rsConfigId, TimeSpan satisfactionTtl = default)
        {
            AddRS(EdwType.CheckedDetail, checkedRsId, checkedRsTimestamp, body, rsConfigId, default, satisfactionTtl, ("checkedDetailTs", checkedDetailTimestamp));
        }

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

            RsTypes[type].Add(rs);
        }
        #endregion

        public override string ToString() => JsonConvert.SerializeObject(
            new
            {
                E = RsTypes[EdwType.Event],
                IM = RsTypes[EdwType.Immediate],
                CK = RsTypes[EdwType.Checked],
                CD = RsTypes[EdwType.CheckedDetail]
            }
        );

        #region Helper Methods
        private string ToLinkedId(Guid id, DateTime timestamp) => $"{id:N}|{timestamp:yyMMddHHmmssffffff}";

        private static string ToTtlString(TimeSpan aggregationTtl)
        {
            string agg_ttl_interval = null;

            if (aggregationTtl.Days > 0)
            {
                agg_ttl_interval = $"{aggregationTtl.Days}d";
            }
            else if (aggregationTtl.Hours > 0)
            {
                agg_ttl_interval = $"{aggregationTtl.Hours}h";
            }

            return agg_ttl_interval;
        }
        #endregion
    }
}
