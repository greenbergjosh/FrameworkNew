﻿using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Utility;

namespace QueueProcessorLib
{
    internal sealed class QueueItemConsumerConfig
    {
        public string Name { get; }
        public BlockingCollection<QueueItem> Queue { get; }
        public Func<QueueItem, Task<bool>> QueueItemProcessor { get; }
        public Func<QueueItem, Task> SendToRetryQueue { get; }

        public int ItemsInFlightMaxCount { get; }
        public int SleepInterval { get; }
        public int DrainInterval { get; }
        public int DrainSleepInterval { get; }

        public QueueItemConsumerConfig(FrameworkWrapper fw, string name, BlockingCollection<QueueItem> queue, Func<QueueItem, Task<bool>> queueItemProcessor, Func<QueueItem, Task> sendToRetryQueue)
        {
            Name = name;
            Queue = queue;
            QueueItemProcessor = queueItemProcessor;
            SendToRetryQueue = sendToRetryQueue;

            ItemsInFlightMaxCount = int.Parse(fw.StartupConfiguration.GetS("Config/QueueConsumerItemsInFlightMaxCount").IfNullOrWhitespace("50"));
            SleepInterval = int.Parse(fw.StartupConfiguration.GetS("Config/QueueItemConsumerSleepInterval").IfNullOrWhitespace("1000"));
            DrainInterval = int.Parse(fw.StartupConfiguration.GetS("Config/QueueItemConsumerDrainInterval").IfNullOrWhitespace("60000"));
            DrainSleepInterval = int.Parse(fw.StartupConfiguration.GetS("Config/QueueItemConsumerDrainSleepInterval").IfNullOrWhitespace("1000"));
        }
    }
}
