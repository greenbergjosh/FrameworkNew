using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Utility
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

        public static async Task<List<IEndpoint>> InitializeEndpoints(IGenericEntity config)
        {
            List<IEndpoint> endpoints = new List<IEndpoint>();
            foreach (var silo in config.GetL("Config/PostingQueueSilos")) endpoints.Add(new PostingQueueSiloEndpoint(silo.GetS("")));
            return endpoints;
        }

        public static async Task<List<IEndpoint>> PollEndpoints(IGenericEntity config)
        {
            List<IEndpoint> endpoints = new List<IEndpoint>();
            foreach (var silo in config.GetL("Config/PostingQueueSilos")) endpoints.Add(new PostingQueueSiloEndpoint(silo.GetS("")));
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

        public static PostingQueueSiloLoadBalancedWriter InitializePostingQueueSiloLoadBalancedWriter(IGenericEntity config)
        {
            int writeTimeoutSeconds = config.GetS("Config/PostingQueueWriteTimeout").ParseInt() ?? 0;
            string dataFilePath = config.GetS("Config/PostingQueueDataFilePath");
            string errorFilePath = config.GetS("Config/PostingQueueErrorFilePath");

            return new PostingQueueSiloLoadBalancedWriter(60, writeTimeoutSeconds,
                async () => await PostingQueueSiloLoadBalancedWriter.InitializeEndpoints(config).ConfigureAwait(false),
                async () => await PostingQueueSiloLoadBalancedWriter.PollEndpoints(config).ConfigureAwait(false),
                async (object w, int timeoutSeconds) => await PostingQueueSiloLoadBalancedWriter.InitiateWalkaway(w, errorFilePath, timeoutSeconds).ConfigureAwait(false),
                (int previousValue) => PostingQueueSiloLoadBalancedWriter.NextWalkawayValue(previousValue),
                (ConcurrentDictionary<IEndpoint, Tuple<bool, int>> endpoints, List<IEndpoint> alreadyChosen) =>
                    PostingQueueSiloLoadBalancedWriter.Selector(endpoints, alreadyChosen),
                async (object w) => await PostingQueueSiloLoadBalancedWriter.NoValid(w, dataFilePath, errorFilePath).ConfigureAwait(false),
                async (object w) => await PostingQueueSiloLoadBalancedWriter.Failure(w, errorFilePath).ConfigureAwait(false),
                async (object w, Exception ex) => await PostingQueueSiloLoadBalancedWriter.Unhandled(w, errorFilePath, ex).ConfigureAwait(false)
            );
        }
    }
}
