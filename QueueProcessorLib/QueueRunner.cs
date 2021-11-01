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

        private readonly CancellationTokenSource _cancellationTokenSource = new();

        private readonly string _logMethod;

        private QueueRunner(FrameworkWrapper fw, string name, QueueItemProducerConfig producerConfig, QueueItemConsumerConfig consumerConfig)
        {
            _logMethod = $"{name} QueueRunner";

            _fw = fw;

            _producer = new QueueItemProducer(fw, producerConfig);
            _consumer = new QueueItemConsumer(fw, consumerConfig);

        }

        public static async Task<QueueRunner> Create(FrameworkWrapper fw, string name, Func<int, IAsyncEnumerable<QueueItem>> itemGetter, Func<string, QueueItem, Task<bool>> itemProcessor, HashSet<string> discriminatorsInRetry, Func<QueueItem, Task> sendToRetryQueue, Func<IEnumerable<long>, Task> sendToRestartQueue)
        {
            var producerConfig = await QueueItemProducerConfig.Create(
                fw,
                name,
                itemGetter,
                discriminatorsInRetry,
                sendToRetryQueue,
                sendToRestartQueue
            );

            var consumerConfig = await QueueItemConsumerConfig.Create(
                fw,
                name,
                producerConfig.Queue,
                itemProcessor,
                sendToRetryQueue
            );

            return new QueueRunner(fw, name, producerConfig, consumerConfig);
        }

        public async Task Start()
        {
            await _fw.Log(_logMethod, "Starting...");

            _producerTask = _producer.Start(_cancellationTokenSource.Token);

            _consumerTask = _consumer.Start(_cancellationTokenSource.Token);

            await _fw.Log(_logMethod, "Started.");
        }

        public async Task Stop()
        {
            await _fw.Log(_logMethod, "Stopping...");

            _cancellationTokenSource.Cancel();

            Task.WaitAll(_producerTask, _consumerTask);

            await _fw.Log(_logMethod, "Stopped");
        }

        public object GetStatus() => new
        {
            Producer = new
            {
                _producer.Config,
                _producer.QueueSnapshot
            },
            Consumer = new
            {
                _consumer.Config,
                _consumer.InFlightSnapshot
            }
        };
    }
}
