using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Utility;

namespace QueueProcessorLib
{
    internal sealed class QueueItemProducer
    {
        private FrameworkWrapper _fw;
        private bool _started = false;

        private readonly QueueItemProducerConfig _config;

        private string LogMethod => $"{_config.Name} QueueItemProducer";

        public QueueItemProducer(FrameworkWrapper fw, QueueItemProducerConfig config)
        {
            _fw = fw;
            _config = config;
        }

        public async Task Start(CancellationToken cancellationToken)
        {
            if (_started)
            {
                throw new InvalidOperationException($"{_config.Name} producer is already started.");
            }
            _started = true;

            IEnumerable<QueueItem> batch = null;

            try
            {
                await _fw.Log(LogMethod, "Started.");

                while (!cancellationToken.IsCancellationRequested)
                {
                    batch = await _config.ItemGetter();//)?.Select(item => new QueueItem((long)item["id"], (string)item["discriminator"], (string)item["payload"], (DateTime)item["createDate"]));

                    var shouldSleep = false;

                    if (batch != null && batch.Any())
                    {
                        foreach (var queueItem in batch)
                        {
                            if (_config.DiscriminatorsInRetry.Contains(queueItem.Discriminator))
                            {
                                await _config.SendToRetryQueue(queueItem);
                            }
                            else
                            {
                                _config.Queue.Add(queueItem, cancellationToken);
                            }
                        }

                        // Sleep if the batch wasn't a full batch or we're above our low watermark
                        shouldSleep = batch.Count() < _config.BatchSize || _config.Queue.Count >= _config.LowWatermark;
                    }
                    else
                    {
                        shouldSleep = true;
                    }

                    if (shouldSleep && !cancellationToken.IsCancellationRequested)
                    {
                        await _fw.Trace(LogMethod, $"Sleeping for {_config.SleepInterval}ms");
                        await Task.Delay(_config.SleepInterval);
                    }
                }
            }
            catch (OperationCanceledException)
            {
                await _fw.Log(LogMethod, $"Cancellation occurred, producer halting.");
                _started = false;
            }
            catch (Exception ex)
            {
                await _fw.Error(LogMethod, $"Exception occurred, producer halting.${Environment.NewLine}${ex}");
                _started = false;
            }

            await SaveItemsForRestart(batch);

            await _fw.Log(LogMethod, "Stopped.");
        }

        private async Task SaveItemsForRestart(IEnumerable<QueueItem> batch)
        {
            var queueItemIds = new List<long>();

            // Gather items left in the queue
            while (_config.Queue.TryTake(out var queueItem))
            {
                queueItemIds.Add(queueItem.Id);
            }

            // Gather items let in the current batch
            if (batch != null)
            {
                foreach (var queueItem in batch)
                {
                    queueItemIds.Add(queueItem.Id);
                }
            }

            await _fw.Log(LogMethod, $"Saving {queueItemIds.Count} unprocessed items");
            await _config.SendToRestartQueue(queueItemIds);
        }
    }
}
