using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Utility;

namespace QueueProcessorLib
{
    internal sealed class QueueRunner
    {
        private readonly FrameworkWrapper _fw;

        private readonly QueueItemProducer _producer;
        private readonly QueueItemConsumer _consumer;

        private Task _producerTask;
        private Task _consumerTask;

        private readonly CancellationTokenSource _cancellationTokenSource = new CancellationTokenSource();

        private readonly string _logMethod;

        public QueueRunner(FrameworkWrapper fw, string name, Func<Task<IEnumerable<QueueItem>>> itemGetter, Func<QueueItem, Task<bool>> itemProcessor, HashSet<string> discriminatorsInRetry, Func<QueueItem, Task> sendToRetryQueue, Func<IEnumerable<long>, Task> sendToRestartQueue)
        {
            _fw = fw;

            _logMethod = $"{name} QueueRunner";

            var producerConfig = new QueueItemProducerConfig(
                fw,
                name,
                itemGetter,
                discriminatorsInRetry,
                sendToRetryQueue,
                sendToRestartQueue
            );

            _producer = new QueueItemProducer(fw, producerConfig);

            var consumerConfig = new QueueItemConsumerConfig(
                fw,
                name,
                producerConfig.Queue,
                itemProcessor,
                sendToRetryQueue
            );

            _consumer = new QueueItemConsumer(fw, consumerConfig);
        }

        public async Task Start()
        {
            await _fw.Log(_logMethod, "Starting...");

            _producerTask = new Task(async () => await _producer.Start(_cancellationTokenSource.Token), TaskCreationOptions.LongRunning);
            _ = _producerTask.ContinueWith(async (t) => await OnError("Producer", t), TaskContinuationOptions.OnlyOnFaulted);
            _producerTask.Start();

            _consumerTask = new Task(async () => await _consumer.Start(_cancellationTokenSource.Token), TaskCreationOptions.LongRunning);
            _ = _consumerTask.ContinueWith(async (t) => await OnError("Consumer", t), TaskContinuationOptions.OnlyOnFaulted);
            _consumerTask.Start();

            await _fw.Log(_logMethod, "Started.");
        }

        public async Task Stop()
        {
            await _fw.Log(_logMethod, "Stopping...");

            _cancellationTokenSource.Cancel();
        }

        private async Task OnError(string process, Task task) => await _fw.Error(_logMethod, $"Error in {process}: ${task.Exception}");
    }
}
