﻿using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Framework.Core.EDW.Reporting
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

        public static Task<List<IEndpoint>> InitializeEndpoints(IGenericEntity config)
        {
            var endpoints = new List<IEndpoint>();
            foreach (var silo in config.GetL("Config/EdwSilos")) endpoints.Add(new EdwSiloEndpoint(silo.GetS("DataLayerType"), silo.GetS("ConnectionString")));
            return Task.FromResult(endpoints);
        }

        public static Task<List<IEndpoint>> PollEndpoints(IGenericEntity config)
        {
            var endpoints = new List<IEndpoint>();
            foreach (var silo in config.GetL("Config/EdwSilos")) endpoints.Add(new EdwSiloEndpoint(silo.GetS("DataLayerType"), silo.GetS("ConnectionString")));
            return Task.FromResult(endpoints);
        }

        public static async Task InitiateWalkaway(object w, string errorFilePath, int timeoutSeconds)
        {
            await File.AppendAllTextAsync(errorFilePath, DateTime.Now + "::" + w.ToString()).ConfigureAwait(false);
        }


        public static int NextWalkawayValue(int previousValue)
        {
            if (previousValue == 0) return 1;
            else if (previousValue == 1) return 5;
            else if (previousValue == 5) return 60;
            else return 0;
        }

        public static IEndpoint Selector(ConcurrentDictionary<IEndpoint, Tuple<bool, int>> endpoints, List<IEndpoint> alreadyChosen)
        {
            IEndpoint e = null;
            var es = endpoints.Keys.ToList();
            var rnd = new Random(DateTime.Now.Millisecond);
            for (int i = rnd.Next(0, es.Count), k = 0; k < es.Count; k++)
            {
                e = es[i];
                if (!alreadyChosen.Contains(e) && endpoints[e].Item1) break;
                i = (i + 1) % es.Count;
            }
            return e;
        }

        public static async Task NoValid(object w, string dataFilePath, string errorFilePath)
        {
            await File.AppendAllTextAsync(dataFilePath, $"<<//RECORD::{DateTime.Now}::NoValid::{w}//>>{Environment.NewLine}").ConfigureAwait(false);
            await File.AppendAllTextAsync(errorFilePath, $"{DateTime.Now}::NoValid::{w}{Environment.NewLine}").ConfigureAwait(false);
        }

        public static async Task Failure(object w, string errorFilePath)
        {
            await File.AppendAllTextAsync(errorFilePath, $"{DateTime.Now}::Failure::{w}{Environment.NewLine}").ConfigureAwait(false);
        }


        public static async Task Unhandled(object w, string errorFilePath, Exception ex)
        {
            await File.AppendAllTextAsync(errorFilePath, $"{DateTime.Now}::Unhandled::{w}::Exception::{ex?.Message ?? "None provided"}{Environment.NewLine}").ConfigureAwait(false);
        }


        public static EdwSiloLoadBalancedWriter InitializeEdwSiloLoadBalancedWriter(IGenericEntity config)
        {
            var siloConns = config.GetL("Config/EdwSilos");

            if (!siloConns.Any()) return null;

            var writeTimeoutSeconds = config.GetS("Config/EdwWriteTimeout").ParseInt() ?? 0;
            var dataFilePath = Path.GetFullPath(config.GetS("Config/EdwDataFilePath"));
            var errorFilePath = Path.GetFullPath(config.GetS("Config/EdwErrorFilePath"));

            return new EdwSiloLoadBalancedWriter(60,
                writeTimeoutSeconds,
                async () => await InitializeEndpoints(config).ConfigureAwait(false),
                async () => await PollEndpoints(config).ConfigureAwait(false),
                async (w, timeoutSeconds) => await InitiateWalkaway(w, errorFilePath, timeoutSeconds).ConfigureAwait(false),
                (previousValue) => NextWalkawayValue(previousValue),
                (endpoints, alreadyChosen) =>
                    Selector(endpoints, alreadyChosen),
                async (w) => await NoValid(w, dataFilePath, errorFilePath).ConfigureAwait(false),
                async (w) => await Failure(w, errorFilePath).ConfigureAwait(false),
                async (w, ex) => await Unhandled(w, errorFilePath, ex).ConfigureAwait(false)
            );
        }

        public static string EdwRs(Guid cfgId, object payld)
        {
            return JsonWrapper.Json(new
            { id = Guid.NewGuid(), ts = DateTime.UtcNow, payload = JsonWrapper.Json(payld), cfg_id = cfgId },
                new bool[] { true, true, false, true });
        }

        public static string EdwRs(Guid cfgId, IDictionary<string, string> payld)
        {
            return JsonWrapper.Json(new
            { id = Guid.NewGuid(), ts = DateTime.UtcNow, payload = JsonWrapper.Json(string.Empty, payld, true), cfg_id = cfgId },
                new bool[] { true, true, false, true });
        }

        public static string EdwRs(Guid cfgId, string payld)
        {
            return JsonWrapper.Json(new
            { id = Guid.NewGuid(), ts = DateTime.UtcNow, payload = payld, cfg_id = cfgId },
                new bool[] { true, true, false, true });
        }

        public static string EdwEvt(object payld, IDictionary<string, string> rsids)
        {
            var pyld = new StringBuilder(JsonWrapper.Json(payld));
            return EdwEvt(pyld, rsids);
        }

        public static string EdwEvt(IDictionary<string, string> payld, IDictionary<string, string> rsids)
        {
            var pyld = new StringBuilder(JsonWrapper.Json(string.Empty, payld, true));
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
            sb.Append("}");
            return sb.ToString();
        }
    }
}
