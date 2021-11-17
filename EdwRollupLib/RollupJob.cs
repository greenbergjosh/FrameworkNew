﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Quartz;
using Utility;
using Utility.DataLayer;
using Utility.EDW.Reporting;
using Utility.Entity;

namespace EdwRollupLib
{
    [DisallowConcurrentExecution]
    internal sealed class RollupJob : IJob
    {
        public static FrameworkWrapper FrameworkWrapper { get; set; }

        public Entity ThreadGroup { get; set; }
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
                await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(Execute)}", $"{await ThreadGroup.EvalS("$meta.name")} {Period} aborting due to active exclusive maintenance task");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {await ThreadGroup.EvalS("$meta.name")} {Period} aborting due to active exclusive maintenance task");
#endif
                return;
            }

            _rsId = Guid.NewGuid();
            _rsTs = DateTime.UtcNow;

            var threadGroupId = Guid.Parse(await ThreadGroup.EvalS("$meta.id"));

            var parameters = new Parameters(EdwConfigId, threadGroupId, await ThreadGroup.EvalS("$meta.name"), Period, TriggerFrequency, "LOG", _rsId.ToString());

            try
            {
                await DropReportingSequence();
                await DropStartEvent(parameters, "ThreadGroupProcess", null);
            }
            catch (Exception ex)
            {
                await SendSlackAlert("Execute", parameters, ex);
                return;
            }

            var start = DateTime.Now;

            try
            {
                var startBlock = await PrepareDataflow(context.CancellationToken);

                await startBlock.SendAsync(parameters);

                await _complete.Task;

                var end = DateTime.Now;
                await DropEndEvent(parameters, end - start, "ThreadGroupProcess", null);

                await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(Execute)}", $"{await ThreadGroup.EvalS("$meta.name")} {Period} Complete");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {await ThreadGroup.EvalS("$meta.name")} {Period} Complete");
#endif
            }
            catch (Exception ex)
            {
                await DropErrorEvent(ex, parameters, "ThreadGroupProcess", null, false);

                await FrameworkWrapper.Error($"{nameof(RollupJob)}.{nameof(Execute)}", $"{await ThreadGroup.EvalS("$meta.name")} {Period} Error: {ex}");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {await ThreadGroup.EvalS("$meta.name")} {Period} Error: {ex}");
#endif
            }
        }

        #region Dataflow Tasks
        private async Task<IEnumerable<Parameters>> PrepareThreadGroup(Parameters parameters)
        {
            var prepareThreadGroupResult = await Data.CallFn("edw", "prepareThreadGroup", parameters.PrepareThreadGroup());

            if (await prepareThreadGroupResult.EvalS("status") != "ok")
            {
                var description = await prepareThreadGroupResult.EvalS("description");
                throw new Exception(description);
            }

            var sessionId = await prepareThreadGroupResult.EvalS("session_id");
            var workingSetTableName = await prepareThreadGroupResult.EvalS("working_set_table_name");

            var threadGroupParameters = parameters with { SessionId = sessionId, WorkingSetTableName = workingSetTableName };

            var message = await prepareThreadGroupResult.EvalS("message");
            if (!string.IsNullOrWhiteSpace(message))
            {
                await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(PrepareThreadGroup)}", $"{await ThreadGroup.EvalS("$meta.name")} {Period}: {message}");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {ThreadGroup.EvalS("$meta.name")} {Period}: {message}");
#endif
                return new[] { threadGroupParameters };
            }

            var reportSequences = new List<Parameters>();

            var rsConfigIds = (await prepareThreadGroupResult.EvalL<string>("rs_config_ids")).Select(i => Guid.Parse(i));
            if (!rsConfigIds.Any())
            {
                throw new Exception($"No rs_config_ids, response: {prepareThreadGroupResult}");
            }

            foreach (var rsConfigId in rsConfigIds)
            {
                var rsParameters = threadGroupParameters with { RsConfigId = rsConfigId };
                reportSequences.Add(rsParameters);
            }

            return reportSequences;
        }

        private static async Task<IEnumerable<Parameters>> ProcessReportSequence(Parameters parameters)
        {
            var processRsResult = await Data.CallFn("edw", "processRs", parameters.ProcessRs());

            if (!string.IsNullOrWhiteSpace(await processRsResult.EvalS("message")))
            {
                throw new Exception(await processRsResult.EvalS("message"));
            }

            var rollups = new List<Parameters>();

            var allRollupArgs = (await processRsResult.EvalL("args")).ToList();

            if (allRollupArgs.Any())
            {
                foreach (var rollupArgs in allRollupArgs)
                {
                    var rollupParameters = parameters with { RollupArgs = rollupArgs, RollupName = await rollupArgs.EvalS("rollup_name"), RollupCount = allRollupArgs.Count };
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

                var status = await rollupResult.EvalS("status");
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

            return completeCount == parameters.RollupCount ? (parameters with { RollupArgs = null, RollupName = null }) : null;
        }

        private async Task Cleanup(Parameters parameters)
        {
            if (!string.IsNullOrWhiteSpace(parameters.WorkingSetTableName))
            {
                var cleanupResult = await Data.CallFn("edw", "cleanup", parameters.Cleanup());
                if (await cleanupResult.EvalS("status") != "ok")
                {
                    var error = await cleanupResult.EvalS("error");
                    throw new Exception(error);
                }
            }

            _complete.SetResult();
        }
        #endregion

        private record Parameters(Guid EdwConfigId, Guid ThreadGroupId, string ThreadGroupName, string Period, string TriggerFrequency, string DebugLevel, string SessionId = default, string WorkingSetTableName = default, Guid RsConfigId = default, string RollupName = default, int RollupCount = default, Entity RollupArgs = default)
        {
            public string PrepareThreadGroup() => JsonSerializer.Serialize(new
            {
                edw_config_id = EdwConfigId,
                thread_group_id = ThreadGroupId,
                thread_group_name = ThreadGroupName,
                period = Period,
                debug_level = DebugLevel,
                trigger_frequency = TriggerFrequency,
                session_id = SessionId
            });

            public string ProcessRs() => JsonSerializer.Serialize(new
            {
                thread_group_name = ThreadGroupName,
                period = Period,
                session_id = SessionId,
                working_set_table_name = WorkingSetTableName,
                rs_config_id = RsConfigId,
                trigger_frequency = TriggerFrequency
            });

            public string ProcessRollup() => RollupArgs.ToString();

            public string Cleanup() => JsonSerializer.Serialize(new
            {
                thread_group_name = ThreadGroupName,
                period = Period,
                session_id = SessionId,
                trigger_frequency = TriggerFrequency
            });
        }

        #region Helper Methods
        private async Task DropEvent(object payload)
        {
            var edwBulkEvent = new EdwBulkEvent();

            edwBulkEvent.AddEvent(Guid.NewGuid(), DateTime.UtcNow, new Dictionary<Guid, (Guid rsId, DateTime rsTs)> { [RsConfigId] = (_rsId, _rsTs) }, payload);

#if DEBUG
            Console.WriteLine($"{DateTime.Now}: {await ThreadGroup.EvalS("$meta.name")}_{Period} {JsonSerializer.Serialize(payload)}");
#endif

            await FrameworkWrapper.EdwWriter.Write(edwBulkEvent);
        }

        private async Task DropReportingSequence()
        {
            var edwBulkEvent = new EdwBulkEvent();
            edwBulkEvent.AddReportingSequence(_rsId, _rsTs, new { threadGroup = await ThreadGroup.EvalS("$meta.name"), period = Period }, RsConfigId);

            await FrameworkWrapper.EdwWriter.Write(edwBulkEvent);

            await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(Execute)}", $"{await ThreadGroup.EvalS("$meta.name")} {Period} Start");
#if DEBUG
            Console.WriteLine($"{DateTime.Now}: {ThreadGroup.EvalS("$meta.name")} {Period} Start");
#endif
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
                rollupArgs = input?.RollupArgs.ToString() ?? "null"
            };

            await FrameworkWrapper.Log($"{nameof(RollupJob)}.{step}", JsonSerializer.Serialize(payload));
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
                rollupArgs = input?.RollupArgs.ToString() ?? "null"
            };

            await FrameworkWrapper.Log($"{nameof(RollupJob)}.{step}", JsonSerializer.Serialize(payload));
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
                rollupArgs = input?.RollupArgs.ToString() ?? "null",
                message = ex.ToString()
            };

            await FrameworkWrapper.Error($"{nameof(RollupJob)}.{step}", JsonSerializer.Serialize(payload));
            await DropEvent(payload);

            if (alert)
            {
                await SendSlackAlert(step, input, ex);
            }

            _complete.SetException(ex);
        }

        private async Task<ITargetBlock<Parameters>> PrepareDataflow(CancellationToken cancellationToken)
        {
            var degreesOfParallelism = int.Parse(await FrameworkWrapper.StartupConfiguration.EvalS("Parallelism") ?? "16");

            var options = new ExecutionDataflowBlockOptions { MaxDegreeOfParallelism = degreesOfParallelism, EnsureOrdered = false, BoundedCapacity = -1, CancellationToken = cancellationToken };

            var withEventsMaker = new WithEventsMaker<Parameters>(DropStartEvent, DropEndEvent, DropErrorEvent);

            var prepareThreadGroup = new TransformManyBlock<Parameters, Parameters>(withEventsMaker.WithEvents(PrepareThreadGroup, p => Task.FromResult(p?.RollupName)), options);
            var processReportSequence = new TransformManyBlock<Parameters, Parameters>(withEventsMaker.WithEvents(ProcessReportSequence, p => Task.FromResult(p?.RollupName)), options);
            var processRollup = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(ProcessRollup, p => Task.FromResult(p?.RollupName)), options);
            var waitForAllRollups = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(WaitForAllRollups, p => Task.FromResult(p?.RollupName)), options);
            var cleanup = new ActionBlock<Parameters>(withEventsMaker.WithEvents(Cleanup, p => Task.FromResult(p?.RollupName)), options);

            _ = prepareThreadGroup.LinkTo(cleanup, parameters => parameters.RsConfigId == default);
            _ = prepareThreadGroup.LinkTo(processReportSequence);
            _ = processReportSequence.LinkTo(cleanup, output => output.RollupCount == 0);
            _ = processReportSequence.LinkTo(processRollup);
            _ = processRollup.LinkTo(waitForAllRollups);
            _ = waitForAllRollups.LinkTo(DataflowBlock.NullTarget<Parameters>(), output => output == default);
            _ = waitForAllRollups.LinkTo(cleanup);

            return prepareThreadGroup;
        }

        private static async Task SendSlackAlert(string step, Parameters input, Exception ex)
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

            _ = await ProtocolClient.HttpPostAsync(await FrameworkWrapper.StartupConfiguration.EvalS("SlackAlertUrl"), JsonSerializer.Serialize(new
            {
                text
            }), "application/json");
        }
        #endregion
    }
}
