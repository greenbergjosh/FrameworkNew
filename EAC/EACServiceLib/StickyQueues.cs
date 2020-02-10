using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data.HashFunction.xxHash;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EACServiceLib
{
    public static class StickyQueues
    {
        const int NbNodes = 20;
        public static int GetNodeFromId(Guid id)
        {
            var hashAlg = xxHashFactory.Instance.Create();
            var hash = hashAlg.ComputeHash(id.ToByteArray());
            var node = (int)(BitConverter.ToUInt32(hash.Hash, 0) % NbNodes);
            return node;
        }

        public class Message
        {
            public Guid Id { get; set; }
            public DateTime DateTime { get; set; }
        }

        public class RequestMessage : Message
        {
            public string Request { get; set; }
        }

        public class SignalMessage : Message
        {
            public string Signal { get; set; }
        }

        public class InterruptMessage : Message
        {
            public string Interrupt { get; set; }
        }

        public class MessageQueue<TMessage>
            where TMessage : Message
        {
            private readonly ConcurrentQueue<TMessage> _queue = new ConcurrentQueue<TMessage>();
            private readonly ReaderWriterLockSlim _countModifier = new ReaderWriterLockSlim();

            public ManualResetEvent Signaled { get; } = new ManualResetEvent(false);

            public int Count
            {
                get
                {
                    return _queue.Count;
                }
            }

            public bool TryDequeue(out TMessage message)
            {
                if (_queue.TryDequeue(out message))
                {
                    _countModifier.EnterWriteLock();

                    if (_queue.Count > 0)
                        Signaled.Set();
                    else
                        Signaled.Reset();

                    _countModifier.ExitWriteLock();

                    return true;
                }

                return false;
            }

            public void Enqueue(TMessage message)
            {
                _countModifier.EnterWriteLock();
                _queue.Enqueue(message);
                Signaled.Set();
                _countModifier.ExitWriteLock();
            }
        }

        static Dictionary<int, MessageQueue<RequestMessage>> _immediateQueues =
            new Dictionary<int, MessageQueue<RequestMessage>>();
        static Dictionary<int, MessageQueue<SignalMessage>> _signalQueues =
            new Dictionary<int, MessageQueue<SignalMessage>>();
        static Dictionary<int, MessageQueue<InterruptMessage>> _interruptQueues =
            new Dictionary<int, MessageQueue<InterruptMessage>>();
        public static void InitQueues()
        {
            for (var i = 0; i < NbNodes; i++)
            {
                _immediateQueues.Add(i, new MessageQueue<RequestMessage>());
                _signalQueues.Add(i, new MessageQueue<SignalMessage>());
                _interruptQueues.Add(i, new MessageQueue<InterruptMessage>());
            }
        }

        public static void Produce<TMessage>(Dictionary<int, MessageQueue<TMessage>> queues, TMessage message)
            where TMessage : Message
        {
            var nodeId = GetNodeFromId(message.Id);
            queues[nodeId].Enqueue(message);
        }

        public static void ProduceRequest(Guid id, string request)
        {
            Produce(_immediateQueues, new RequestMessage()
            {
                Id = id,
                Request = request
            });
        }

        public static void ProduceSignal(Guid id, string signal)
        {
            Produce(_signalQueues, new SignalMessage()
            {
                Id = id,
                Signal = signal
            });
        }

        public static void ProduceInterrupt(Guid id, string interrupt)
        {
            Produce(_interruptQueues, new InterruptMessage()
            {
                Id = id,
                Interrupt = interrupt
            });
        }

        public static void Consumer(int nodeId, CancellationToken cancellationToken)
        {
            var states = new Dictionary<Guid, (bool immediatePaused, bool signalPaused)>();
            RequestMessage request = null;
            InterruptMessage interrupt = null;
            SignalMessage signal = null;
            Guid id;
            var immediatePaused = false;
            var signalPaused = false;
            var immediateQueue = _immediateQueues[nodeId];
            var signalQueue = _signalQueues[nodeId];
            var interruptQueue = _interruptQueues[nodeId];
            var waitHandles = new WaitHandle[]
            {
                cancellationToken.WaitHandle,
                immediateQueue.Signaled,
                signalQueue.Signaled,
                interruptQueue.Signaled
            };

            while (true)
            {
                if (WaitHandle.WaitAny(waitHandles) == 0)
                    break;

                if (!immediatePaused)
                    immediateQueue.TryDequeue(out request);

                if (request == null && !signalPaused)
                {
                    signalQueue.TryDequeue(out signal);
                    if (signalQueue.Count > 0)
                        immediatePaused = true;
                }

                if (request == null && interrupt == null)
                {
                    interruptQueue.TryDequeue(out interrupt);
                    if (interruptQueue.Count > 0)
                    {
                        immediatePaused = true;
                        signalPaused = true;
                    }
                }

                if (request != null)
                {
                    id = request.Id;
                    Debug.WriteLine($"***Node: {nodeId}, Id: {id}, Request: {request.Request}");
                }
                else if (signal != null)
                {
                    id = signal.Id;
                    Debug.WriteLine($"***Node: {nodeId}, Id: {id}, Signal: {signal.Signal}");

                    // Look at wait table, add as confirmed signal.
                    // if wait table condition is met, run evaluatable
                }
                else// if (interrupt != null)
                {
                    id = interrupt.Id;
                    Debug.WriteLine($"***Node: {nodeId}, Id: {id}, Interrupt: {interrupt.Interrupt}");
                    // launch request
                }

                states[id] = (immediatePaused, signalPaused);

                request = null;
                interrupt = null;
                signal = null;

                if (signalQueue.Count == 0)
                    immediatePaused = false;

                if (interruptQueue.Count == 0)
                    signalPaused = false;
            }
        }

        static readonly CancellationTokenSource _cancellationTokenSource = new CancellationTokenSource();
        static Task[] _tasks;
        public static void StartConsumers()
        {
            _tasks = new Task[NbNodes];
            for (var i = 0; i < NbNodes; i++)
            {
                int iVal = i;
                _tasks[i] = Task.Factory.StartNew(
                    () => Consumer(iVal, _cancellationTokenSource.Token),
                    _cancellationTokenSource.Token,
                    TaskCreationOptions.LongRunning, 
                    TaskScheduler.Default);
            }
        }

        public static void StopConsumers()
        {
            _cancellationTokenSource.Cancel();
            Task.WaitAll(_tasks, TimeSpan.FromSeconds(30));
            _cancellationTokenSource.Dispose();
        }

        static void SendFakeData(Guid id, string msg)
        {
            ProduceInterrupt(id, msg);
            ProduceInterrupt(id, msg);
            ProduceInterrupt(id, msg);
            ProduceRequest(id, msg);
            ProduceSignal(id, msg);
            ProduceInterrupt(id, msg);
            ProduceSignal(id, msg);
        }

        public static void Test()
        {
            InitQueues();
            StartConsumers();

            var ids = Enumerable.Range(0, 20)
                .Select(t => Guid.NewGuid())
                .ToArray();

            for (int i = 0; i < 10; i++)
            {
                var msg = i.ToString();
                foreach (var id in ids)
                {
                    SendFakeData(id, msg);
                }
            }

            //Thread.Sleep(TimeSpan.FromSeconds(5));
            //StopConsumers();
        }
    }
}
