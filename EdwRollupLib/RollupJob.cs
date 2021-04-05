using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Quartz;
using Utility;
using Utility.DataLayer;
using Utility.EDW.Reporting;
using Utility.GenericEntity;

namespace EdwRollupLib
{
    [DisallowConcurrentExecution]
    internal sealed class RollupJob : IJob
    {
        public static FrameworkWrapper FrameworkWrapper { get; set; }

        public IGenericEntity ThreadGroup { get; set; }
        public string Period { get; set; }
        public string TriggerFrequency { get; set; }
        public Guid EdwConfigId { get; set; }
        public Guid RsConfigId { get; set; }

        private Guid _rsId;
        private DateTime _rsTs;

        private readonly TaskCompletionSource _complete = new();

        public async Task Execute(IJobExecutionContext context)
        {
            int exclusiveQueueNextId, exclusiveQueueCurrentRunningId;
            lock (context.Scheduler.Context["exclusiveLock"])
            {
                exclusiveQueueNextId = context.Scheduler.Context.GetInt("exclusiveQueueNextId");
                exclusiveQueueCurrentRunningId = context.Scheduler.Context.GetInt("exclusiveQueueCurrentlyRunningId");
            }

            if (exclusiveQueueNextId != exclusiveQueueCurrentRunningId)
            {
                await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(Execute)}", $"{ThreadGroup.GetS("Name")} {Period} aborting due to active exclusive maintenance task");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {ThreadGroup.GetS("Name")} {Period} aborting due to active exclusive maintenance task");
#endif
                return;
            }

            _rsId = Guid.NewGuid();
            _rsTs = DateTime.UtcNow;

            var edwBulkEvent = new EdwBulkEvent();
            edwBulkEvent.AddReportingSequence(_rsId, _rsTs, new { threadGroup = ThreadGroup.GetS("Name"), period = Period }, RsConfigId);
            await FrameworkWrapper.EdwWriter.Write(edwBulkEvent);

            await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(Execute)}", $"{ThreadGroup.GetS("Name")} {Period} Start");
#if DEBUG
            Console.WriteLine($"{DateTime.Now}: {ThreadGroup.GetS("Name")} {Period} Start");
#endif

            var threadGroupId = Guid.Parse(ThreadGroup.GetS("Id"));

            var parameters = new Parameters(EdwConfigId, threadGroupId, ThreadGroup.GetS("Name"), Period, TriggerFrequency, "LOG", _rsId.ToString());

            await DropStartEvent(parameters, "ThreadGroupProcess", null);

            var start = DateTime.Now;

            try
            {
                var startBlock = PrepareDataflow(context.CancellationToken);

                await startBlock.SendAsync(parameters);

                await _complete.Task;

                var end = DateTime.Now;
                await DropEndEvent(parameters, end - start, "ThreadGroupProcess", null);

                await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(Execute)}", $"{ThreadGroup.GetS("Name")} {Period} Complete");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {ThreadGroup.GetS("Name")} {Period} Complete");
#endif
            }
            catch (Exception ex)
            {
                await DropErrorEvent(ex, parameters, "ThreadGroupProcess", null, false);

                await FrameworkWrapper.Error($"{nameof(RollupJob)}.{nameof(Execute)}", $"{ThreadGroup.GetS("Name")} {Period} Error: {ex}");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {ThreadGroup.GetS("Name")} {Period} Error: {ex}");
#endif
            }
        }

        #region Dataflow Tasks
        private async Task<IEnumerable<Parameters>> PrepareThreadGroup(Parameters parameters)
        {
            var prepareThreadGroupResult = await Data.CallFn("edw", "prepareThreadGroup", parameters.PrepareThreadGroup());

            if (prepareThreadGroupResult.GetS("status") != "ok")
            {
                var description = prepareThreadGroupResult.GetS("description");
                throw new Exception(description);
            }

            var sessionId = prepareThreadGroupResult.GetS("session_id");
            var workingSetTableName = prepareThreadGroupResult.GetS("working_set_table_name");

            var threadGroupParameters = parameters with { SessionId = sessionId, WorkingSetTableName = workingSetTableName };

            var message = prepareThreadGroupResult.GetS("message");
            if (!string.IsNullOrWhiteSpace(message))
            {
                await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(PrepareThreadGroup)}", $"{ThreadGroup.GetS("Name")} {Period}: {message}");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {ThreadGroup.GetS("Name")} {Period}: {message}");
#endif
                return new[] { threadGroupParameters };
            }

            var reportSequences = new List<Parameters>();

            var rsConfigIds = prepareThreadGroupResult.GetL("rs_config_ids").Select(i => Guid.Parse(i.GetS("")));
            if (!rsConfigIds.Any())
            {
                throw new Exception($"No rs_config_ids, response: {prepareThreadGroupResult.GetS("")}");
            }

            foreach (var rsConfigId in rsConfigIds)
            {
                var rsParameters = threadGroupParameters with { RsConfigId = rsConfigId };
                reportSequences.Add(rsParameters);
            }

            return reportSequences;
        }

        private async Task<IEnumerable<Parameters>> ProcessReportSequence(Parameters parameters)
        {
            var processRsResult = await Data.CallFn("edw", "processRs", parameters.ProcessRs());

            if (!string.IsNullOrWhiteSpace(processRsResult.GetS("message")))
            {
                throw new Exception(processRsResult.GetS("message"));
            }

            var rollups = new List<Parameters>();

            var allRollupArgs = processRsResult.GetL("args").ToList();

            if (allRollupArgs.Any())
            {
                foreach (var rollupArgs in allRollupArgs)
                {
                    var rollupParameters = parameters with { RollupArgs = rollupArgs, RollupName = rollupArgs.GetS("rollup_name"), RollupCount = allRollupArgs.Count };
                    rollups.Add(rollupParameters);
                }
            }
            else
            {
                rollups.Add(parameters with { RollupCount = 0 });
            }

            return rollups;
        }

        private async Task<Parameters> ProcessRollup(Parameters parameters)
        {
            while (true)
            {
                var rollupResult = await Data.CallFn("edw", "processRollup", parameters.ProcessRollup());

                var status = rollupResult.GetS("status");
                if (status == "deadlock detected")
                {
                    continue;
                }
                else if (status != "ok")
                {
                    throw new Exception(status);
                }

                return parameters;
            }
        }

        private int _completeRollupCount = 0;

        private Parameters WaitForAllRollups(Parameters parameters)
        {
            var completeCount = Interlocked.Increment(ref _completeRollupCount);

            if (completeCount == parameters.RollupCount)
            {
                return parameters with { RollupArgs = null, RollupName = null };
            }
            else
            {
                return null;
            }
        }

        private async Task Cleanup(Parameters parameters)
        {
            if (!string.IsNullOrWhiteSpace(parameters.WorkingSetTableName))
            {
                var cleanupResult = await Data.CallFn("edw", "cleanup", parameters.Cleanup());
                if (cleanupResult.GetS("status") != "ok")
                {
                    var error = cleanupResult.GetS("error");
                    throw new Exception(error);
                }
            }

            _complete.SetResult();
        }
        #endregion

        private record Parameters(Guid EdwConfigId, Guid ThreadGroupId, string ThreadGroupName, string Period, string TriggerFrequency, string DebugLevel, string SessionId = default, string WorkingSetTableName = default, Guid RsConfigId = default, string RollupName = default, int RollupCount = default, IGenericEntity RollupArgs = default)
        {
            public string PrepareThreadGroup() => JsonConvert.SerializeObject(new
            {
                edw_config_id = EdwConfigId,
                thread_group_id = ThreadGroupId,
                thread_group_name = ThreadGroupName,
                period = Period,
                debug_level = DebugLevel,
                trigger_frequency = TriggerFrequency,
                session_id = SessionId
            });

            public string ProcessRs() => JsonConvert.SerializeObject(new
            {
                thread_group_name = ThreadGroupName,
                period = Period,
                session_id = SessionId,
                working_set_table_name = WorkingSetTableName,
                rs_config_id = RsConfigId,
                trigger_frequency = TriggerFrequency
            });

            public string ProcessRollup() => RollupArgs.GetS("");

            public string Cleanup() => JsonConvert.SerializeObject(new
            {
                thread_group_name = ThreadGroupName,
                period = Period,
                session_id = SessionId,
                trigger_frequency = TriggerFrequency
            });
        }

        #region Helper Methods
        private Task DropEvent(object payload)
        {
            var edwBulkEvent = new EdwBulkEvent();

            edwBulkEvent.AddEvent(Guid.NewGuid(), DateTime.UtcNow, new Dictionary<Guid, (Guid rsId, DateTime rsTs)> { [RsConfigId] = (_rsId, _rsTs) }, payload);

#if DEBUG
            Console.WriteLine($"{DateTime.Now}: {ThreadGroup.GetS("Name")}_{Period} {JsonConvert.SerializeObject(payload)}");
#endif

            return FrameworkWrapper.EdwWriter.Write(edwBulkEvent);
        }

        private async Task DropStartEvent(Parameters input, string step, string stepContext)
        {
            var payload = new
            {
                step,
                stepContext,
                eventType = "Start",
                sessionId = input?.SessionId,
                workingSetTableName = input?.WorkingSetTableName,
                rsConfigId = input?.RsConfigId,
                rollupName = input?.RollupName,
                rollupArgs = JToken.Parse(input?.RollupArgs?.GetS("") ?? "null")
            };

            await FrameworkWrapper.Log($"{nameof(RollupJob)}.{step}", JsonConvert.SerializeObject(payload));
            await DropEvent(payload);
        }

        private async Task DropEndEvent(Parameters input, TimeSpan elapsed, string step, string stepContext)
        {
            var payload = new
            {
                step,
                stepContext,
                eventType = "End",
                elapsed = elapsed.TotalSeconds,
                sessionId = input?.SessionId,
                workingSetTableName = input?.WorkingSetTableName,
                rsConfigId = input?.RsConfigId,
                rollupName = input?.RollupName,
                rollupArgs = JToken.Parse(input?.RollupArgs?.GetS("") ?? "null")
            };

            await FrameworkWrapper.Log($"{nameof(RollupJob)}.{step}", JsonConvert.SerializeObject(payload));
            await DropEvent(payload);
        }

        private async Task DropErrorEvent(Exception ex, Parameters input, string step, string stepContext, bool alert)
        {
            var payload = new
            {
                step,
                stepContext,
                eventType = "Error",
                sessionId = input?.SessionId,
                workingSetTableName = input?.WorkingSetTableName,
                rsConfigId = input?.RsConfigId,
                rollupName = input?.RollupName,
                rollupArgs = JToken.Parse(input?.RollupArgs?.GetS("") ?? "null"),
                message = ex.ToString()
            };

            await FrameworkWrapper.Error($"{nameof(RollupJob)}.{step}", JsonConvert.SerializeObject(payload));
            await DropEvent(payload);

            if (alert)
            {
                var text = $"{input?.ThreadGroupName} {input?.Period} - ";

                void AddField(string fieldName, object field)
                {
                    if (field != default)
                    {
                        text += $"{fieldName}: {field} ";
                    }
                }

                AddField("Step", step);
                AddField("SessionId", input?.SessionId);
                AddField("RsConfigId", input?.RsConfigId);
                AddField("RollupName", input?.RollupName);
                AddField("Error", ex.Message);

                await ProtocolClient.HttpPostAsync(FrameworkWrapper.StartupConfiguration.GetS("Config/SlackAlertUrl"), JsonConvert.SerializeObject(new
                {
                    text
                }), "application/json");
            }

            _complete.SetException(ex);
        }

        private ITargetBlock<Parameters> PrepareDataflow(CancellationToken cancellationToken)
        {
            var degreesOfParallelism = int.Parse(FrameworkWrapper.StartupConfiguration.GetS("Config/Parallelism") ?? "16");

            var options = new ExecutionDataflowBlockOptions { MaxDegreeOfParallelism = degreesOfParallelism, EnsureOrdered = false, BoundedCapacity = -1, CancellationToken = cancellationToken };

            var withEventsMaker = new WithEventsMaker<Parameters>(DropStartEvent, DropEndEvent, DropErrorEvent);

            var prepareThreadGroup = new TransformManyBlock<Parameters, Parameters>(withEventsMaker.WithEvents(PrepareThreadGroup, p => p?.RollupName), options);
            var processReportSequence = new TransformManyBlock<Parameters, Parameters>(withEventsMaker.WithEvents(ProcessReportSequence, p => p?.RollupName), options);
            var processRollup = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(ProcessRollup, p => p?.RollupName), options);
            var waitForAllRollups = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(WaitForAllRollups, p => p?.RollupName), options);
            var cleanup = new ActionBlock<Parameters>(withEventsMaker.WithEvents(Cleanup, p => p?.RollupName), options);

            prepareThreadGroup.LinkTo(cleanup, parameters => parameters.RsConfigId == default);
            prepareThreadGroup.LinkTo(processReportSequence);
            processReportSequence.LinkTo(cleanup, output => output.RollupCount == 0);
            processReportSequence.LinkTo(processRollup);
            processRollup.LinkTo(waitForAllRollups);
            waitForAllRollups.LinkTo(DataflowBlock.NullTarget<Parameters>(), output => output == default);
            waitForAllRollups.LinkTo(cleanup);

            return prepareThreadGroup;
        }
        #endregion
    }
}
