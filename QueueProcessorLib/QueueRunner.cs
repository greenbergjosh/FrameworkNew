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

        public QueueRunner(FrameworkWrapper fw, string name, Func<int, Task<IEnumerable<QueueItem>>> itemGetter, Func<string, QueueItem, Task<bool>> itemProcessor, HashSet<string> discriminatorsInRetry, Func<QueueItem, Task> sendToRetryQueue, Func<IEnumerable<long>, Task> sendToRestartQueue)
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
