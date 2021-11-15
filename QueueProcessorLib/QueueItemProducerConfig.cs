using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Utility;

namespace QueueProcessorLib
{
    internal sealed class QueueItemProducerConfig
    {
        public string Name { get; }
        [JsonIgnore]
        public Func<int, IAsyncEnumerable<QueueItem>> ItemGetter { get; }
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

        private QueueItemProducerConfig(string name, Func<int, IAsyncEnumerable<QueueItem>> itemGetter, HashSet<string> discriminatorsInRetry, Func<QueueItem, Task> sendToRetryQueue, Func<IEnumerable<long>, Task> sendToRestartQueue, int sleepInterval, int batchSize, int lowWatermark, int highWatermark)
        {
            Name = name;
            ItemGetter = itemGetter;
            DiscriminatorsInRetry = discriminatorsInRetry;
            SendToRetryQueue = sendToRetryQueue;
            SendToRestartQueue = sendToRestartQueue;
            SleepInterval = sleepInterval;
            BatchSize = batchSize;
            LowWatermark = lowWatermark;

            Queue = new BlockingCollection<QueueItem>(highWatermark);
        }

        public static async Task<QueueItemProducerConfig> Create(FrameworkWrapper fw, string name, Func<int, IAsyncEnumerable<QueueItem>> itemGetter, HashSet<string> discriminatorsInRetry, Func<QueueItem, Task> sendToRetryQueue, Func<IEnumerable<long>, Task> sendToRestartQueue)
        {
            var sleepInterval = int.Parse((await fw.StartupConfiguration.GetS("QueueProcessor.QueueItemProducer.SleepInterval")).IfNullOrWhitespace("1000"));
            var batchSize = int.Parse((await fw.StartupConfiguration.GetS("QueueProcessor.QueueItemProducer.BatchSize")).IfNullOrWhitespace("20"));
            var lowWatermark = int.Parse((await fw.StartupConfiguration.GetS("QueueProcessor.QueueItemProducer.LowWatermark")).IfNullOrWhitespace("10"));

            var highWatermark = int.Parse((await fw.StartupConfiguration.GetS("QueueProcessor.QueueItemProducer.HighWatermark")).IfNullOrWhitespace("20"));

            return new QueueItemProducerConfig(name, itemGetter, discriminatorsInRetry, sendToRetryQueue, sendToRestartQueue, sleepInterval, batchSize, lowWatermark, highWatermark);
        }
    }
}
