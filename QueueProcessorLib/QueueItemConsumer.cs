using System;
using System.Threading;
using System.Threading.Tasks;
using Utility;

namespace QueueProcessorLib
{
    internal sealed class QueueItemConsumer
    {
        private FrameworkWrapper _fw;
        private bool _started = false;
        private int _itemsInFlightCount;

        private readonly QueueItemConsumerConfig _config;

        private string LogMethod => $"{_config.Name} QueueItemConsumer";

        public QueueItemConsumer(FrameworkWrapper fw, QueueItemConsumerConfig config)
        {
            _fw = fw;
            _config = config;
        }

        public async Task Start(CancellationToken cancellationToken)
        {
            if (_started)
            {
                throw new InvalidOperationException($"{_config.Name} consumer is already started.");
            }
            _started = true;


            try
            {
                await _fw.Log(LogMethod, "Started.");

                while (!cancellationToken.IsCancellationRequested)
                {
                    while (_itemsInFlightCount >= _config.ItemsInFlightMaxCount && !cancellationToken.IsCancellationRequested)
                    {
                        await Task.Delay(_config.SleepInterval);
                    }

                    if (!cancellationToken.IsCancellationRequested)
                    {
                        var queueItem = _config.Queue.Take(cancellationToken);
                        Interlocked.Increment(ref _itemsInFlightCount);

                        _ = Task.Run(async () => await Process(queueItem));
                    }
                }
            }
            catch (OperationCanceledException)
            {
                await _fw.Log(LogMethod, $"Cancellation occurred, consumer halting.");
                _started = false;
            }
            catch (Exception ex)
            {
                await _fw.Error(LogMethod, $"Exception occurred, consumer halting.${Environment.NewLine}${ex}");
                _started = false;
            }

            await _fw.Log(LogMethod, $"Waiting up to {_config.DrainInterval / 1000.0} seconds for in-flight request to complete.");
            var waitLimit = DateTime.Now.AddMilliseconds(_config.DrainInterval);
            while (_itemsInFlightCount > 0)
            {
                await Task.Delay(_config.DrainSleepInterval);
                if (DateTime.Now >= waitLimit)
                {
                    break;
                }
            }

            await _fw.Log(LogMethod, $"Stopped with {_itemsInFlightCount} items in flight.");
        }

        private async Task Process(QueueItem queueItem)
        {
            try
            {
                var success = await _config.QueueItemProcessor(queueItem);
                if (!success)
                {
                    await _config.SendToRetryQueue(queueItem);
                }
            }
            finally
            {
                Interlocked.Decrement(ref _itemsInFlightCount);
            }
        }
    }
}
