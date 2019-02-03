using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Utility;

namespace Utility
{
    public class ErrorSiloLoadBalancedWriter : LoadBalancedWriter
    {
        public ErrorSiloLoadBalancedWriter(int endpointPollingInterval,
            int writeTimeoutMs,
            InitializeEndpointsDelegate initEndpoints,
            PollEndpointsDelegate pollEndpoints,
            InitiateWalkawayDelegate td,
            NextWalkawayValueDelegate badEndpointWalkaway,
            SelectEndpointDelegate selector,
            NoValidEndpointsDelegate novalid,
            FailureDelegate invalid,
            UnhandledExceptionDelegate unhandled)
            : base(endpointPollingInterval, writeTimeoutMs, initEndpoints, pollEndpoints, td, badEndpointWalkaway,
                selector, novalid, invalid, unhandled)
        { }

        public static async Task<List<IEndpoint>> InitializeEndpoints(IGenericEntity config)
        {
            List<IEndpoint> endpoints = new List<IEndpoint>();
            foreach (var silo in config.GetL("Config/ErrSilos")) endpoints.Add(new ErrorSiloEndpoint(silo.GetS("DataLayerType"), silo.GetS("ConnectionString")));
            return endpoints;
        }

        public static async Task<List<IEndpoint>> PollEndpoints(IGenericEntity config)
        {
            List<IEndpoint> endpoints = new List<IEndpoint>();
            foreach (var silo in config.GetL("Config/ErrSilos")) endpoints.Add(new ErrorSiloEndpoint(silo.GetS("DataLayerType"), silo.GetS("ConnectionString")));
            return endpoints;
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

        public static async Task NoValid(object w, string errorFilePath)
        {
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

        public static ErrorSiloLoadBalancedWriter InitializeErrorSiloLoadBalancedWriter(IGenericEntity config)
        {
            int writeTimeoutSeconds = config.GetS("Config/ErrorWriteTimeout").ParseInt() ?? 0;
            string errorFilePath = Path.GetFullPath(config.GetS("Config/ErrorFilePath"));

            return new ErrorSiloLoadBalancedWriter(60,
                writeTimeoutSeconds,
                async () => await ErrorSiloLoadBalancedWriter.InitializeEndpoints(config).ConfigureAwait(false),
                async () => await ErrorSiloLoadBalancedWriter.PollEndpoints(config).ConfigureAwait(false),
                async (object w, int timeoutSeconds) => await ErrorSiloLoadBalancedWriter.InitiateWalkaway(w, errorFilePath, timeoutSeconds).ConfigureAwait(false),
                (int previousValue) => ErrorSiloLoadBalancedWriter.NextWalkawayValue(previousValue),
                (ConcurrentDictionary<IEndpoint, Tuple<bool, int>> endpoints, List<IEndpoint> alreadyChosen) =>
                    ErrorSiloLoadBalancedWriter.Selector(endpoints, alreadyChosen),
                async (object w) => await ErrorSiloLoadBalancedWriter.NoValid(w, errorFilePath).ConfigureAwait(false),
                async (object w) => await ErrorSiloLoadBalancedWriter.Failure(w, errorFilePath).ConfigureAwait(false),
                async (object w, Exception ex) => await ErrorSiloLoadBalancedWriter.Unhandled(w, errorFilePath, ex).ConfigureAwait(false)
            );
        }
    }
}
