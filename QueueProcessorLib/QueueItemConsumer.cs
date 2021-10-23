using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Utility;

namespace QueueProcessorLib
{
    internal sealed class QueueItemConsumer
    {
        private readonly FrameworkWrapper _fw;
        private bool _started = false;
        private readonly ConcurrentDictionary<QueueItem, QueueItem> _itemsInFlight = new ConcurrentDictionary<QueueItem, QueueItem>();

        public QueueItemConsumerConfig Config { get; }

        private string LogMethod => $"{Config.Name} QueueItemConsumer";

        public QueueItem[] InFlightSnapshot => _itemsInFlight.Keys.ToArray();

        public QueueItemConsumer(FrameworkWrapper fw, QueueItemConsumerConfig config)
        {
            _fw = fw;
            Config = config;
        }

        public async Task Start(CancellationToken cancellationToken)
        {
            if (_started)
            {
                throw new InvalidOperationException($"{Config.Name} consumer is already started.");
            }
            _started = true;

            try
            {
                await _fw.Log(LogMethod, "Started.");

                while (!cancellationToken.IsCancellationRequested)
                {
                    while (_itemsInFlight.Count >= Config.ItemsInFlightMaxCount && !cancellationToken.IsCancellationRequested)
                    {
                        await Task.Delay(Config.SleepInterval);
                    }

                    if (!cancellationToken.IsCancellationRequested)
                    {
                        var queueItem = Config.Queue.Take(cancellationToken);
                        _itemsInFlight.TryAdd(queueItem, queueItem);

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

            await _fw.Log(LogMethod, $"Waiting up to {Config.DrainInterval / 1000.0} seconds for in-flight request to complete.");
            var waitLimit = DateTime.UtcNow.AddMilliseconds(Config.DrainInterval);
            while (_itemsInFlight.Count > 0)
            {
                await Task.Delay(Config.DrainSleepInterval);
                if (DateTime.UtcNow >= waitLimit)
                {
                    break;
                }
            }

            await _fw.Log(LogMethod, $"Stopped with {_itemsInFlight.Count} items in flight.");
        }

        private async Task Process(QueueItem queueItem)
        {
            try
            {
                var success = await Config.QueueItemProcessor(Config.Name, queueItem);
                if (!success)
                {
                    await Config.SendToRetryQueue(queueItem);
                }
            }
            finally
            {
                _itemsInFlight.TryRemove(queueItem, out var _);
            }
        }
    }
}
