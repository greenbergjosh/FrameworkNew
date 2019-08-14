using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;

namespace QueueProcessorLib
{
    public sealed class QueueProcessor
    {
        private FrameworkWrapper _fw;
        private readonly IList<QueueRunner> _runners = new List<QueueRunner>();
        private readonly HashSet<string> _discriminatorsInRetry = new HashSet<string>();

        private int _discriminatorsInRetryRefreshCycleMilliseconds;
        private int _maxRetries;

        private bool _runImmediateQueue;
        private bool _runScheduledQueue;
        private bool _runRestartQueue;
        private bool _runRetryQueue;

        private Guid _queueItemProcessorLbmId;

        public void Config(FrameworkWrapper fw)
        {
            try
            {
                _fw = fw;
                _fw.TraceLogging = fw.StartupConfiguration.GetS("Config/Trace").ParseBool() ?? false;

                _discriminatorsInRetryRefreshCycleMilliseconds = int.Parse(_fw.StartupConfiguration.GetS("Config/QueueProcessor/DiscriminatorsInRetryRefreshCycleMilliseconds").IfNullOrWhitespace("1000"));
                _maxRetries = int.Parse(_fw.StartupConfiguration.GetS("Config/QueueProcessor/MaxRetries").IfNullOrWhitespace("10"));

                _runImmediateQueue = _fw.StartupConfiguration.GetB("Config/QueueProcessor/RunImmediateQueue");
                _runScheduledQueue = _fw.StartupConfiguration.GetB("Config/QueueProcessor/RunScheduledQueue");
                _runRestartQueue = _fw.StartupConfiguration.GetB("Config/QueueProcessor/RunRestartQueue");
                _runRetryQueue = _fw.StartupConfiguration.GetB("Config/QueueProcessor/RunRetryQueue");

                _queueItemProcessorLbmId = Guid.Parse(_fw.StartupConfiguration.GetS("Config/QueueProcessor/QueueItemProcessorLbmId"));
            }
            catch (Exception ex)
            {
                _fw?.Error(nameof(Config), ex.UnwrapForLog());
                throw;
            }
        }

        public void OnStart()
        {
            _ = _fw.Log("QueueProcessor.OnStart", "Starting...");

            _ = Task.Run(async () =>
            {
                if (_runRestartQueue)
                {
                    var restartQueueRunner = new QueueRunner(
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
                    var immediateQueueRunner = new QueueRunner(
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
                    var scheduledQueueRunner = new QueueRunner(
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
                    var retryQueueRunner = new QueueRunner(
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
            _ = _fw.Log("QueueProcessor.OnStop", "Stopping...");

            var tasks = new List<Task>();

            foreach (var runner in _runners)
            {
                tasks.Add(runner.Stop());
            }

            Task.WaitAll(tasks.ToArray());

            _ = _fw.Log("QueueProcessor.OnStop", "Stopped");
        }

        private async Task<IEnumerable<QueueItem>> ListPending(string queue, int batchSize)
        {
            var data = await Data.CallFn("QueueProcessor", $"{queue}ListPending", JsonConvert.SerializeObject(new { batchSize }));

            return data.GetL("").Select(item => new QueueItem(
                long.Parse(item.GetS("id")),
                item.GetS("discriminator"),
                item.GetS("payload"),
                DateTime.Parse(item.GetS("ts"))
            )).ToList();
        }

        private async Task<IEnumerable<QueueItem>> RetryQueueListPending(string queue, int batchSize)
        {
            var data = await Data.CallFn("QueueProcessor", $"{queue}ListPending", JsonConvert.SerializeObject(new { batchSize }));

            return data.GetL("").Select(item => new QueueItem(
                long.Parse(item.GetS("id")),
                item.GetS("discriminator"),
                item.GetS("payload"),
                DateTime.Parse(item.GetS("ts")),
                int.Parse(item.GetS("retry_number"))
            )).ToList();
        }

        private async Task<bool> ProcessItem(string queueName, QueueItem queueItem)
        {
            try
            {
                // The lbm should handle the QueueItem and return true or false to represent success
                var lbm = (await _fw.Entities.GetEntity(_queueItemProcessorLbmId))?.GetS("Config");

                var scope = new { fw = _fw, queueName, queueItem, WriteOutput = GetQueueItemOutputWriter(queueItem) };

                var processedSuccessfully = (bool)await _fw.RoslynWrapper.Evaluate(_queueItemProcessorLbmId, lbm, scope, new StateWrapper());

                // If this was a retry and it succeeded, update the Retry Queue Progress to release
                // the rest of the QueueItems for this Discriminator
                if (processedSuccessfully && queueItem.RetryNumber > -1)
                {
                    await Data.CallFn("QueueProcessor", "RetryQueueProgressRelease", JsonConvert.SerializeObject(new
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

        private Task SendToRestartQueue(IEnumerable<long> queueItemIds) => Data.CallFn("QueueProcessor", "RestartQueueAddBulk", JsonConvert.SerializeObject(queueItemIds));

        private async Task SendToRetryQueue(QueueItem queueItem)
        {
            var retryNumber = queueItem.RetryNumber + 1;
            var retryDate = GetNextRetryDate(retryNumber, DateTime.UtcNow);
            var hasExhaustedRetries = retryNumber >= _maxRetries;

            if (hasExhaustedRetries)
            {
                await _fw.Log("QueueProcessor.SendToRetryQueue", $"Discriminator {queueItem.Discriminator} has exhausted retries and will no longer be processed.  QueueItem.Id: {queueItem.Id}");
            }

            await Data.CallFn("QueueProcessor", "RetryQueueMerge", JsonConvert.SerializeObject(new
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
        /// </summary>
        private DateTime GetNextRetryDate(int retryNumber, DateTime timeFrom) => timeFrom.Add(TimeSpan.FromSeconds(Math.Exp(retryNumber) * 10));

        private Func<object, Task> GetQueueItemOutputWriter(QueueItem queueItem)
        {
            return (output) =>
            {
                return Data.CallFn("QueueProcessor", "QueueItemOutputAdd", JsonConvert.SerializeObject(new
                {
                    QueueItemId = queueItem.Id,
                    Output = output
                }));
            };
        }

        public async Task HandleHttpRequest(HttpContext context)
        {
            context.Response.ContentType = "application/json";
            var statuses = _runners.Select(runner => new
            {
                status = runner.GetStatus()
            });

            await context.Response.WriteAsync(JsonConvert.SerializeObject(statuses));
        }
    }
}
