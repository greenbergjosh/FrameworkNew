using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Quartz;
using Renci.SshNet;
using Renci.SshNet.Async;
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
                await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(Execute)}", $"{await ThreadGroup.GetS("Name")} {Period} aborting due to active exclusive maintenance task");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {await ThreadGroup.GetS("Name")} {Period} aborting due to active exclusive maintenance task");
#endif
                return;
            }

            _rsId = Guid.NewGuid();
            _rsTs = DateTime.UtcNow;

            var threadGroupId = Guid.Parse(await ThreadGroup.GetS("Id"));

            var parameters = new Parameters(EdwConfigId, threadGroupId, await ThreadGroup.GetS("Name"), Period, TriggerFrequency, "LOG", _rsId.ToString());

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

                await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(Execute)}", $"{await ThreadGroup.GetS("Name")} {Period} Complete");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {await ThreadGroup.GetS("Name")} {Period} Complete");
#endif
            }
            catch (Exception ex)
            {
                await DropErrorEvent(ex, parameters, "ThreadGroupProcess", null, false);

                await FrameworkWrapper.Error($"{nameof(RollupJob)}.{nameof(Execute)}", $"{await ThreadGroup.GetS("Name")} {Period} Error: {ex}");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {await ThreadGroup.GetS("Name")} {Period} Error: {ex}");
#endif
            }
        }

        #region Dataflow Tasks
        private async Task<IEnumerable<Parameters>> PrepareThreadGroup(Parameters parameters)
        {
            var prepareThreadGroupResult = await Data.CallFn("edw", "prepareThreadGroup", parameters.PrepareThreadGroup(), timeout: 600);

            if (await prepareThreadGroupResult.GetS("status") != "ok")
            {
                var description = await prepareThreadGroupResult.GetS("description");
                throw new Exception(description);
            }

            var sessionId = await prepareThreadGroupResult.GetS("session_id", null);
            var workingSetTableName = await prepareThreadGroupResult.GetS("working_set_table_name", null);

            var threadGroupParameters = parameters with { SessionId = sessionId, WorkingSetTableName = workingSetTableName };

            var message = await prepareThreadGroupResult.GetS("message", null);
            if (!string.IsNullOrWhiteSpace(message))
            {
                await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(PrepareThreadGroup)}", $"{await ThreadGroup.GetS("Name")} {Period}: {message}");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: {await ThreadGroup.GetS("Name")} {Period}: {message}");
#endif
                return new[] { threadGroupParameters };
            }

            var reportSequences = new List<Parameters>();

            var rsConfigIds = (await prepareThreadGroupResult.GetL<string>("rs_config_ids")).Select(i => Guid.Parse(i));
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
            var processRsResult = await Data.CallFn("edw", "processRs", parameters.ProcessRs(), timeout: 600);

            if (!string.IsNullOrWhiteSpace(await processRsResult.GetS("message", null)))
            {
                throw new Exception(await processRsResult.GetS("message"));
            }

            var rs = await FrameworkWrapper.Entities.GetEntity(parameters.RsConfigId);

            if (await rs.GetB("Config.export_to_clickhouse", false))
            {
                var rsName = await rs.GetS("Name");
                var query = $"INSERT INTO datasets.`{rsName}` FORMAT CSVWithNames";

                var clickhouseConfig = await rs.GetE("Config.clickhouse");
                var host = await clickhouseConfig.GetS("host");
                var sshUser = await clickhouseConfig.GetS("ssh.user");
                var sshPassword = await clickhouseConfig.GetS("ssh.password");

                var clickhouseUser = await clickhouseConfig.GetS("clickhouse.user");
                var clickhousePassword = await clickhouseConfig.GetS("clickhouse.password");

                var importPath = await clickhouseConfig.GetS("import_path");
                var worksetNormalizedPayloadTable = await processRsResult.GetS("workset_normalized_payload_table");

                var fullPath = $"{importPath}/{parameters.RsConfigId:N}/{worksetNormalizedPayloadTable[^8..]}";

                _ = await ExecuteClickhouseQuery(host, sshUser, sshPassword, clickhouseUser, clickhousePassword, query, fullPath);

                var deleteCommand = $"rm -f {fullPath}";

                _ = await ExecuteSSHCommand(host, sshUser, sshPassword, deleteCommand);
            }

            var rollups = new List<Parameters>();

            var allRollupArgs = (await processRsResult.GetL("args")).ToList();

            if (allRollupArgs.Any())
            {
                foreach (var rollupArgs in allRollupArgs)
                {
                    var rollupParameters = parameters with { RollupArgs = rollupArgs, RollupName = await rollupArgs.GetS("rollup_name"), RollupCount = allRollupArgs.Count };
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
                var rollupResult = await Data.CallFn("edw", "processRollup", parameters.ProcessRollup(), timeout: 600);

                var status = await rollupResult.GetS("status");
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
                if (await cleanupResult.GetS("status") != "ok")
                {
                    var error = await cleanupResult.GetS("error");
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

            public string ProcessRollup() => JsonSerializer.Serialize(RollupArgs);

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
            Console.WriteLine($"{DateTime.Now}: {await ThreadGroup.GetS("Name")}_{Period} {JsonSerializer.Serialize(payload)}");
#endif

            await FrameworkWrapper.EdwWriter.Write(edwBulkEvent);
        }

        private async Task DropReportingSequence()
        {
            var edwBulkEvent = new EdwBulkEvent();
            edwBulkEvent.AddReportingSequence(_rsId, _rsTs, new { threadGroup = await ThreadGroup.GetS("Name"), period = Period }, RsConfigId);

            await FrameworkWrapper.EdwWriter.Write(edwBulkEvent);

            await FrameworkWrapper.Log($"{nameof(RollupJob)}.{nameof(Execute)}", $"{await ThreadGroup.GetS("Name")} {Period} Start");
#if DEBUG
            Console.WriteLine($"{DateTime.Now}: {ThreadGroup.GetS("Name")} {Period} Start");
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
                rollupArgs = JsonSerializer.Serialize(input?.RollupArgs),
                parameters = input
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
                rollupArgs = JsonSerializer.Serialize(input?.RollupArgs),
                parameters = input
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
                rollupArgs = JsonSerializer.Serialize(input?.RollupArgs),
                message = ex.ToString(),
                parameters = input
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
            var degreesOfParallelism = await FrameworkWrapper.StartupConfiguration.GetI("Config.Parallelism", 16);

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

            _ = await ProtocolClient.HttpPostAsync(await FrameworkWrapper.StartupConfiguration.GetS("Config.SlackAlertUrl"), JsonSerializer.Serialize(new
            {
                text
            }), "application/json");
        }

        private static Task<string> ExecuteClickhouseQuery(string host, string sshUser, string sshPassword, string clickhouseUser, string clickhousePassword, string query, string pipeIn = null)
        {
            var commandText = $"clickhouse-client -u {clickhouseUser} --password {clickhousePassword} --query \"{query.Replace("`", "\\`")}\"";
            if (!string.IsNullOrWhiteSpace(pipeIn))
            {
                commandText += $" < {pipeIn}";
#if DEBUG
                Console.WriteLine(query + " < " + pipeIn);
                Console.WriteLine();

            }
            else
            {
                Console.WriteLine(query);
                Console.WriteLine();
#endif
            }

            return ExecuteSSHCommand(host, sshUser, sshPassword, commandText);
        }

        private static async Task<string> ExecuteSSHCommand(string host, string user, string password, string commandText)
        {
            using var client = new SshClient(host, user, password);
            client.Connect();
            using var command = client.CreateCommand(commandText);

            var result = await command.ExecuteAsync();

            return !string.IsNullOrWhiteSpace(command.Error) ? throw new Exception($"{command.Error}\r\nCommand:\r\n{commandText}") : result;
        }
        #endregion
    }
}
