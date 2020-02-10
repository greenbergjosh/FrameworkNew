namespace Framework.Core.ProcessManagement
{
    public interface IScheduler
    {
        void RaiseSignal(string signal);
        void RaiseInterrupt(string interrupt);
        void ReadySetItem(string item);
    }
}
