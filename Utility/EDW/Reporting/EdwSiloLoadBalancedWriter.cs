﻿using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Utility.EDW.Reporting
{
    public class EdwSiloLoadBalancedWriter : LoadBalancedWriter
    {
        public EdwSiloLoadBalancedWriter(int endpointPollingInterval,
            int writeTimeoutSec,
            InitializeEndpointsDelegate initEndpoints,
            PollEndpointsDelegate pollEndpoints,
            InitiateWalkawayDelegate td,
            NextWalkawayValueDelegate badEndpointWalkaway,
            SelectEndpointDelegate selector,
            NoValidEndpointsDelegate novalid,
            FailureDelegate invalid,
            UnhandledExceptionDelegate unhandled)
            : base(endpointPollingInterval, writeTimeoutSec, initEndpoints, pollEndpoints, td, badEndpointWalkaway,
                selector, novalid, invalid, unhandled)
        { }

        public static async Task<IReadOnlyList<IEndpoint>> InitializeEndpoints(Entity.Entity config)
        {
            var endpoints = new List<IEndpoint>();
            foreach (var silo in await config.Get("Config.EdwSilos"))
            {
                endpoints.Add(new EdwSiloEndpoint(await silo.GetS("DataLayerType"), await silo.GetS("ConnectionString")));
            }

            return endpoints;
        }

        public static async Task<IReadOnlyList<IEndpoint>> PollEndpoints(Entity.Entity config)
        {
            var endpoints = new List<IEndpoint>();
            foreach (var silo in await config.Get("Config.EdwSilos"))
            {
                endpoints.Add(new EdwSiloEndpoint(await silo.GetS("DataLayerType"), await silo.GetS("ConnectionString")));
            }

            return endpoints;
        }

        public static Task InitiateWalkaway(object w, string errorFilePath)
        {
            FileSystem.WriteLineToFileThreadSafe(errorFilePath, DateTime.Now + "::" + w.ToString());
            return Task.CompletedTask;
        }

        public static int NextWalkawayValue(int previousValue)
        {
            if (previousValue == 0) return 1;
            else if (previousValue == 1) return 5;
            else if (previousValue == 5) return 60;
            else return 60;
        }

        public static IEndpoint Selector(ConcurrentDictionary<IEndpoint, Tuple<bool, int>> endpoints, IReadOnlyList<IEndpoint> alreadyChosen)
        {
            IEndpoint chosen = null;

            var es = endpoints.Keys.ToList();
            var rnd = new Random(DateTime.Now.Millisecond);
            for (int i = rnd.Next(0, es.Count), k = 0; k < es.Count; k++)
            {
                var current = es[i];
                if (!alreadyChosen.Contains(current) && endpoints[current].Item1)
                {
                    chosen = current;
                    break;
                }
                i = (i + 1) % es.Count;
            }

            return chosen;
        }

        public static Task NoValid(object w, string dataFilePath, string errorFilePath)
        {
            FileSystem.WriteLineToFileThreadSafe(dataFilePath, $"<<//RECORD::{DateTime.Now}::NoValid::{w}//>>{Environment.NewLine}");
            FileSystem.WriteLineToFileThreadSafe(errorFilePath, $"{DateTime.Now}::NoValid::{w}{Environment.NewLine}");
            return Task.CompletedTask;
        }

        public static Task Failure(object w, string errorFilePath)
        {
            FileSystem.WriteLineToFileThreadSafe(errorFilePath, $"{DateTime.Now}::Failure::{w}{Environment.NewLine}");
            return Task.CompletedTask;
        }

        public static Task Unhandled(object w, string errorFilePath, Exception ex)
        {
            FileSystem.WriteLineToFileThreadSafe(errorFilePath, $"{DateTime.Now}::Unhandled::{w}::Exception::{ex?.Message ?? "None provided"}{Environment.NewLine}");
            return Task.CompletedTask;
        }

        public static async Task<EdwSiloLoadBalancedWriter> InitializeEdwSiloLoadBalancedWriter(Entity.Entity config)
        {
            var siloConns = await config.Get("Config.EdwSilos");

            if (!siloConns.Any())
            {
                return null;
            }

            var writeTimeoutSeconds = (await config.GetS("Config.EdwWriteTimeout")).ParseInt() ?? 0;
            var dataFilePath = Path.GetFullPath(await config.GetS("Config.EdwDataFilePath"));
            var errorFilePath = Path.GetFullPath(await config.GetS("Config.EdwErrorFilePath"));

            return new EdwSiloLoadBalancedWriter(60,
                writeTimeoutSeconds,
                async () => await InitializeEndpoints(config).ConfigureAwait(false),
                async () => await PollEndpoints(config).ConfigureAwait(false),
                async (object w, int timeoutSeconds) => await InitiateWalkaway(w, errorFilePath).ConfigureAwait(false),
                NextWalkawayValue,
                Selector,
                async (object w) => await NoValid(w, dataFilePath, errorFilePath).ConfigureAwait(false),
                async (object w) => await Failure(w, errorFilePath).ConfigureAwait(false),
                async (object w, Exception ex) => await Unhandled(w, errorFilePath, ex).ConfigureAwait(false)
            );
        }

        public static string EdwRs(Guid cfgId, object payld) => JsonWrapper.Json(new
        { id = Guid.NewGuid(), ts = DateTime.UtcNow, payload = JsonWrapper.Json(payld), cfg_id = cfgId },
                new bool[] { true, true, false, true });

        public static string EdwRs(Guid cfgId, IDictionary<string, string> payld) => JsonWrapper.Json(new
        { id = Guid.NewGuid(), ts = DateTime.UtcNow, payload = JsonWrapper.Json("", payld, true), cfg_id = cfgId },
                new bool[] { true, true, false, true });

        public static string EdwRs(Guid cfgId, string payld) => JsonWrapper.Json(new
        { id = Guid.NewGuid(), ts = DateTime.UtcNow, payload = payld, cfg_id = cfgId },
                new bool[] { true, true, false, true });

        public static string EdwEvt(object payld, IDictionary<string, string> rsids)
        {
            var pyld = new StringBuilder(JsonWrapper.Json(payld));
            return EdwEvt(pyld, rsids);
        }

        public static string EdwEvt(IDictionary<string, string> payld, IDictionary<string, string> rsids)
        {
            var pyld = new StringBuilder(JsonWrapper.Json("", payld, true));
            return EdwEvt(pyld, rsids);
        }

        public static string EdwEvt(string payld, IDictionary<string, string> rsids)
        {
            var pyld = new StringBuilder(payld);
            return EdwEvt(pyld, rsids);
        }

        public static string EdwEvt(StringBuilder pyld, IDictionary<string, string> rsids)
        {
            if (rsids != null && rsids.Count > 0)
            {
                var rsid = JsonWrapper.Json("rsid", rsids, false);
                pyld.Remove(pyld.Length - 1, 1);
                pyld.Append(rsid + "}");
            }
            return JsonWrapper.Json(new
            { id = Guid.NewGuid(), ts = DateTime.UtcNow, payload = pyld },
                new bool[] { true, true, false });
        }

        public static string EdwBulk(List<string> Im, List<string> Ck, List<string> Cd, List<string> Evt)
        {
            var sb = new StringBuilder("{");
            if (Im != null && Im.Count > 0) sb.Append(JsonWrapper.Json("IM", Im, false, false) + ",");
            if (Ck != null && Ck.Count > 0) sb.Append(JsonWrapper.Json("CK", Ck, false, false) + ",");
            if (Cd != null && Cd.Count > 0) sb.Append(JsonWrapper.Json("CD", Cd, false, false) + ",");
            if (Evt != null && Evt.Count > 0) sb.Append(JsonWrapper.Json("E", Evt, false, false) + ",");
            if (sb.Length > 1) sb.Remove(sb.Length - 1, 1);
            sb.Append('}');
            return sb.ToString();
        }

        //CK, CD
        /* {
"IM":
[
    {
        "id":"<generate uuid 1>",
        "ts":"<utc ts when the visit started>",
        "payload":
        {
            "domain":"somedomain.com",
            "ip":"1.1.1.1",
            "service":"somesevicename"
        },
        "cfg_id":"2AF95D5C-3296-480E-BF17-8CD2DAF6B543"
    },
    {
                  <another IM>
    },
    {
                  <another IM>
    }
],
"E":
[
    {
        "id":"<generate uuid 2>",
        "ts":"<utc ts for the event>",
        "payload":
        {
            "event_type":"hit",
            "rsid":
            {
                "traffic":"<generate uuid 1>"
            }
        }
    }
]
}*/
    }
}