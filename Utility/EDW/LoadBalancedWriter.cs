using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reactive.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Utility.EDW
{
    public abstract class LoadBalancedWriter
    {
        public enum Result
        {
            Success = 0,
            DefaultFailure,
            Walkaway,
            Failure,
            RemoveEndpoint
        }

        public delegate Task<IReadOnlyList<IEndpoint>> InitializeEndpointsDelegate();

        public delegate Task<IReadOnlyList<IEndpoint>> PollEndpointsDelegate();

        public delegate Task InitiateWalkawayDelegate(object w, int timeoutSeconds);

        public delegate Task NoValidEndpointsDelegate(object w);

        public delegate Task FailureDelegate(object w);

        public delegate Task UnhandledExceptionDelegate(object w, Exception ex);

        public delegate IEndpoint SelectEndpointDelegate(ConcurrentDictionary<IEndpoint, (bool alive, int delaySeconds)> endpoints, IReadOnlyList<IEndpoint> alreadyChosen);

        public delegate int NextWalkawayValueDelegate(int previousValue);

        private readonly int writeTimeoutSec = 120;
        private readonly int endpointPollingInterval;
        private readonly ConcurrentDictionary<IEndpoint, (bool alive, int delaySeconds)> endpoints;
        private readonly NextWalkawayValueDelegate nextWalkawayValue;

        private readonly PollEndpointsDelegate pollEndpoints;
        private readonly InitiateWalkawayDelegate initiateWalkaway;
        private readonly SelectEndpointDelegate selector;
        private readonly NoValidEndpointsDelegate novalid;
        private readonly FailureDelegate failure;
        private readonly UnhandledExceptionDelegate unhandled;

        public LoadBalancedWriter(int endpointPollingInterval,
            int writeTimeoutSec,
            InitializeEndpointsDelegate initializeEndpoints,
            PollEndpointsDelegate pollEndpoints,
            InitiateWalkawayDelegate initiateWalkaway,
            NextWalkawayValueDelegate nextWalkawayValue,
            SelectEndpointDelegate selector,
            NoValidEndpointsDelegate novalid,
            FailureDelegate failure,
            UnhandledExceptionDelegate unhandled)
        {
            this.endpointPollingInterval = endpointPollingInterval;
            this.writeTimeoutSec = writeTimeoutSec == 0 ? this.writeTimeoutSec : writeTimeoutSec;
            var ps = initializeEndpoints().ConfigureAwait(false).GetAwaiter().GetResult();

            endpoints = new ConcurrentDictionary<IEndpoint, (bool alive, int delaySeconds)>();
            foreach (var p in ps)
            {
                if (!endpoints.TryAdd(p, (true, 0)))
                {
                    throw new Exception("Unable to add endpoint!");
                }
            }

            this.pollEndpoints = pollEndpoints;
            this.nextWalkawayValue = nextWalkawayValue;
            this.initiateWalkaway = initiateWalkaway;
            this.selector = selector;
            this.novalid = novalid;
            this.failure = failure;
            this.unhandled = unhandled;
            InitiateEndpointPolling();
        }

        public async Task<Result> Write(object w) => await Write(w, writeTimeoutSec);

        public async Task<Result> Write(object w, int timeoutSeconds) => await Write(w, timeoutSeconds, initiateWalkaway, selector, novalid,
                failure, unhandled).ConfigureAwait(false);

        public async Task<Result> Write(object w, int timeoutSeconds,
            InitiateWalkawayDelegate initiateWalkaway,
            SelectEndpointDelegate selector,
            NoValidEndpointsDelegate novalid,
            FailureDelegate failure,
            UnhandledExceptionDelegate unhandled)
        {
            var writeError = Result.DefaultFailure;
            try
            {
                var secondaryWrite = false;
                var alreadyChosen = new List<IEndpoint>();
                while (true)
                {
                    IEndpoint p = null;
                    p = selector(endpoints, alreadyChosen);

                    if (p == null)
                    {
                        await novalid(w).ConfigureAwait(false);
                        break;
                    }

                    alreadyChosen.Add(p);
                    writeError = await p.Write(w, secondaryWrite, timeoutSeconds).ConfigureAwait(false);
                    if (writeError == Result.Success)
                    {
                        break;
                    }
                    else if (writeError == Result.Failure)
                    {
                        await failure(w).ConfigureAwait(false);
                        break;
                    }
                    else if (writeError == Result.Walkaway)
                    {
                        RemoveEndpoint(p, true);
                        secondaryWrite = true;
                        await initiateWalkaway(w, timeoutSeconds).ConfigureAwait(false);
                    }
                    else if (writeError == Result.RemoveEndpoint)
                    {
                        RemoveEndpoint(p, false);
                        // Reset w to succeed only for testing
                        // w = "{\"TestAction\": \"Success\", \"V\": \"50\"}";
                    }
                }
            }
            catch (Exception ex)
            {
                writeError = Result.Failure;
                await unhandled(w, ex).ConfigureAwait(false);
            }

            return writeError;
        }

        private void InitiateEndpointPolling()
        {
            var observable =
                Observable.Interval(TimeSpan.FromSeconds(endpointPollingInterval));

            var source = new CancellationTokenSource();
            async void action() => await PollEndpointsCallback().ConfigureAwait(false);
            observable.Subscribe(x =>
            {
                var task = new Task(action);
                task.Start();
            }, source.Token);
        }

        private async Task PollEndpointsCallback()
        {
            try
            {
                var newEndpoints = await pollEndpoints().ConfigureAwait(false);
                var endpoints = new ConcurrentDictionary<IEndpoint, (bool alive, int delaySeconds)>(newEndpoints.Select(endpoint => new KeyValuePair<IEndpoint, (bool alive, int delaySeconds)>(endpoint, (true, 0))));
            }
            catch
            {
            }
        }

        private void RemoveEndpoint(IEndpoint p, bool walkaway, bool initialCall = true)
        {
            (bool alive, int delaySeconds) t;
            try
            {
                if (walkaway == false)
                {
                    _ = endpoints.TryRemove(p, out t);
                    return;
                }

                if (endpoints.TryGetValue(p, out t))
                {
                    var nextTimeout = nextWalkawayValue(t.delaySeconds);

                    if (nextTimeout == 0)
                    {
                        _ = endpoints.TryRemove(p, out t);
                    }
                    else
                    {
                        if (endpoints[p].alive == false && initialCall)
                        {
                            return;
                        }

                        endpoints[p] = (false, nextTimeout);
                        _ = Task.Run(async () =>
                        {
                            await Task.Delay(nextTimeout * 1000).ConfigureAwait(false);
                            try
                            {
                                await AuditEndpoint(p).ConfigureAwait(false);
                            }
                            catch
                            {
                            }
                        });
                    }
                }
            }
            catch
            {
            }
        }

        private async Task AuditEndpoint(IEndpoint p)
        {
            try
            {
                var res = await p.Audit().ConfigureAwait(false);
                if (res)
                {
                    if (endpoints.ContainsKey(p))
                    {
                        endpoints[p] = (true, 0);
                    }
                }
                else
                {
                    RemoveEndpoint(p, true, false);
                }
            }
            catch
            {
            }
        }
    }
}