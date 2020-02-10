using System;

namespace Framework.Core.ProcessManagement
{
    public interface IProcessManager
    {
        ContinuationPointer LoadContinuationPointer(IGenericEntity s);
        void SaveContinuationPointer(Guid continuationPointerId, Guid threadId);
        void DeleteContinuationPointer(Guid continuationPointerId);

        Process CreateProcess(string user);
        Guid CreateThread(Guid processId);
        void KillProcess(Guid processId);
        void KillThread(Guid threadId);
        void MoveProcessToExceptionQueue(Guid serviceThreadContinuationId);
        void HardKillProcess(Guid processId);
        void HardMoveToExceptionQueue(Guid processId);
        void SaveState(Guid threadId, State s);
    }
}
