using System;
using System.Collections.Generic;

namespace Utility.EDW.Reporting
{
    //EdwBulkEvent bulk = new EdwBulkEvent();
    //bulk.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids, weps, PL.C("a_key", "a_value"));
    //bulk.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids, weps, PL.C("a_key", "a_value"));
    //bulk.AddRS(RsType.Immediate, Guid.NewGuid(), DateTime.UtcNow, PL.C("a_key", "a_value"), Guid.NewGuid());
    //bulk.AddRS(RsType.Immediate, Guid.NewGuid(), DateTime.UtcNow, PL.C("a_key", "a_value"), Guid.NewGuid());
    //string st11 = bulk.ToString();
    public class EdwBulkEvent
    {
        public EdwBulkEvent() { }

        public enum EdwType
        {
            Event = 0,
            Immediate,
            Checked,
            CheckedDetail
        }

        public Dictionary<EdwType, List<PL>> RsTypes = new Dictionary<EdwType, List<PL>>()
            { { EdwType.Event, new List<PL>() }, { EdwType.Immediate, new List<PL>() },
              { EdwType.Checked, new List<PL>()}, { EdwType.CheckedDetail, new List<PL>()} };

        public void AddEvent(Guid uid, DateTime tms, Dictionary<string, object> rsid,
            IEnumerable<string> whep, PL payload)
        {
            RsTypes[EdwType.Event].Add(
                 PL.O(new { id = uid, ts = tms.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.fff") })
                     .Add(PL.N("payload", PL.C(payload).Add(PL.N("rsid", PL.D(rsid)))  // this rsid is the instance id
                                                       .Add(PL.N("whep", SL.C(whep))))));
        }

        public void AddEventWhepD(Guid uid, DateTime tms, Dictionary<string, object> rsid,
            IDictionary<string, object> whep, PL payload)
        {
            RsTypes[EdwType.Event].Add(
                 PL.O(new { id = uid, ts = tms.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.fff") })
                     .Add(PL.N("payload", PL.C(payload).Add(PL.N("rsid", PL.D(rsid)))  // this rsid is the instance id
                                                       .Add(PL.N("whep", PL.D(whep))))));
        }


        public void AddRS(EdwType t, Guid uid, DateTime tms, PL payload, Guid configId)
        {
            RsTypes[t].Add(
                PL.O(new { id = uid, ts = tms.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.fff") })
                    .Add(PL.N("payload", PL.C(payload)))
                    .Add(PL.C("rsid", configId.ToString()))); // this rsid is the typeid (configid)
        }

        public override string ToString()
        {
            return PL.C().Add("E", false, RsTypes[EdwType.Event])
                .Add("IM", false, RsTypes[EdwType.Immediate])
                .Add("CK", false, RsTypes[EdwType.Checked])
                .Add("CD", false, RsTypes[EdwType.CheckedDetail])
                .ToString();
        }
    }
}
