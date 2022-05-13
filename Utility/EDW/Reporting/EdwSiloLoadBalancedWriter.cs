using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
            var appName = await config.EvalS("ErrorLogAppName", "");

            var endpoints = new List<IEndpoint>();
            await foreach (var silo in config.EvalL("EdwSilos"))
            {
                endpoints.Add(new EdwSiloEndpoint(await silo.EvalS("DataLayerType"), await silo.EvalS("ConnectionString"), appName));
            }

            return endpoints;
        }

        public static async Task<IReadOnlyList<IEndpoint>> PollEndpoints(Entity.Entity config)
        {
            var appName = await config.EvalS("ErrorLogAppName", "");

            var endpoints = new List<IEndpoint>();
            await foreach (var silo in config.EvalL("EdwSilos"))
            {
                endpoints.Add(new EdwSiloEndpoint(await silo.EvalS("DataLayerType"), await silo.EvalS("ConnectionString"), appName));
            }

            return endpoints;
        }

        public static Task InitiateWalkaway(object w, string errorFilePath)
        {
            FileSystem.WriteLineToFileThreadSafe(errorFilePath, DateTime.Now + "::" + w.ToString());
            return Task.CompletedTask;
        }

        public static int NextWalkawayValue(int previousValue) => previousValue == 0 ? 1 : previousValue == 1 ? 5 : previousValue == 5 ? 60 : 60;

        public static IEndpoint Selector(ConcurrentDictionary<IEndpoint, (bool alive, int delaySeconds)> endpoints, IReadOnlyList<IEndpoint> alreadyChosen)
        {
            IEndpoint chosen = null;

            var es = endpoints.Keys.ToList();
            var rnd = new Random(DateTime.Now.Millisecond);
            for (int i = rnd.Next(0, es.Count), k = 0; k < es.Count; k++)
            {
                var current = es[i];
                if (!alreadyChosen.Contains(current) && endpoints[current].alive)
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
            if (!await config.Eval("EdwSilos").Any())
            {
                return null;
            }

            var writeTimeoutSeconds = await config.EvalI("EdwWriteTimeout", 0);
            var dataFilePath = Path.GetFullPath(await config.EvalS("EdwDataFilePath"));
            var errorFilePath = Path.GetFullPath(await config.EvalS("EdwErrorFilePath"));

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
    }
}