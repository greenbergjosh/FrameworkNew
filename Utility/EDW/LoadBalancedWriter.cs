using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
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

        public delegate Task<List<IEndpoint>> InitializeEndpointsDelegate();
        public delegate Task<List<IEndpoint>> PollEndpointsDelegate();
        public delegate Task InitiateWalkawayDelegate(object w, int timeoutSeconds);
        public delegate Task NoValidEndpointsDelegate(object w);
        public delegate Task FailureDelegate(object w);
        public delegate Task UnhandledExceptionDelegate(object w, Exception ex);
        public delegate IEndpoint SelectEndpointDelegate(ConcurrentDictionary<IEndpoint, Tuple<bool, int>> endpoints, List<IEndpoint> alreadyChosen);
        public delegate int NextWalkawayValueDelegate(int previousValue);

        private ReaderWriterLockSlim cacheLock = new ReaderWriterLockSlim();

        public int writeTimeoutSec = 120;
        public int endpointPollingInterval;
        public ConcurrentDictionary<IEndpoint, Tuple<bool, int>> endpoints;
        public NextWalkawayValueDelegate nextWalkawayValue;

        public InitializeEndpointsDelegate initializeEndpoints;
        public PollEndpointsDelegate pollEndpoints;
        public InitiateWalkawayDelegate initiateWalkaway;
        public SelectEndpointDelegate selector;
        public NoValidEndpointsDelegate novalid;
        public FailureDelegate failure;
        public UnhandledExceptionDelegate unhandled;

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
            List<IEndpoint> ps = initializeEndpoints().ConfigureAwait(false)
                .GetAwaiter().GetResult();

            this.endpoints = new ConcurrentDictionary<IEndpoint, Tuple<bool, int>>();
            foreach (var p in ps)
            {
                this.endpoints.TryAdd(p, new Tuple<bool, int>(true, 0));
            }

            this.initializeEndpoints = initializeEndpoints;
            this.pollEndpoints = pollEndpoints;
            this.nextWalkawayValue = nextWalkawayValue;
            this.initiateWalkaway = initiateWalkaway;
            this.selector = selector;
            this.novalid = novalid;
            this.failure = failure;
            this.unhandled = unhandled;
            InitiateEndpointPolling();
        }

        public async Task<LoadBalancedWriter.Result> Write(object w)
        {
            return await Write(w, writeTimeoutSec);
        }

        public async Task<LoadBalancedWriter.Result> Write(object w, int timeoutSeconds)
        {
            return await Write(w, timeoutSeconds, this.initiateWalkaway, this.selector, this.novalid,
                this.failure, this.unhandled).ConfigureAwait(false);
        }

        public async Task<LoadBalancedWriter.Result> Write(object w, int timeoutSeconds, 
            InitiateWalkawayDelegate initiateWalkaway, 
            SelectEndpointDelegate selector, 
            NoValidEndpointsDelegate novalid,
            FailureDelegate failure,
            UnhandledExceptionDelegate unhandled)
        {
            LoadBalancedWriter.Result writeError = LoadBalancedWriter.Result.DefaultFailure;
            try
            {
                bool secondaryWrite = false;
                List<IEndpoint> alreadyChosen = new List<IEndpoint>();
                while (true)
                {
                    IEndpoint p = null;
                    cacheLock.EnterReadLock();
                    try
                    {
                        p = selector(endpoints, alreadyChosen);
                    }
                    finally
                    {
                        cacheLock.ExitReadLock();
                    }

                    if (p == null)
                    {
                        await novalid(w).ConfigureAwait(false);
                        break;
                    }
                    alreadyChosen.Add(p);
                    writeError = await p.Write(w, secondaryWrite, timeoutSeconds)
                        .ConfigureAwait(false);
                    if (writeError == LoadBalancedWriter.Result.Success) break;
                    else if (writeError == LoadBalancedWriter.Result.Failure)
                    {
                        await failure(w).ConfigureAwait(false);
                        break;
                    }
                    else if (writeError == LoadBalancedWriter.Result.Walkaway)
                    {
                        RemoveEndpoint(p, true);
                        secondaryWrite = true;
                        await initiateWalkaway(w, timeoutSeconds)
                            .ConfigureAwait(false);
                    }
                    else if (writeError == LoadBalancedWriter.Result.RemoveEndpoint)
                    {
                        RemoveEndpoint(p, false);
                        // Reset w to succeed only for testing
                        // w = "{\"TestAction\": \"Success\", \"V\": \"50\"}";
                    }
                }
            }
            catch (Exception ex)
            {
                writeError = LoadBalancedWriter.Result.Failure;
                await unhandled(w, ex).ConfigureAwait(false);
            }

            return writeError;
        }

        void InitiateEndpointPolling() 
        {
            IObservable<long> observable = 
                Observable.Interval(TimeSpan.FromSeconds(this.endpointPollingInterval));

            CancellationTokenSource source = new CancellationTokenSource();
            Action action = (async () => await PollEndpointsCallback().ConfigureAwait(false));
            observable.Subscribe(x => {
                Task task = new Task(action); task.Start();
            }, source.Token);
        }

        async Task PollEndpointsCallback()
        {
            try
            {
                List<IEndpoint> newEndpoints = await this.pollEndpoints().ConfigureAwait(false);
                cacheLock.EnterWriteLock();
                try
                {
                    foreach (var key in newEndpoints)
                    {
                        if (!endpoints.ContainsKey(key))
                            endpoints[key] = new Tuple<bool, int>(true, 0);
                    }
                    foreach (var key in endpoints.Keys)
                    {
                        Tuple<bool, int> t;
                        if (!newEndpoints.Contains(key)) endpoints.TryRemove(key, out t);
                    }
                }
                finally
                {
                    cacheLock.ExitWriteLock();
                }
            }
            catch (Exception ex)
            {
                int zz = 1;
            }
        }

        void RemoveEndpoint(IEndpoint p, bool walkaway, bool initialCall = true) 
        {
            Tuple<bool, int> t;
            try
            {
                if (walkaway == false)
                {
                    endpoints.TryRemove(p, out t);
                    return;
                }

                if (endpoints.TryGetValue(p, out t))
                {
                    int nextTimeout = nextWalkawayValue(t.Item2);

                    if (nextTimeout == 0)
                        endpoints.TryRemove(p, out t);
                    else
                    {
                        cacheLock.EnterWriteLock();
                        try
                        {
                            if (endpoints[p].Item1 == false && initialCall) return;
                            endpoints[p] = new Tuple<bool, int>(false, nextTimeout);
                            var _ = Task.Run(async () =>
                            {
                                await Task.Delay(nextTimeout).ConfigureAwait(false);
                                try
                                {
                                    await AuditEndpoint(p).ConfigureAwait(false);
                                }
                                catch (Exception ex)
                                {
                                    int zz = 1;
                                }
                            });
                        }
                        finally
                        {
                            cacheLock.ExitWriteLock();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                int kk = 1;
            }
        }

        async Task AuditEndpoint(IEndpoint p)
        {
            try
            {
                bool res = await p.Audit().ConfigureAwait(false);
                if (res)
                {
                    cacheLock.EnterWriteLock();
                    try
                    {
                        if (endpoints.ContainsKey(p))
                            endpoints[p] = new Tuple<bool, int>(true, 0);
                    }
                    finally
                    {
                        cacheLock.ExitWriteLock();
                    }
                }
                else
                {
                    RemoveEndpoint(p, true, false);
                }
            }
            catch (Exception ex)
            {
                int i = 1;
            }
        }
    }
}
