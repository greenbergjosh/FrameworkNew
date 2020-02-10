using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Framework.Core.EDW.Logging
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

        public static Task<List<IEndpoint>> InitializeEndpoints(IGenericEntity config)
        {
            var endpoints = new List<IEndpoint>();
            foreach (var silo in config.GetL("Config/ErrSilos"))
                endpoints.Add(new ErrorSiloEndpoint(silo.GetS("DataLayerType"), silo.GetS("ConnectionString")));
            return Task.FromResult(endpoints);
        }

        public static Task<List<IEndpoint>> PollEndpoints(IGenericEntity config)
        {
            var endpoints = new List<IEndpoint>();
            foreach (var silo in config.GetL("Config/ErrSilos"))
                endpoints.Add(new ErrorSiloEndpoint(silo.GetS("DataLayerType"), silo.GetS("ConnectionString")));
            return Task.FromResult(endpoints);
        }

        public static Task InitiateWalkaway(object w, string errorFilePath, int timeoutSeconds)
        {
            FileSystem.WriteLineToFileThreadSafe(errorFilePath, DateTime.Now + "::" + w);
            return Task.CompletedTask;
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

        public static Task NoValid(object w, string errorFilePath)
        {
            FileSystem.WriteLineToFileThreadSafe(errorFilePath, $"{DateTime.Now}::NoValid::{w}");
            return Task.CompletedTask;
        }


        public static Task Failure(object w, string errorFilePath)
        {
            FileSystem.WriteLineToFileThreadSafe(errorFilePath, $"{DateTime.Now}::Failure::{w}");
            return Task.CompletedTask;
        }


        public static Task Unhandled(object w, string errorFilePath, Exception ex)
        {
            FileSystem.WriteLineToFileThreadSafe(errorFilePath, $"{DateTime.Now}::Unhandled::{w}::Exception::{ex?.UnwrapForLog() ?? "None provided"}");
            return Task.CompletedTask;
        }

        public static ErrorSiloLoadBalancedWriter InitializeErrorSiloLoadBalancedWriter(IGenericEntity config)
        {
            var writeTimeoutSeconds = config.GetS("Config/ErrorWriteTimeout").ParseInt() ?? 0;
            var errorFilePath = Path.GetFullPath(config.GetS("Config/ErrorFilePath"));

            return new ErrorSiloLoadBalancedWriter(60,
                writeTimeoutSeconds,
                async () => await InitializeEndpoints(config).ConfigureAwait(false),
                async () => await PollEndpoints(config).ConfigureAwait(false),
                async (w, timeoutSeconds) => await InitiateWalkaway(w, errorFilePath, timeoutSeconds).ConfigureAwait(false),
                (previousValue) => NextWalkawayValue(previousValue),
                (endpoints, alreadyChosen) =>
                    Selector(endpoints, alreadyChosen),
                async (w) => await NoValid(w, errorFilePath).ConfigureAwait(false),
                async (w) => await Failure(w, errorFilePath).ConfigureAwait(false),
                async (w, ex) => await Unhandled(w, errorFilePath, ex).ConfigureAwait(false)
            );
        }
    }
}
