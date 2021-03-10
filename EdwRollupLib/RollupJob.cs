using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Newtonsoft.Json;
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
        public Guid EdwConfigId { get; set; }
        public Guid RsConfigId { get; set; }

        private Guid _rsId;
        private DateTime _rsTs;

        public async Task Execute(IJobExecutionContext context)
        {
            _rsId = Guid.NewGuid();
            _rsTs = DateTime.UtcNow;

            var edwBulkEvent = new EdwBulkEvent();
            edwBulkEvent.AddReportingSequence(_rsId, _rsTs, new { threadGroup = ThreadGroup.GetS("Name"), period = Period }, RsConfigId);
            await FrameworkWrapper.EdwWriter.Write(edwBulkEvent);

            await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(Execute)}", $"{ThreadGroup.GetS("Name")} {Period} Start");
#if DEBUG
            Console.WriteLine($"{DateTime.Now}: {ThreadGroup.GetS("Name")} {Period} Start");
#endif

            await DropStartEvent(null, "ThreadGroupProcess");
            var start = DateTime.Now;

            try
            {
                var threadGroupId = Guid.Parse(ThreadGroup.GetS("Id"));

                var parameters = new Parameters(EdwConfigId, threadGroupId, ThreadGroup.GetS("Name"), Period, "LOG");

                var degreesOfParallelism = int.Parse(FrameworkWrapper.StartupConfiguration.GetS("Config/Parallelism")??"16");

                var options = new ExecutionDataflowBlockOptions { MaxDegreeOfParallelism = degreesOfParallelism, EnsureOrdered = false, BoundedCapacity = -1, CancellationToken = context.CancellationToken };

                var prepareThreadGroup = new TransformManyBlock<Parameters, Parameters>(WithEvents(PrepareThreadGroup), options);
                var processReportSequence = new TransformManyBlock<Parameters, Parameters>(WithEvents(ProcessReportSequence), options);
                var processRollup = new TransformBlock<Parameters, Parameters>(WithEvents(ProcessRollup), options);
                var waitForAllRollups = new TransformBlock<Parameters, Parameters>(WithEvents(WaitForAllRollups), options);
                var cleanup = new ActionBlock<Parameters>(WithEvents(Cleanup), options);

                var linkOptions = new DataflowLinkOptions { PropagateCompletion = true };

                prepareThreadGroup.LinkTo(processReportSequence, linkOptions);
                processReportSequence.LinkTo(cleanup, output => output.RollupCount == 0);
                processReportSequence.LinkTo(processRollup, linkOptions);
                processRollup.LinkTo(waitForAllRollups, linkOptions);
                waitForAllRollups.LinkTo(DataflowBlock.NullTarget<Parameters>(), linkOptions, output => output == default);
                waitForAllRollups.LinkTo(cleanup, linkOptions);

                await prepareThreadGroup.SendAsync(parameters);

                prepareThreadGroup.Complete();

                await cleanup.Completion;

                var end = DateTime.Now;
                await DropEndEvent(null, end - start, "ThreadGroupProcess");

                await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(Execute)}", $"{ThreadGroup.GetS("Name")} {Period} Complete");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {ThreadGroup.GetS("Name")} {Period} Complete");
#endif
            }
            catch (Exception ex)
            {
                await DropErrorEvent(ex, null, "ThreadGroupProcess", alert: false);

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

            var message = prepareThreadGroupResult.GetS("message");
            if (!string.IsNullOrWhiteSpace(message))
            {
                await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(PrepareThreadGroup)}", $"{ThreadGroup.GetS("Name")} {Period}: {message}");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {ThreadGroup.GetS("Name")} {Period}: {message}");
#endif
                return Enumerable.Empty<Parameters>();
            }

            var sessionId = prepareThreadGroupResult.GetS("session_id");
            var workingSetTableName = prepareThreadGroupResult.GetS("working_set_table_name");

            var threadGroupParameters = parameters with { SessionId = sessionId, WorkingSetTableName = workingSetTableName };

            var reportSequences = new List<Parameters>();

            foreach (var rsConfigId in prepareThreadGroupResult.GetL("rs_config_ids").Select(i => Guid.Parse(i.GetS(""))))
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
            var rollupResult = await Data.CallFn("edw", "processRollup", parameters.ProcessRollup());

            var status = rollupResult.GetS("status");
            if (status != "ok")
            {
                throw new Exception(status);
            }

            return parameters;
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
            var cleanupResult = await Data.CallFn("edw", "cleanup", parameters.Cleanup());
            if (cleanupResult.GetS("status") != "ok")
            {
                var error = cleanupResult.GetS("error");
                throw new Exception(error);
            }
        }
        #endregion

        private record Parameters(Guid EdwConfigId, Guid ThreadGroupId, string ThreadGroupName, string Period, string DebugLevel, string SessionId = default, string WorkingSetTableName = default, Guid RsConfigId = default, string RollupName = default, int RollupCount = default, IGenericEntity RollupArgs = default)
        {
            public string PrepareThreadGroup() => JsonConvert.SerializeObject(new
            {
                edw_config_id = EdwConfigId,
                thread_group_id = ThreadGroupId,
                thread_group_name = ThreadGroupName,
                period = Period,
                debug_level = DebugLevel
            });

            public string ProcessRs() => JsonConvert.SerializeObject(new
            {
                session_id = SessionId,
                working_set_table_name = WorkingSetTableName,
                rs_config_id = RsConfigId
            });

            public string ProcessRollup() => RollupArgs.GetS("");

            public string Cleanup() => JsonConvert.SerializeObject(new { session_id = SessionId });
        }

        #region Helper Methods
        private Func<Parameters, Task<Parameters>> WithEvents(Func<Parameters, Parameters> dataflowTask)
        {
            return async (input) =>
            {
                var start = DateTime.Now;

                await DropStartEvent(input, dataflowTask.Method.Name);

                try
                {
                    return dataflowTask(input);
                }
                catch (Exception ex)
                {
                    await DropErrorEvent(ex, input, dataflowTask.Method.Name);
                    throw;
                }
                finally
                {
                    var end = DateTime.Now;
                    await DropEndEvent(input, end - start, dataflowTask.Method.Name);
                }
            };
        }

        private Func<Parameters, Task<Parameters>> WithEvents(Func<Parameters, Task<Parameters>> dataflowTask)
        {
            return async (input) =>
            {
                var start = DateTime.Now;

                await DropStartEvent(input, dataflowTask.Method.Name);

                try
                {
                    return await dataflowTask(input);
                }
                catch (Exception ex)
                {
                    await DropErrorEvent(ex, input, dataflowTask.Method.Name);
                    throw;
                }
                finally
                {
                    var end = DateTime.Now;
                    await DropEndEvent(input, end - start, dataflowTask.Method.Name);
                }
            };
        }

        private Func<Parameters, Task<IEnumerable<Parameters>>> WithEvents(Func<Parameters, Task<IEnumerable<Parameters>>> dataflowTask)
        {
            return async (input) =>
            {
                var start = DateTime.Now;

                await DropStartEvent(input, dataflowTask.Method.Name);

                try
                {
                    return await dataflowTask(input);
                }
                catch (Exception ex)
                {
                    await DropErrorEvent(ex, input, dataflowTask.Method.Name);
                    throw;
                }
                finally
                {
                    var end = DateTime.Now;
                    await DropEndEvent(input, end - start, dataflowTask.Method.Name);
                }
            };
        }

        private Func<Parameters, Task> WithEvents(Func<Parameters, Task> dataflowTask)
        {
            return async (input) =>
            {
                var start = DateTime.Now;

                await DropStartEvent(input, dataflowTask.Method.Name);

                try
                {
                    await dataflowTask(input);
                }
                catch (Exception ex)
                {
                    await DropErrorEvent(ex, input, dataflowTask.Method.Name);
                    throw;
                }
                finally
                {
                    var end = DateTime.Now;
                    await DropEndEvent(input, end - start, dataflowTask.Method.Name);
                }
            };
        }

        private Task DropEvent(object payload)
        {
            var edwBulkEvent = new EdwBulkEvent();

            edwBulkEvent.AddEvent(Guid.NewGuid(), DateTime.UtcNow, new Dictionary<Guid, (Guid rsId, DateTime rsTs)> { [RsConfigId] = (_rsId, _rsTs) }, payload);

#if DEBUG
            Console.WriteLine($"{DateTime.Now}: {JsonConvert.SerializeObject(payload)}");
#endif

            return FrameworkWrapper.EdwWriter.Write(edwBulkEvent);
        }

        private Task DropStartEvent(Parameters input, [CallerMemberName] string step = null)
        {
            return DropEvent(new
            {
                step,
                eventType = "Start",
                sessionId = input?.SessionId,
                workingSetTableName = input?.WorkingSetTableName,
                rsConfigId = input?.RsConfigId,
                rollupName = input?.RollupName
            });
        }

        private Task DropEndEvent(Parameters input, TimeSpan elapsed, [CallerMemberName] string step = null)
        {
            return DropEvent(new
            {
                step,
                eventType = "End",
                elapsed = elapsed.TotalSeconds,
                sessionId = input?.SessionId,
                workingSetTableName = input?.WorkingSetTableName,
                rsConfigId = input?.RsConfigId,
                rollupName = input?.RollupName
            });
        }

        private async Task DropErrorEvent(Exception ex, Parameters input, [CallerMemberName] string step = null, bool alert = true)
        {
            await DropEvent(new
            {
                step,
                eventType = "Error",
                sessionId = input?.SessionId,
                workingSetTableName = input?.WorkingSetTableName,
                rsConfigId = input?.RsConfigId,
                rollupName = input?.RollupName,
                message = ex.ToString()
            });

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
        }
        #endregion
    }
}
