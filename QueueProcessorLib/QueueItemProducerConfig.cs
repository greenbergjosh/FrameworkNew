using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utility;

namespace QueueProcessorLib
{
    internal sealed class QueueItemProducerConfig
    {
        public string Name { get; }
        public Func<Task<IEnumerable<QueueItem>>> ItemGetter { get; }
        public HashSet<string> DiscriminatorsInRetry { get; }
        public Func<QueueItem, Task> SendToRetryQueue { get; }
        public Func<IEnumerable<long>, Task> SendToRestartQueue { get; }

        public BlockingCollection<QueueItem> Queue { get; }
        public int SleepInterval { get; }
        public int BatchSize { get; }
        public int LowWatermark { get; }

        public QueueItemProducerConfig(FrameworkWrapper fw, string name, Func<Task<IEnumerable<QueueItem>>> itemGetter, HashSet<string> discriminatorsInRetry, Func<QueueItem, Task> sendToRetryQueue, Func<IEnumerable<long>, Task> sendToRestartQueue)
        {
            Name = name;
            ItemGetter = itemGetter;
            DiscriminatorsInRetry = discriminatorsInRetry;
            SendToRetryQueue = sendToRetryQueue;
            SendToRestartQueue = sendToRestartQueue;

            SleepInterval = int.Parse(fw.StartupConfiguration.GetS("Config/QueueItemProducerSleepInterval").IfNullOrWhitespace("1000"));
            BatchSize = int.Parse(fw.StartupConfiguration.GetS("Config/QueueItemProducerBatchSize").IfNullOrWhitespace("20"));
            LowWatermark = int.Parse(fw.StartupConfiguration.GetS("Config/QueueItemProducerLowWatermark").IfNullOrWhitespace("10"));

            var highWatermark = int.Parse(fw.StartupConfiguration.GetS("Config/QueueItemProducerHighWatermark").IfNullOrWhitespace("20"));
            Queue = new BlockingCollection<QueueItem>(highWatermark);
        }
    }
}
