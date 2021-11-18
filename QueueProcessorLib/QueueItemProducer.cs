using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Utility;

namespace QueueProcessorLib
{
    internal sealed class QueueItemProducer
    {
        private readonly FrameworkWrapper _fw;
        private bool _started = false;

        public QueueItemProducerConfig Config { get; }

        private string LogMethod => $"{Config.Name} QueueItemProducer";

        public QueueItem[] QueueSnapshot => Config.Queue.ToArray();

        public QueueItemProducer(FrameworkWrapper fw, QueueItemProducerConfig config)
        {
            _fw = fw;
            Config = config;
        }

        public async Task Start(CancellationToken cancellationToken)
        {
            if (_started)
            {
                throw new InvalidOperationException($"{Config.Name} producer is already started.");
            }

            _started = true;

            IEnumerable<QueueItem> batch = null;

            try
            {
                await _fw.Log(LogMethod, "Started.");

                while (!cancellationToken.IsCancellationRequested)
                {
                    var batchCount = 0;

                    await foreach (var queueItem in Config.ItemGetter(Config.BatchSize))
                    {
                        if (Config.DiscriminatorsInRetry.Contains(queueItem.Discriminator))
                        {
                            await Config.SendToRetryQueue(queueItem);
                        }
                        else
                        {
                            Config.Queue.Add(queueItem, cancellationToken);
                        }

                        batchCount++;
                    }

                    // Sleep if the batch wasn't a full batch or we're above our low watermark
                    var shouldSleep = batchCount < Config.BatchSize || Config.Queue.Count >= Config.LowWatermark;

                    if (shouldSleep && !cancellationToken.IsCancellationRequested)
                    {
                        //await _fw.Trace(LogMethod, $"Sleeping for {Config.SleepInterval}ms");
                        await Task.Delay(Config.SleepInterval, cancellationToken);
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
                await _fw.Error(LogMethod, $"Exception occurred, producer halting.{Environment.NewLine}Last Batch:{(batch != null ? JsonSerializer.Serialize(batch.Select(qi => (qi.Id, qi.Discriminator))) : "None")}{Environment.NewLine}Exception: {ex}");
                _started = false;
            }

            await SaveItemsForRestart(batch);

            await _fw.Log(LogMethod, "Stopped.");
        }

        private async Task SaveItemsForRestart(IEnumerable<QueueItem> batch)
        {
            var queueItemIds = new List<long>();

            // Gather items left in the queue
            while (Config.Queue.TryTake(out var queueItem))
            {
                queueItemIds.Add(queueItem.Id);
            }

            // Gather items left in the current batch
            if (batch != null)
            {
                foreach (var queueItem in batch)
                {
                    queueItemIds.Add(queueItem.Id);
                }
            }

            if (queueItemIds.Count > 0)
            {
                await _fw.Log(LogMethod, $"Saving {queueItemIds.Count} unprocessed items");
                await Config.SendToRestartQueue(queueItemIds);
                await _fw.Log(LogMethod, $"Saved {queueItemIds.Count} unprocessed items");
            }
        }
    }
}
