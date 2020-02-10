using System;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace Framework.Core.ProcessManagement
{
    public class ProcessManager : IProcessManager
    {
        public static readonly ProcessManager Instance = new ProcessManager();

        private readonly ConcurrentDictionary<Guid, Process> _processes =
            new ConcurrentDictionary<Guid, Process>();

        private readonly ConcurrentDictionary<Guid, Guid>    _threads =
            new ConcurrentDictionary<Guid, Guid>();

        private readonly ConcurrentDictionary<string, Process> _userProcesses =
            new ConcurrentDictionary<string, Process>();

        public readonly ConcurrentDictionary<Guid, Guid> GsToStates =
            new ConcurrentDictionary<Guid, Guid>();

        static ProcessManager()
        {
            Instance = new ProcessManager();
        }

        private Process FindProcess(Guid processId)
        {
            if (!_processes.TryGetValue(processId, out Process process))
                throw new ArgumentException($"Could not find process [{processId}].", nameof(processId));
            return process;
        }

        private Process FindProcessOfThread(Guid threadId)
        {
            foreach (var kv in _processes)
            {
                if (kv.Value.Threads.ContainsKey(threadId))
                    return kv.Value;
            }

            throw new ArgumentException($"Could not find process for thread [{threadId}].", nameof(threadId));
        }

        public Process CreateProcess(string user)
        {
            var processId = Guid.NewGuid();
            var process = new Process(processId, user);

            if (!_processes.TryAdd(processId, process))
                throw new InvalidOperationException("Process creation failed.");

            if (!_userProcesses.TryAdd(user, process))
                throw new InvalidOperationException("Process creation failed.");

            return process;
        }

        public Guid CreateThread(Guid processId)
        {
            var process = FindProcess(processId);

            var threadId = Guid.NewGuid();

            if (!_threads.TryAdd(threadId, process.Id))
                throw new ArgumentException($"Could not create thread on process [{processId}].", 
                    nameof(processId));

            return threadId;
        }

        public void KillProcess(Guid processId)
        {
            if (FindProcess(processId).Threads.Count > 0)
                throw new ArgumentException($"Threads are still running in process [{processId}].", 
                    nameof(processId));

            if (!_processes.TryRemove(processId, out var _))
                throw new ArgumentException($"Could not kill process [{processId}].", nameof(processId));
        }

        public void KillThread(Guid threadId)
        {
            if (!FindProcessOfThread(threadId).Threads.TryRemove(threadId, out var _))
                throw new ArgumentException($"Could not kill thread [{threadId}].", nameof(threadId));
        }

        public void MoveProcessToExceptionQueue(Guid serviceThreadContinuationId)
        {
            // TODO: Ask Josh for more details
        }

        public void HardKillProcess(Guid processId)
        {
            // TODO: Does it need to do something in existing threads?

            if (!_processes.TryRemove(processId, out var _))
                throw new ArgumentException($"Could not kill process [{processId}].", nameof(processId));
        }

        public void HardMoveToExceptionQueue(Guid processId)
        {
            // TODO: Ask Josh for more details
        }

        static Dictionary<Guid, string> _states = new Dictionary<Guid, string>();

        public void SaveState(Guid threadId, State s)
        {
            _states[threadId] = s.Serialize();
        }

        public ContinuationPointer LoadContinuationPointer(IGenericEntity s)
        {
            var state = (State)s;
            var g = s.Get(Keywords.g, Guid.Empty);
            if (g != Guid.Empty)
            {
                var tid = GetContinuationPointer(g);
                var json = _states[tid];
                state.Deserialize(json);
                return new ContinuationPointer()
                {
                    Id = g,
                    ThreadId = tid
                };
            }
            
            var nm = s.Get(Keywords.nm, Guid.Empty);
            if (nm == Guid.Empty)
                throw new InvalidOperationException("Cannot determine the value of nm.");

            // TODO: Replace with real user determination algorithm
            var user = "127.0.0.1";
            if (!_userProcesses.TryGetValue(user, out Process process))
                process = CreateProcess(user);

            
            state.Memory[Guid.Empty] = new Dictionary<string, object>()
            {
                [Keywords.EntityId] = nm,
                [Keywords.ProcessId] = process.Id
            };

            var threadId = CreateThread(process.Id);

            var result = new ContinuationPointer
            {
                Id = Guid.Empty,
                ThreadId = threadId
            };

            return result;
        }

        private Guid GetContinuationPointer(Guid continuationPointerId)
        {
            if (GsToStates.TryGetValue(continuationPointerId, out var value))
                return value;
            
            throw new ArgumentException($"Could not find continuation pointer id [{continuationPointerId}].",
                nameof(continuationPointerId));
        }

        public void SaveContinuationPointer(Guid continuationPointerId, Guid threadId)
        {
            if (!GsToStates.TryAdd(continuationPointerId, threadId))
                throw new ArgumentException($"Could not create G pointer [{continuationPointerId}].", 
                    nameof(continuationPointerId));
        }

        public void DeleteContinuationPointer(Guid continuationPointerId)
        {
            if (!GsToStates.TryRemove(continuationPointerId, out var _))
                throw new ArgumentException($"Could not delete G pointer [{continuationPointerId}].", 
                    nameof(continuationPointerId));
        }
    }
}
