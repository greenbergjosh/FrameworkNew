using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Utility.EDW;
using Utility.GenericEntity;

namespace Utility.LongRunningWorkflow
{
    public class LongRunningWorkflowSiloLoadBalancedWriter : LoadBalancedWriter
    {
        public LongRunningWorkflowSiloLoadBalancedWriter(int endpointPollingInterval,
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
            foreach (var silo in config.GetL("Config/LrwSilos")) endpoints.Add(new LongRunningWorkflowSiloEndpoint(silo.GetS("DataLayerType"), silo.GetS("ConnectionString")));
            return Task.FromResult(endpoints);
        }

        public static Task<List<IEndpoint>> PollEndpoints(IGenericEntity config)
        {
            var endpoints = new List<IEndpoint>();
            foreach (var silo in config.GetL("Config/LrwSilos")) endpoints.Add(new LongRunningWorkflowSiloEndpoint(silo.GetS("DataLayerType"), silo.GetS("ConnectionString")));
            return Task.FromResult(endpoints);
        }

        public static async Task InitiateWalkaway(object w, string errorFilePath, int timeoutSeconds) => await File.AppendAllTextAsync(errorFilePath, DateTime.Now + "::" + w.ToString()).ConfigureAwait(false);

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

        public static async Task Failure(object w, string errorFilePath) => await File.AppendAllTextAsync(errorFilePath, $"{DateTime.Now}::Failure::{w}{Environment.NewLine}").ConfigureAwait(false);

        public static async Task Unhandled(object w, string errorFilePath, Exception ex) => await File.AppendAllTextAsync(errorFilePath, $"{DateTime.Now}::Unhandled::{w}::Exception::{ex?.Message ?? "None provided"}{Environment.NewLine}").ConfigureAwait(false);

        public static LongRunningWorkflowSiloLoadBalancedWriter InitializeLongRunningWorkflowSiloLoadBalancedWriter(IGenericEntity config)
        {
            var siloConns = config.GetL("Config/LrwSilos");

            if (!siloConns.Any()) return null;

            var writeTimeoutSeconds = config.GetS("Config/LrwWriteTimeout").ParseInt() ?? 0;
            var dataFilePath = Path.GetFullPath(config.GetS("Config/LrwDataFilePath"));
            var errorFilePath = Path.GetFullPath(config.GetS("Config/LrwErrorFilePath"));

            return new LongRunningWorkflowSiloLoadBalancedWriter(60,
                writeTimeoutSeconds,
                async () => await LongRunningWorkflowSiloLoadBalancedWriter.InitializeEndpoints(config).ConfigureAwait(false),
                async () => await LongRunningWorkflowSiloLoadBalancedWriter.PollEndpoints(config).ConfigureAwait(false),
                async (object w, int timeoutSeconds) => await LongRunningWorkflowSiloLoadBalancedWriter.InitiateWalkaway(w, errorFilePath, timeoutSeconds).ConfigureAwait(false),
                (int previousValue) => LongRunningWorkflowSiloLoadBalancedWriter.NextWalkawayValue(previousValue),
                (ConcurrentDictionary<IEndpoint, Tuple<bool, int>> endpoints, List<IEndpoint> alreadyChosen) =>
                    LongRunningWorkflowSiloLoadBalancedWriter.Selector(endpoints, alreadyChosen),
                async (object w) => await LongRunningWorkflowSiloLoadBalancedWriter.NoValid(w, dataFilePath, errorFilePath).ConfigureAwait(false),
                async (object w) => await LongRunningWorkflowSiloLoadBalancedWriter.Failure(w, errorFilePath).ConfigureAwait(false),
                async (object w, Exception ex) => await LongRunningWorkflowSiloLoadBalancedWriter.Unhandled(w, errorFilePath, ex).ConfigureAwait(false)
            );
        }
    }
}