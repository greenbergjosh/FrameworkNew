using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

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

        private static List<IEndpoint> _endpoints;
        public static async Task<IReadOnlyList<IEndpoint>> InitializeEndpoints(Entity.Entity config)
        {
            var appName = await config.EvalS("ErrorLogAppName", "");

            var endpoints = new List<IEndpoint>();
            await foreach (var silo in config.EvalL("ErrSilos"))
            {
                endpoints.Add(new ErrorSiloEndpoint(await silo.EvalS("DataLayerType"), await silo.EvalS("ConnectionString"), appName));
            }

            _endpoints = endpoints;
            return endpoints;
        }

        public static async Task<IReadOnlyList<IEndpoint>> PollEndpoints(Entity.Entity config)
        {
            var appName = await config.EvalS("ErrorLogAppName", "");

            var endpoints = new List<IEndpoint>();
            await foreach (var silo in config.EvalL("ErrSilos"))
            {
                endpoints.Add(new ErrorSiloEndpoint(await silo.EvalS("DataLayerType"), await silo.EvalS("ConnectionString"), appName));
            }

            return endpoints;
        }

        public static Task InitiateWalkaway(object w, string errorFilePath)
        {
            FileSystem.WriteLineToFileThreadSafe(errorFilePath, DateTime.Now + "::" + w);
            return Task.CompletedTask;
        }

        public static int NextWalkawayValue(int previousValue) => previousValue == 0 ? 1 : previousValue == 1 ? 5 : previousValue == 5 ? 60 : 0;

        public static IEndpoint Selector(ConcurrentDictionary<IEndpoint, (bool alive, int delaySeconds)> endpoints, IReadOnlyList<IEndpoint> alreadyChosen)
        {
            IEndpoint e = null;
            var es = endpoints.Keys.ToList();
            var rnd = new Random(DateTime.Now.Millisecond);
            for (int i = rnd.Next(0, es.Count), k = 0; k < es.Count; k++)
            {
                e = es[i];
                if (!alreadyChosen.Contains(e) && endpoints[e].alive)
                {
                    break;
                }

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

        public static async Task<ErrorSiloLoadBalancedWriter> InitializeErrorSiloLoadBalancedWriter(Entity.Entity config)
        {
            var writeTimeoutSeconds = await config.EvalI("ErrorWriteTimeout", 0);
            var path = await config.EvalS("ErrorFilePath", defaultValue: null);
            var errorFilePath = path.IsNullOrWhitespace() ? null : Path.GetFullPath(path);

            return new ErrorSiloLoadBalancedWriter(60,
                writeTimeoutSeconds,
                async () => await InitializeEndpoints(config).ConfigureAwait(false),
                async () => await PollEndpoints(config).ConfigureAwait(false),
                async (object w, int timeoutSeconds) => await InitiateWalkaway(w, errorFilePath).ConfigureAwait(false),
                NextWalkawayValue,
                Selector,
                async (object w) => await NoValid(w, errorFilePath).ConfigureAwait(false),
                async (object w) => await Failure(w, errorFilePath).ConfigureAwait(false),
                async (object w, Exception ex) => await Unhandled(w, errorFilePath, ex).ConfigureAwait(false)
            );
        }
    }
}