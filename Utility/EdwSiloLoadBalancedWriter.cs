using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Utility;

namespace Utility
{
    public class EdwSiloLoadBalancedWriter : LoadBalancedWriter
    {
        public EdwSiloLoadBalancedWriter(int endpointPollingInterval,
            InitializeEndpointsDelegate initEndpoints,
            PollEndpointsDelegate pollEndpoints,
            InitiateWalkawayDelegate td,
            NextWalkawayValueDelegate badEndpointWalkaway,
            SelectEndpointDelegate selector,
            NoValidEndpointsDelegate novalid,
            FailureDelegate invalid,
            UnhandledExceptionDelegate unhandled,
            string errorFilePath,
            string dataFilePath)
            : base(endpointPollingInterval, initEndpoints, pollEndpoints, td, badEndpointWalkaway,
                selector, novalid, invalid, unhandled, errorFilePath, dataFilePath) { }

        public static async Task<List<IEndpoint>> InitializeEndpoints(IGenericEntity config)
        {
            List<IEndpoint> endpoints = new List<IEndpoint>();
            foreach (var silo in config.GetL("Config/EdwSilos")) endpoints.Add(new EdwSiloEndpoint(silo.GetS("")));
            return endpoints;
        }

        public static async Task<List<IEndpoint>> PollEndpoints(IGenericEntity config)
        {
            List<IEndpoint> endpoints = new List<IEndpoint>();
            foreach (var silo in config.GetL("Config/EdwSilos")) endpoints.Add(new EdwSiloEndpoint(silo.GetS("")));
            return endpoints;
        }

        public static async Task InitiateWalkaway(object w, string errorFilePath, int timeoutSeconds)
        {
            await File.AppendAllTextAsync(errorFilePath, DateTime.Now + "::" + (string)w).ConfigureAwait(false);
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
            List<IEndpoint> es = endpoints.Keys.ToList();
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
            await File.AppendAllTextAsync(errorFilePath, DateTime.Now + "::NoValid::" + (string)w).ConfigureAwait(false);
            await File.AppendAllTextAsync(errorFilePath, DateTime.Now + "::NoValid::" + (string)w).ConfigureAwait(false);
        }

        public static async Task Failure(object w, string errorFilePath)
        {
            await File.AppendAllTextAsync(errorFilePath, DateTime.Now + "::Failure::" + (string)w).ConfigureAwait(false);
        }

        public static async Task Unhandled(object w, string errorFilePath, Exception ex)
        {
            await File.AppendAllTextAsync(errorFilePath, DateTime.Now + "::Unhandled::" + (string)w).ConfigureAwait(false);
        }
    }
}
