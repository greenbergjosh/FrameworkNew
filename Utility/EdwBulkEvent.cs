using System;
using System.Collections.Generic;
using System.Text;

namespace Utility
{
    //EdwBulkEvent bulk = new EdwBulkEvent();
    //bulk.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids, weps, PL.C("a_key", "a_value"));
    //bulk.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids, weps, PL.C("a_key", "a_value"));
    //bulk.AddRS(RsType.Immediate, Guid.NewGuid(), DateTime.UtcNow, PL.C("a_key", "a_value"), Guid.NewGuid());
    //bulk.AddRS(RsType.Immediate, Guid.NewGuid(), DateTime.UtcNow, PL.C("a_key", "a_value"), Guid.NewGuid());
    //string st11 = bulk.ToString();
    public class EdwBulkEvent
    {
        public EdwBulkEvent()
        {
            RsTypes = new Dictionary<RsType, List<PL>>()
            { { RsType.Immediate, ims }, {RsType.Checked, cks}, {RsType.CheckedDetail, cds} };
        }

        public enum RsType
        {
            Immediate = 0,
            Checked,
            CheckedDetail
        }

        public IList<PL> events = new List<PL>();
        public List<PL> ims = new List<PL>();
        public List<PL> cks = new List<PL>();
        public List<PL> cds = new List<PL>();

        public Dictionary<RsType, List<PL>> RsTypes;

        public void AddEvent(Guid uid, DateTime tms, Dictionary<string, object> rsid,
            List<string> whep, PL payload)
        {
            events.Add(
                 PL.O(new { id = uid, ts = tms.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.fff") })
                     .Add(PL.N("payload", PL.C(payload).Add(PL.N("rsid", PL.D(rsid)))
                                                       .Add(PL.N("whep", SL.C(whep))))));
        }

        public void AddRS(RsType t, Guid uid, DateTime tms, PL payload, Guid configId)
        {
            RsTypes[t].Add(
                PL.O(new { id = uid, ts = tms.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.fff") })
                    .Add(PL.N("payload", PL.C(payload)))
                    .Add(PL.C("config_id", configId.ToString())));

        }

        public override string ToString()
        {
            return PL.C().Add("E", false, events)
                .Add("IM", false, ims)
                .Add("CK", true, cks)
                .Add("CD", true, cds)
                .ToString();
        }
    }
}
