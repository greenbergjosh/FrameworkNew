using System;

namespace Framework.Core.ProcessManagement
{
    public class Thread
    {
        public readonly Guid Id;
        public readonly Guid ProcessId;
        public IGenericEntity GenericEntity;
        public State State;

        public Thread(Guid threadId, Guid processId, State s)
        {
            Id = threadId;
            ProcessId = processId;
            State = s;
        }
    }
}
