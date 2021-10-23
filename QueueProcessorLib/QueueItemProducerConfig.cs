using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Utility;

namespace QueueProcessorLib
{
    internal sealed class QueueItemProducerConfig
    {
        public string Name { get; }
        [JsonIgnore]
        public Func<int, Task<IEnumerable<QueueItem>>> ItemGetter { get; }
        public HashSet<string> DiscriminatorsInRetry { get; }
        [JsonIgnore]
        public Func<QueueItem, Task> SendToRetryQueue { get; }
        [JsonIgnore]
        public Func<IEnumerable<long>, Task> SendToRestartQueue { get; }

        [JsonIgnore]
        public BlockingCollection<QueueItem> Queue { get; }
        public int SleepInterval { get; }
        public int BatchSize { get; }
        public int LowWatermark { get; }

        public QueueItemProducerConfig(FrameworkWrapper fw, string name, Func<int, Task<IEnumerable<QueueItem>>> itemGetter, HashSet<string> discriminatorsInRetry, Func<QueueItem, Task> sendToRetryQueue, Func<IEnumerable<long>, Task> sendToRestartQueue)
        {
            Name = name;
            ItemGetter = itemGetter;
            DiscriminatorsInRetry = discriminatorsInRetry;
            SendToRetryQueue = sendToRetryQueue;
            SendToRestartQueue = sendToRestartQueue;

            SleepInterval = int.Parse(fw.StartupConfiguration.GetS("Config/QueueProcessor/QueueItemProducer/SleepInterval").IfNullOrWhitespace("1000"));
            BatchSize = int.Parse(fw.StartupConfiguration.GetS("Config/QueueProcessor/QueueItemProducer/BatchSize").IfNullOrWhitespace("20"));
            LowWatermark = int.Parse(fw.StartupConfiguration.GetS("Config/QueueProcessor/QueueItemProducer/LowWatermark").IfNullOrWhitespace("10"));

            var highWatermark = int.Parse(fw.StartupConfiguration.GetS("Config/QueueProcessor/QueueItemProducer/HighWatermark").IfNullOrWhitespace("20"));
            Queue = new BlockingCollection<QueueItem>(highWatermark);
        }
    }
}
