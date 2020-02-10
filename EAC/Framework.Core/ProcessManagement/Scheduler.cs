using System;

namespace Framework.Core.ProcessManagement
{
    public class Scheduler : IScheduler
    {
        public static readonly Scheduler Instance = new Scheduler();

        public void RaiseInterrupt(string interrupt)
        {
            Console.WriteLine($"Raise Interrupt {interrupt}.");
        }

        public void RaiseSignal(string signal)
        {
            Console.WriteLine($"Raise Signal {signal}.");
        }

        public void ReadySetItem(string item)
        {
            Console.WriteLine($"Ready SetItem {item}.");
        }
    }
}
