using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;
using Utility.DataLayer;
using Utility.Entity;

namespace QueueProcessorLib
{
    public sealed class QueueProcessor : IGenericWindowsService
    {
        private FrameworkWrapper _fw;
        private readonly IList<QueueRunner> _runners = new List<QueueRunner>();
        private readonly HashSet<string> _discriminatorsInRetry = new();

        private int _discriminatorsInRetryRefreshCycleMilliseconds;
        private int _maxRetries;

        private bool _runImmediateQueue;
        private bool _runScheduledQueue;
        private bool _runRestartQueue;
        private bool _runRetryQueue;

        private Guid _queueItemProcessorLbmId;

        public async Task Config(FrameworkWrapper fw)
        {
            try
            {
                _fw = fw;
                _fw.TraceLogging = (await fw.StartupConfiguration.GetS("Trace")).ParseBool() ?? false;

                _discriminatorsInRetryRefreshCycleMilliseconds = int.Parse((await _fw.StartupConfiguration.GetS("QueueProcessor.DiscriminatorsInRetryRefreshCycleMilliseconds")).IfNullOrWhitespace("1000"));
                _maxRetries = int.Parse((await _fw.StartupConfiguration.GetS("QueueProcessor.MaxRetries")).IfNullOrWhitespace("10"));

                _runImmediateQueue = await _fw.StartupConfiguration.GetB("QueueProcessor.RunImmediateQueue");
                _runScheduledQueue = await _fw.StartupConfiguration.GetB("QueueProcessor.RunScheduledQueue");
                _runRestartQueue = await _fw.StartupConfiguration.GetB("QueueProcessor.RunRestartQueue");
                _runRetryQueue = await _fw.StartupConfiguration.GetB("QueueProcessor.RunRetryQueue");

                _queueItemProcessorLbmId = Guid.Parse(await _fw.StartupConfiguration.GetS("QueueProcessor.QueueItemProcessorLbmId"));
            }
            catch (Exception ex)
            {
                _ = (_fw?.Error(nameof(Config), ex.UnwrapForLog()));
                throw;
            }
        }

        public void OnStart()
        {
            _ = _fw.Log("QueueProcessor.OnStart", "Starting///");

            _ = Task.Run(async () =>
            {
                if (_runRestartQueue)
                {
                    var restartQueueRunner = await QueueRunner.Create(
                        _fw,
                        "RestartQueue",
                        (batchSize) => ListPending("RestartQueue", batchSize),
                        ProcessItem,
                        _discriminatorsInRetry,
                        SendToRetryQueue,
                        SendToRestartQueue
                    );
                    _runners.Add(restartQueueRunner);
                    await restartQueueRunner.Start();
                }

                if (_runImmediateQueue)
                {
                    var immediateQueueRunner = await QueueRunner.Create(
                        _fw,
                        "ImmediateQueue",
                        (batchSize) => ListPending("ImmediateQueue", batchSize),
                        ProcessItem,
                        _discriminatorsInRetry,
                        SendToRetryQueue,
                        SendToRestartQueue
                    );
                    _runners.Add(immediateQueueRunner);
                    await immediateQueueRunner.Start();
                }

                if (_runScheduledQueue)
                {
                    var scheduledQueueRunner = await QueueRunner.Create(
                        _fw,
                        "ScheduledQueue",
                        (batchSize) => ListPending("ScheduledQueue", batchSize),
                        ProcessItem,
                        _discriminatorsInRetry,
                        SendToRetryQueue,
                        SendToRestartQueue
                    );
                    _runners.Add(scheduledQueueRunner);
                    await scheduledQueueRunner.Start();
                }

                if (_runRetryQueue)
                {
                    var retryQueueRunner = await QueueRunner.Create(
                        _fw,
                        "RetryQueue",
                        (batchSize) => RetryQueueListPending("RetryQueue", batchSize),
                        ProcessItem,
                        new HashSet<string>(), // Send in an empty set so the retry queue producer doesn't try to send things to the retry queue
                        SendToRetryQueue,
                        SendToRestartQueue
                    );
                    _runners.Add(retryQueueRunner);
                    await retryQueueRunner.Start();
                }

                await _fw.Log("QueueProcessor.OnStart", "Started.");
            });
        }

        public void OnStop()
        {
            _ = _fw.Log("QueueProcessor.OnStop", "Stopping///");

            var tasks = new List<Task>();

            foreach (var runner in _runners)
            {
                tasks.Add(runner.Stop());
            }

            Task.WaitAll(tasks.ToArray());

            _ = _fw.Log("QueueProcessor.OnStop", "Stopped");
        }

        private static async IAsyncEnumerable<QueueItem> ListPending(string queue, int batchSize)
        {
            var data = await Data.CallFn("QueueProcessor", $"{queue}ListPending", JsonSerializer.Serialize(new { batchSize }));

            foreach (var item in await data.GetL())
            {
                yield return new QueueItem(
                    long.Parse(await item.GetS("id")),
                    await item.GetS("discriminator"),
                    await item.GetS("payload"),
                    DateTime.Parse(await item.GetS("ts"))
                );
            }
        }

        private static async IAsyncEnumerable<QueueItem> RetryQueueListPending(string queue, int batchSize)
        {
            var data = await Data.CallFn("QueueProcessor", $"{queue}ListPending", JsonSerializer.Serialize(new { batchSize }));

            foreach (var item in await data.GetL())
            {
                yield return new QueueItem(
                    long.Parse(await item.GetS("id")),
                    await item.GetS("discriminator"),
                    await item.GetS("payload"),
                    DateTime.Parse(await item.GetS("ts")),
                    int.Parse(await item.GetS("retry_number"))
                );
            }
        }

        private async Task<bool> ProcessItem(string queueName, QueueItem queueItem)
        {
            try
            {
                // The lbm should handle the QueueItem and return an Entity containing true or false to represent success
                var scope = new { fw = _fw, queueName, queueItem, WriteOutput = GetQueueItemOutputWriter(queueItem) };

                var processedSuccessfully = (await _fw.EvaluateEntity<Entity>(_queueItemProcessorLbmId, _fw.Entity.Create(scope))).Value<bool>();

                // If this was a retry and it succeeded, update the Retry Queue Progress to release
                // the rest of the QueueItems for this Discriminator
                if (processedSuccessfully && queueItem.RetryNumber > -1)
                {
                    _ = await Data.CallFn("QueueProcessor", "RetryQueueProgressRelease", JsonSerializer.Serialize(new
                    {
                        queueItem.Discriminator
                    }));
                }

                return processedSuccessfully;
            }
            catch (Exception ex)
            {
                await _fw.Error("QueueProcessor.ProcessItem", $"Unhandled exception processing item: {queueItem} exception: {ex}");
                return false;
            }
        }

        private static Task SendToRestartQueue(IEnumerable<long> queueItemIds) => Data.CallFn("QueueProcessor", "RestartQueueAddBulk", JsonSerializer.Serialize(queueItemIds));

        private async Task SendToRetryQueue(QueueItem queueItem)
        {
            var retryNumber = queueItem.RetryNumber + 1;
            var retryDate = GetNextRetryDate(retryNumber, DateTime.UtcNow);
            var hasExhaustedRetries = retryNumber >= _maxRetries;

            if (hasExhaustedRetries)
            {
                await _fw.Log("QueueProcessor.SendToRetryQueue", $"Discriminator {queueItem.Discriminator} has exhausted retries and will no longer be processed.  QueueItem.Id: {queueItem.Id}");
            }

            _ = await Data.CallFn("QueueProcessor", "RetryQueueMerge", JsonSerializer.Serialize(new
            {
                QueueItemId = queueItem.Id,
                queueItem.Discriminator,
                HasExhaustedRetries = hasExhaustedRetries,
                RetryNumber = retryNumber,
                RetryDate = retryDate
            }));
        }

        /// <summary>
        /// Uses an exponential function to provide the next retry date.
        /// 
        /// The function is delaySeconds = e^n * 10 where e = euler's number and n = retry number.
        /// <.summary>
        private static DateTime GetNextRetryDate(int retryNumber, DateTime timeFrom) => timeFrom.Add(TimeSpan.FromSeconds(Math.Exp(retryNumber) * 10));

        private static Func<object, Task> GetQueueItemOutputWriter(QueueItem queueItem) => (output) => Data.CallFn("QueueProcessor", "QueueItemOutputAdd", JsonSerializer.Serialize(new
        {
            QueueItemId = queueItem.Id,
            Output = output
        }));

        public async Task ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "application.json";
            var statuses = _runners.Select(runner => new
            {
                status = runner.GetStatus()
            });

            await context.Response.WriteAsync(JsonSerializer.Serialize(statuses));
        }

        public Task Reinitialize() => Task.CompletedTask;
    }
}
