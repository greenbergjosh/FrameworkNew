using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Utility.EDW.Queueing
{
    public class PostingQueueSiloLoadBalancedWriter : LoadBalancedWriter
    {
        public PostingQueueSiloLoadBalancedWriter(int endpointPollingInterval,
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

        public static async Task<IReadOnlyList<IEndpoint>> InitializeEndpoints(Entity.Entity config)
        {
            var endpoints = new List<IEndpoint>();
            foreach (var silo in await config.Get("Config.PostingQueueSilos"))
            {
                endpoints.Add(new PostingQueueSiloEndpoint(await silo.GetS("DataLayerType"), await silo.GetS("ConnectionString")));
            }

            return endpoints;
        }

        public static async Task<List<IEndpoint>> PollEndpoints(Entity.Entity config)
        {
            var endpoints = new List<IEndpoint>();
            foreach (var silo in await config.Get("Config.PostingQueueSilos"))
            {
                endpoints.Add(new PostingQueueSiloEndpoint(await silo.GetS("DataLayerType"), await silo.GetS("ConnectionString")));
            }

            return endpoints;
        }

        public static async Task InitiateWalkaway(object w, string errorFilePath) => await File.AppendAllTextAsync(errorFilePath, DateTime.Now + "::" + w.ToString()).ConfigureAwait(false);

        public static int NextWalkawayValue(int previousValue) => previousValue == 0 ? 1 : previousValue == 1 ? 5 : previousValue == 5 ? 60 : 0;

        public static IEndpoint Selector(ConcurrentDictionary<IEndpoint, Tuple<bool, int>> endpoints, IReadOnlyList<IEndpoint> alreadyChosen)
        {
            IEndpoint e = null;
            var es = endpoints.Keys.ToList();
            var rnd = new Random(DateTime.Now.Millisecond);
            for (int i = rnd.Next(0, es.Count), k = 0; k < es.Count; k++)
            {
                e = es[i];
                if (!alreadyChosen.Contains(e) && endpoints[e].Item1)
                {
                    break;
                }

                i = (i + 1) % es.Count;
            }

            return e;
        }

        public static async Task NoValid(object w, string dataFilePath, string errorFilePath)
        {
            await File.AppendAllTextAsync(dataFilePath, $"<<//RECORD::{DateTime.Now}::NoValid::{w}//>>{Environment.NewLine}").ConfigureAwait(false);
            await File.AppendAllTextAsync(errorFilePath, $"{DateTime.Now}::NoValid::{w}{Environment.NewLine}").ConfigureAwait(false);
        }

        public static async Task Failure(object w, string errorFilePath) => await File.AppendAllTextAsync(errorFilePath, $"{DateTime.Now}::Failure::{w}{Environment.NewLine}").ConfigureAwait(false);

        public static async Task Unhandled(object w, string errorFilePath, Exception ex) => await File.AppendAllTextAsync(errorFilePath, $"{DateTime.Now}::Unhandled::{w}::Exception::{ex?.Message ?? "None provided"}{Environment.NewLine}").ConfigureAwait(false);

        public static async Task<PostingQueueSiloLoadBalancedWriter> InitializePostingQueueSiloLoadBalancedWriter(Entity.Entity config)
        {
            var writeTimeoutSeconds = await config.GetI("Config.PostingQueueWriteTimeout", 0);
            var dataFilePath = await config.GetS("Config.PostingQueueDataFilePath", null);
            var errorFilePath = await config.GetS("Config.PostingQueueErrorFilePath", null);

            return new PostingQueueSiloLoadBalancedWriter(60, writeTimeoutSeconds,
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
