// Get message from the global queue, which contains the requests, signals and interrupts of every threads, mixed.
// Multiple instances of this program can be run in parallel, and the work will be distributed amongst them.
// A message is broadcast in the "messages" channel to every worker. The fastest one to pick the work from the
// queue will perform two operations:
//  1) Forward the message to the thread specific queue, based on the type passed in the message.
//  2) Try to aquire the thread lock. If aquired, Execute the thread.

namespace RedisScheduler
{
    static class Constants
    {
        public const string Consumer = "consumer";
        public const string Producer = "producer";
        public const string Messages = "messages";
        public const string Processing = "processing";
        public const string Immediate = "immediate";
        public const string Signal = "signal";
        public const string Interrupt = "interrupt";
        public const string ImmediatePaused = "immediatePaused";
        public const string SignalsPaused = "signalsPaused";
    }
}
