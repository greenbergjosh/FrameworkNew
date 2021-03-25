using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Quartz;
using Utility;
using Utility.EDW.Reporting;

namespace EdwRollupLib
{
    [DisallowConcurrentExecution]
    public sealed class MaintenanceJob : IJob
    {
        public const string JobGroup = "MaintenanceJob";
        public const string ExclusiveJobGroup = "ExclusiveMaintenanceJob";

        public static FrameworkWrapper FrameworkWrapper { get; set; }
        public string Name { get; set; }
        public bool Exclusive { get; set; }
        public Guid ImplementationLbmId { get; set; }
        public Guid RsConfigId { get; set; }

        private Guid _rsId;
        private DateTime _rsTs;

        private readonly WithEventsMaker<IJobExecutionContext> _withEventsMaker;

        public MaintenanceJob()
        {
            _withEventsMaker = new WithEventsMaker<IJobExecutionContext>(DropStartEvent, DropEndEvent, DropErrorEvent);
        }

        public async Task Execute(IJobExecutionContext context)
        {
            if (!Exclusive)
            {
                int exclusiveQueueNextId, exclusiveQueueCurrentRunningId;
                lock (context.Scheduler.Context["exclusiveLock"])
                {
                    exclusiveQueueNextId = context.Scheduler.Context.GetInt("exclusiveQueueNextId");
                    exclusiveQueueCurrentRunningId = context.Scheduler.Context.GetInt("exclusiveQueueCurrentlyRunningId");
                }

                if (exclusiveQueueNextId != exclusiveQueueCurrentRunningId)
                {
                    await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(Execute)}", $"{Name} aborting due to active exclusive maintenance task");
#if DEBUG
                    Console.WriteLine($"{DateTime.Now}: {Name} aborting due to active exclusive maintenance task");
#endif
                    return;
                }
            }

            _rsId = Guid.NewGuid();
            _rsTs = DateTime.UtcNow;

            var edwBulkEvent = new EdwBulkEvent();
            edwBulkEvent.AddReportingSequence(_rsId, _rsTs, new { maintenanceJobName = Name }, RsConfigId);
            await FrameworkWrapper.EdwWriter.Write(edwBulkEvent);

            await _withEventsMaker.WithEvents(ProcessMaintenanceJob)(context);
        }

        private async Task ProcessMaintenanceJob(IJobExecutionContext context)
        {
            try
            {
                await FrameworkWrapper.Log($"{nameof(MaintenanceJob)}.{nameof(ProcessMaintenanceJob)}", $"{Name} Start");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {Name} Start");
#endif

                if (Exclusive)
                {
                    await _withEventsMaker.WithEvents(AcquireExclusive)(context);
                }

                await _withEventsMaker.WithEvents(RunImplementation)(context);

                await FrameworkWrapper.Log($"{nameof(MaintenanceJob)}.{nameof(ProcessMaintenanceJob)}", $"{Name} End");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {Name} End");
#endif
            }
            catch (Exception ex)
            {
                await FrameworkWrapper.Error($"{nameof(MaintenanceJob)}.{nameof(ProcessMaintenanceJob)}", $"{Name} Error: {ex}");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {Name} Error: {ex}");
#endif
            }
            finally
            {
                if (Exclusive)
                {
                    await _withEventsMaker.WithEvents(ReleaseExclusive)(context);
                }
            }
        }

        private async Task RunImplementation(IJobExecutionContext context)
        {
            var lbm = await FrameworkWrapper.Entities.GetEntity(ImplementationLbmId);
            if (lbm == null)
            {
                throw new InvalidOperationException($"No LBM with Id: {ImplementationLbmId}");
            }

            if (lbm.GetS("Type") != "LBM.CS")
            {
                throw new InvalidOperationException($"Only entities of type LBM.CS are supported, LBM {ImplementationLbmId} has type {lbm.GetS("Type")}");
            }

            var (debug, debugDir) = FrameworkWrapper.RoslynWrapper.GetDefaultDebugValues();
            var lbmContext = new LbmParameters(context, FrameworkWrapper, new WithEventsMaker<object>(DropStartEvent, DropEndEvent, DropErrorEvent));

            await FrameworkWrapper.RoslynWrapper.Evaluate(ImplementationLbmId.ToString(), lbm.GetS("Config"), lbmContext, null, debug, debugDir);
        }

        private async Task AcquireExclusive(IJobExecutionContext context)
        {
            if (Exclusive)
            {
                int queueId, currentRunningId;
                lock (context.Scheduler.Context["exclusiveLock"])
                {
                    queueId = context.Scheduler.Context.GetInt("exclusiveQueueNextId");
                    context.JobDetail.JobDataMap["queueId"] = queueId;
                    currentRunningId = context.Scheduler.Context.GetInt("exclusiveQueueCurrentlyRunningId");
                    context.Scheduler.Context["exclusiveQueueNextId"] = queueId + 1;
                }

                if (queueId != currentRunningId)
                {
                    var lastCurrentRunningId = -1;

                    while (queueId != currentRunningId)
                    {
                        if (lastCurrentRunningId != currentRunningId)
                        {
                            await FrameworkWrapper.Log($"{nameof(MaintenanceJob)}.{nameof(AcquireExclusive)}", $"{Name} Waiting for other exclusive jobs to finish executing. QueueId: {queueId}, CurrentlyRunningQueueId: {currentRunningId}");
#if DEBUG
                            Console.WriteLine($"{DateTime.Now}: {Name} Waiting for other exclusive jobs to finish executing. QueueId: {queueId}, CurrentlyRunningQueueId: {currentRunningId}");
#endif
                        }
                        lastCurrentRunningId = currentRunningId;

                        await Task.Delay(1000);
                        lock (context.Scheduler.Context["exclusiveLock"])
                        {
                            currentRunningId = context.Scheduler.Context.GetInt("exclusiveQueueCurrentlyRunningId");
                        }
                    }

                    await FrameworkWrapper.Log($"{nameof(MaintenanceJob)}.{nameof(AcquireExclusive)}", $"{Name} Done waiting for other exclusive jobs to finish executing.");
#if DEBUG
                    Console.WriteLine($"{DateTime.Now}: {Name} Done waiting for other exclusive jobs to finish executing.");
#endif
                }

                var currentRunningNonExclusiveJobs = (await context.Scheduler.GetCurrentlyExecutingJobs()).Count(runningContext => runningContext.JobDetail.Key.Group != ExclusiveJobGroup);
                if (currentRunningNonExclusiveJobs > 0)
                {
                    var lastRunningNonExclusiveJobs = -1;
                    while (currentRunningNonExclusiveJobs > 0)
                    {
                        if (lastRunningNonExclusiveJobs != currentRunningNonExclusiveJobs)
                        {
                            await FrameworkWrapper.Log($"{nameof(MaintenanceJob)}.{nameof(AcquireExclusive)}", $"{Name} Waiting for {currentRunningNonExclusiveJobs} other jobs to finish executing.");
#if DEBUG
                            Console.WriteLine($"{DateTime.Now}: {Name} Waiting for {currentRunningNonExclusiveJobs} other jobs to finish executing.");
#endif
                        }
                        lastRunningNonExclusiveJobs = currentRunningNonExclusiveJobs;
                        await Task.Delay(1000);
                        currentRunningNonExclusiveJobs = (await context.Scheduler.GetCurrentlyExecutingJobs()).Count(runningContext => runningContext.JobDetail.Key.Group != ExclusiveJobGroup);
                    }

                    await FrameworkWrapper.Log($"{nameof(MaintenanceJob)}.{nameof(AcquireExclusive)}", $"{Name} Done waiting for other jobs to finish executing.");
#if DEBUG
                    Console.WriteLine($"{DateTime.Now}: {Name} Done waiting for other jobs to finish executing.");
#endif
                }
            }
        }

        private void ReleaseExclusive(IJobExecutionContext context)
        {
            if (Exclusive)
            {
                var queueId = context.JobDetail.JobDataMap.GetInt("queueId");

                lock (context.Scheduler.Context["exclusiveLock"])
                {
                    context.Scheduler.Context["exclusiveQueueCurrentlyRunningId"] = queueId + 1;
                }
            }
        }

        #region Helper Methods
        private Task DropEvent(object payload)
        {
            var edwBulkEvent = new EdwBulkEvent();

            edwBulkEvent.AddEvent(Guid.NewGuid(), DateTime.UtcNow, new Dictionary<Guid, (Guid rsId, DateTime rsTs)> { [RsConfigId] = (_rsId, _rsTs) }, payload);

#if DEBUG
            Console.WriteLine($"{DateTime.Now}: {Name} {JsonConvert.SerializeObject(payload)}");
#endif

            return FrameworkWrapper.EdwWriter.Write(edwBulkEvent);
        }

        private async Task DropStartEvent(IJobExecutionContext context, string step)
        {
            var payload = new
            {
                step,
                eventType = "Start"
            };

            await FrameworkWrapper.Log($"{nameof(MaintenanceJob)}.{step}", JsonConvert.SerializeObject(payload));
            await DropEvent(payload);
        }

        private async Task DropEndEvent(IJobExecutionContext context, TimeSpan elapsed, string step)
        {
            var payload = new
            {
                step,
                eventType = "End",
                elapsed = elapsed.TotalSeconds
            };

            await FrameworkWrapper.Log($"{nameof(MaintenanceJob)}.{step}", JsonConvert.SerializeObject(payload));
            await DropEvent(payload);
        }

        private async Task DropErrorEvent(Exception ex, IJobExecutionContext context, string step, bool alert)
        {
            var payload = new
            {
                step,
                eventType = "Error"
            };

            await FrameworkWrapper.Error($"{nameof(MaintenanceJob)}.{step}", JsonConvert.SerializeObject(payload));
            await DropEvent(payload);

            if (alert)
            {
                var text = $"{Name} - ";

                void AddField(string fieldName, object field)
                {
                    if (field != default)
                    {
                        text += $"{fieldName}: {field} ";
                    }
                }

                AddField("Step", step);
                AddField("Error", ex.Message);

                await ProtocolClient.HttpPostAsync(FrameworkWrapper.StartupConfiguration.GetS("Config/SlackAlertUrl"), JsonConvert.SerializeObject(new
                {
                    text
                }), "application/json");
            }
        }

        private async Task DropStartEvent(object context, string step)
        {
            var payload = new
            {
                step,
                eventType = "Start",
                context
            };

            await FrameworkWrapper.Log($"{nameof(MaintenanceJob)}.{step}", JsonConvert.SerializeObject(payload));
            await DropEvent(payload);
        }

        private async Task DropEndEvent(object context, TimeSpan elapsed, string step)
        {
            var payload = new
            {
                step,
                eventType = "End",
                elapsed = elapsed.TotalSeconds,
                context
            };

            await FrameworkWrapper.Log($"{nameof(MaintenanceJob)}.{step}", JsonConvert.SerializeObject(payload));
            await DropEvent(payload);
        }

        private async Task DropErrorEvent(Exception ex, object context, string step, bool alert)
        {
            var payload = new
            {
                step,
                eventType = "Error",
                context
            };

            await FrameworkWrapper.Log($"{nameof(MaintenanceJob)}.{step}", JsonConvert.SerializeObject(payload));
            await DropEvent(payload);

            if (alert)
            {
                var text = $"{Name} - ";

                void AddField(string fieldName, object field)
                {
                    if (field != default)
                    {
                        text += $"{fieldName}: {field} ";
                    }
                }

                AddField("Step", step);
                AddField("Error", ex.Message);

                await ProtocolClient.HttpPostAsync(FrameworkWrapper.StartupConfiguration.GetS("Config/SlackAlertUrl"), JsonConvert.SerializeObject(new
                {
                    text
                }), "application/json");
            }
        }
        #endregion

        private record LbmParameters(IJobExecutionContext Context, FrameworkWrapper FrameworkWrapper, WithEventsMaker<object> WithEventsMaker);
    }
}
