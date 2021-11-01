using System;
using System.Collections.Concurrent;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Utility;

namespace QueueProcessorLib
{
    internal sealed class QueueItemConsumerConfig
    {
        public string Name { get; }
        public BlockingCollection<QueueItem> Queue { get; }
        [JsonIgnore]
        public Func<string, QueueItem, Task<bool>> QueueItemProcessor { get; }
        [JsonIgnore]
        public Func<QueueItem, Task> SendToRetryQueue { get; }

        public int ItemsInFlightMaxCount { get; }
        public int SleepInterval { get; }
        public int DrainInterval { get; }
        public int DrainSleepInterval { get; }

        private QueueItemConsumerConfig(string name, BlockingCollection<QueueItem> queue, Func<string, QueueItem, Task<bool>> queueItemProcessor, Func<QueueItem, Task> sendToRetryQueue, int itemsInFlightMaxCount, int sleepInterval, int drainInterval, int drainSleepInterval)
        {
            Name = name;
            Queue = queue;
            QueueItemProcessor = queueItemProcessor;
            SendToRetryQueue = sendToRetryQueue;

            ItemsInFlightMaxCount = itemsInFlightMaxCount;
            SleepInterval = sleepInterval;
            DrainInterval = drainInterval;
            DrainSleepInterval = drainSleepInterval;
        }

        public static async Task<QueueItemConsumerConfig> Create(FrameworkWrapper fw, string name, BlockingCollection<QueueItem> queue, Func<string, QueueItem, Task<bool>> queueItemProcessor, Func<QueueItem, Task> sendToRetryQueue)
        {
            var itemsInFlightMaxCount = int.Parse((await fw.StartupConfiguration.GetS("Config.QueueProcessor.QueueItemConsumer.ItemsInFlightMaxCount")).IfNullOrWhitespace("50"));
            var sleepInterval = int.Parse((await fw.StartupConfiguration.GetS("Config.QueueProcessor.QueueItemConsumer.SleepInterval")).IfNullOrWhitespace("1000"));
            var drainInterval = int.Parse((await fw.StartupConfiguration.GetS("Config.QueueProcessor.QueueItemConsumer.DrainInterval")).IfNullOrWhitespace("60000"));
            var drainSleepInterval = int.Parse((await fw.StartupConfiguration.GetS("Config.QueueProcessor.QueueItemConsumer.DrainSleepInterval")).IfNullOrWhitespace("1000"));

            return new QueueItemConsumerConfig(name, queue, queueItemProcessor, sendToRetryQueue, itemsInFlightMaxCount, sleepInterval, drainInterval, drainSleepInterval);
        }
    }
}
