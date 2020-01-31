using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Utility.GenericEntity;

namespace Utility.EDW.Logging
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
            foreach (var silo in config.GetL("Config/ErrSilos")) endpoints.Add(new ErrorSiloEndpoint(silo.GetS("DataLayerType"), silo.GetS("ConnectionString")));
            return Task.FromResult(endpoints);
        }

        public static Task<List<IEndpoint>> PollEndpoints(IGenericEntity config)
        {
            var endpoints = new List<IEndpoint>();
            foreach (var silo in config.GetL("Config/ErrSilos")) endpoints.Add(new ErrorSiloEndpoint(silo.GetS("DataLayerType"), silo.GetS("ConnectionString")));
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
            var path = config.GetS("Config/ErrorFilePath");
            var errorFilePath = path.IsNullOrWhitespace() ? null : Path.GetFullPath(path);

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