using System;
using System.Collections.Concurrent;

namespace Framework.Core.ProcessManagement
{
    public class Process
    {
        public readonly ConcurrentDictionary<Guid, Guid> Threads =
            new ConcurrentDictionary<Guid, Guid>();

        public readonly Guid Id;

        public readonly string User;

        public Process(Guid processId, string user)
        {
            Id = processId;
            User = user;
        }
    }
}
