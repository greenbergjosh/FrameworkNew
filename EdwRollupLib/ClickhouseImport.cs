using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Renci.SshNet;
using Renci.SshNet.Async;
using Utility;
using Utility.DataLayer;
using Utility.EDW.Reporting;
using Utility.Entity;

namespace EdwRollupLib
{
    public class ClickhouseImport
    {
        private record Parameters(DateTime StartDate, DateTime EndDate, Entity Config, int? TableIndex = null, string PartitionIndex = null, string MergedTableName = null)
        {
            public async Task<string> Table() => TableIndex.HasValue ? await Config.EvalS($"source_tables[{TableIndex.Value}].table_name") : null;
        }

        private readonly Entity _config;
        private readonly Guid _rsConfigId;
        private readonly FrameworkWrapper _fw;

        private readonly ConcurrentDictionary<string, int> _partitionPopulationProgress = new();
        private readonly ConcurrentDictionary<string, string> _partitionCompletionProgress = new();

        private bool _running;
        private SshClient _client;
        private string _clickhouseUser;
        private string _clickhousePassword;

        private Dictionary<Guid, (Guid rsId, DateTime rsTs)> _reportingSequences;

        private readonly TaskCompletionSource _complete = new();

        public static async Task<ClickhouseImport> Create(Entity config, FrameworkWrapper fw)
        {
            var rsConfigId = Guid.Parse(await config.EvalS("rs_config_id"));
            return new ClickhouseImport(config, fw, rsConfigId);
        }

        private ClickhouseImport(Entity config, FrameworkWrapper fw, Guid rsConfigId)
        {
            _config = config;
            _rsConfigId = rsConfigId;
            _fw = fw;
        }

        #region Nested
        public async Task RunAsync(DateTime startDate, DateTime endDate, IEnumerable<(Guid rsConfigId, Guid rsId, DateTime rsTs)> additionalReportingSequences = null)
        {
            if (_running)
            {
                throw new InvalidOperationException("Already running");
            }

            var importType = await _config.GetS("Config.import_type", null);
            if (importType != "nested")
            {
                throw new InvalidOperationException($"This import is not of type nested. It is of type {importType}");
            }

            _running = true;

            _partitionPopulationProgress.Clear();
            _partitionCompletionProgress.Clear();

            var rsId = Guid.NewGuid();
            var rsTs = DateTime.UtcNow;

            _reportingSequences = new() { [_rsConfigId] = (rsId, rsTs) };
            if (additionalReportingSequences != null)
            {
                foreach (var rs in additionalReportingSequences)
                {
                    _reportingSequences[rs.rsConfigId] = (rs.rsId, rs.rsTs);
                }
            }

            var edwBulkEvent = new EdwBulkEvent();
            edwBulkEvent.AddReportingSequence(rsId, rsTs, new { name = await _config.EvalS("$meta.name") }, _rsConfigId);
            await _fw.EdwWriter.Write(edwBulkEvent);

            await DropStartEvent(new Parameters(startDate, endDate, _config), "ImportProcess", null);
            var start = DateTime.Now;

            try
            {
                var options = new ExecutionDataflowBlockOptions { MaxDegreeOfParallelism = 4, EnsureOrdered = false, BoundedCapacity = -1 };

                var withEventsMaker = new WithEventsMaker<Parameters>(DropStartEvent, DropEndEvent, DropErrorEvent);

                var createTargetTable = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(CreateTargetTable, null), options);
                var createFileTasks = new TransformManyBlock<Parameters, Parameters>(withEventsMaker.WithEvents(CreateFileTasks, null), options);
                var createExportFile = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(CreateExportFile, p => p.Config.EvalS($"source_tables[{p.TableIndex.Value}].table_name")), options);
                var createImportTables = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(CreateImportTables, p => p.Config.EvalS($"source_tables[{p.TableIndex.Value}].table_name")), options);
                var importFile = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(ImportFile, p => p.Config.EvalS($"source_tables[{p.TableIndex.Value}].table_name")), options);
                var createPartitionTasks = new TransformManyBlock<Parameters, Parameters>(withEventsMaker.WithEvents(CreatePartitionTasks, p => p.Config.EvalS($"source_tables[{p.TableIndex.Value}].table_name")), options);
                var populateGroupedTable = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(PopulateGroupedTable, async p => $"{await p.Config.EvalS($"source_tables[{p.TableIndex.Value}].table_name")}-{p.PartitionIndex}"), options);
                var gatherPopulatedPartition = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(GatherPopulatedPartition, async p => $"{await p.Config.EvalS($"source_tables[{p.TableIndex.Value}].table_name")}-{p.PartitionIndex}"), options);
                var mergeTablesInPartition = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(MergeTablesInPartition, p => Task.FromResult($"{p.PartitionIndex}")), options);
                var mergePartitionIntoFinalTable = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(MergePartitionIntoFinalTable, p => Task.FromResult($"{p.PartitionIndex}")), options);
                var gatherCompletedPartitions = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(GatherCompletedPartitions, p => Task.FromResult($"{p.PartitionIndex}")), options);
                var swapMergedTables = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(SwapMergedTable, null), options);
                var cleanupTempTables = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(CleanupTempTables, null), options);
                var cleanupFiles = new ActionBlock<Parameters>(withEventsMaker.WithEvents(CleanupFiles, null), options);

                createTargetTable.LinkTo(createFileTasks);
                createFileTasks.LinkTo(createExportFile);
                createExportFile.LinkTo(createImportTables);
                createImportTables.LinkTo(importFile);
                importFile.LinkTo(createPartitionTasks);
                createPartitionTasks.LinkTo(populateGroupedTable);
                populateGroupedTable.LinkTo(gatherPopulatedPartition);
                gatherPopulatedPartition.LinkTo(DataflowBlock.NullTarget<Parameters>(), (output) => output == default);
                gatherPopulatedPartition.LinkTo(mergeTablesInPartition);
                mergeTablesInPartition.LinkTo(mergePartitionIntoFinalTable);
                mergePartitionIntoFinalTable.LinkTo(gatherCompletedPartitions);
                gatherCompletedPartitions.LinkTo(DataflowBlock.NullTarget<Parameters>(), (output) => output == default);
                gatherCompletedPartitions.LinkTo(swapMergedTables);
                swapMergedTables.LinkTo(cleanupTempTables);
                cleanupTempTables.LinkTo(cleanupFiles);

                var clickhouseConfig = await _config.EvalE("clickhouse");
                var host = await clickhouseConfig.EvalS("host");
                var user = await clickhouseConfig.EvalS("ssh.user");
                var password = await clickhouseConfig.EvalS("ssh.password");

                _clickhouseUser = await clickhouseConfig.EvalS("clickhouse.user");
                _clickhousePassword = await clickhouseConfig.EvalS("clickhouse.password");

                using (_client = new SshClient(host, user, password))
                {
                    _client.Connect();

                    await createTargetTable.SendAsync(new Parameters(startDate, endDate, _config));

                    await _complete.Task;
                }
            }
            finally
            {
                var end = DateTime.Now;
                await DropEndEvent(new Parameters(startDate, endDate, _config), end - start, "ImportProcess", null);
                _running = false;
#if DEBUG
                Console.WriteLine(end - start);
#endif
            }
        }

        #region Dataflow Tasks
        private async Task<Parameters> CreateTargetTable(Parameters parameters)
        {
            var config = parameters.Config;

            var sourceTables = await config.EvalL("source_tables").ToList();
            var targetTableName = $"{await config.EvalS("merged_table_name")}";

            var combinedColumnDefinitions = GetCombinedColumnDefinitions(config, sourceTables);

            var keyColumns = await config.EvalL("key_columns").ToList();

            var sql = @$"create table if not exists datasets.{targetTableName}
(
{combinedColumnDefinitions}
)
engine = MergeTree()
ORDER BY
{await GetSelectList(keyColumns)}
SETTINGS index_granularity = 8192;";

            _ = await ExecuteClickhouseQuery(sql);

            sql = $"drop table if exists datasets.{targetTableName}_new;";

            _ = await ExecuteClickhouseQuery(sql);

            sql = @$"create table datasets.{targetTableName}_new
(
{combinedColumnDefinitions}
)
engine = MergeTree()
ORDER BY
{await GetSelectList(keyColumns)}
SETTINGS index_granularity = 8192;";

            _ = await ExecuteClickhouseQuery(sql);

            return parameters;
        }

        private async Task<IEnumerable<Parameters>> CreateFileTasks(Parameters parameters) => Enumerable.Range(0, await parameters.Config.EvalL("source_tables").Count()).Select(i => parameters with { TableIndex = i });

        private async Task<Parameters> CreateExportFile(Parameters parameters)
        {
            var config = parameters.Config;
            var tableIndex = parameters.TableIndex.Value;

            var tableConfig = await config.EvalE($"source_tables[{tableIndex}]");
            var tableName = await tableConfig.EvalS("table_name");

            var export = await tableConfig.EvalE("export");

            var connectionString = await export.EvalS("connection_string");
            var function = await export.EvalS("function");
            var path = await export.EvalS("source_path");
            var filename = $"{tableName}_{parameters.StartDate:yyyy_MM_dd}.csv";

            var result = await ExecutePostgresQuery(connectionString, "exportData", new
            {
                date_start = parameters.StartDate,
                date_end = parameters.EndDate,
                export_function = function,
                export_path = $"{path}/{filename}",
                columns = (await config.EvalL("key_columns").ToList()).Concat(await tableConfig.EvalL("columns").ToList()).Select(async c => new
                {
                    name = await c.EvalS("name"),
                    type = await c.EvalS("source_type")
                })
            });

            return await result.EvalS("result", defaultValue: null) != "success"
                ? throw new DataException($"Error exporting table: {tableName} result: {result}")
                : parameters;
        }

        private async Task<Parameters> CreateImportTables(Parameters parameters)
        {
            var config = parameters.Config;
            var tableIndex = parameters.TableIndex.Value;

            var tableConfig = await config.EvalE($"source_tables[{tableIndex}]");
            var tableName = await tableConfig.EvalS("table_name");

            var sql = @$"drop table if exists datasets.import_{tableName};";

            _ = await ExecuteClickhouseQuery(sql);

            var keyColumns = await config.EvalL("key_columns").ToList();
            var columns = await tableConfig.EvalL("columns").ToList();

            sql = $@"create table datasets.import_{tableName}
(
{await GetColumnDefinitions(keyColumns)},
{await GetColumnDefinitions(columns)}
)
engine = MergeTree()
ORDER BY
{await GetSelectList(keyColumns)}
SETTINGS index_granularity = 8192;";

            _ = await ExecuteClickhouseQuery(sql);

            var partitions = config.EvalL("partitioning/partitions");
            var nestedTableName = await tableConfig.EvalS("nested_table_name");
            await foreach (var partition in partitions)
            {
                var partitionKey = partition.Value<string>();

                sql = @$"drop table if exists datasets.import_{tableName}_{partitionKey};";
                _ = await ExecuteClickhouseQuery(sql);

                sql = nestedTableName != null
                    ? @$"create table datasets.import_{tableName}_{partitionKey}
(
{await GetColumnDefinitions(keyColumns)},
{await GetColumnDefinitions(columns, nestedTableName)}
)
engine = MergeTree()
ORDER BY
{await GetSelectList(keyColumns)}
SETTINGS index_granularity = 8192;"
                    : @$"create table datasets.import_{tableName}_{partitionKey}
(
{await GetColumnDefinitions(keyColumns)},
{await GetColumnDefinitions(columns)}
)
engine = MergeTree()
ORDER BY
{await GetSelectList(keyColumns)}
SETTINGS index_granularity = 8192;";

                _ = await ExecuteClickhouseQuery(sql);
            }

            return parameters;
        }

        private async Task<Parameters> ImportFile(Parameters parameters)
        {
            var config = parameters.Config;
            var tableIndex = parameters.TableIndex.Value;

            var tableConfig = await config.EvalE($"source_tables[{tableIndex}]");
            var tableName = await tableConfig.EvalS("table_name");

            var export = await tableConfig.EvalE("export");
            var path = await export.EvalS("target_path");
            var filename = $"{await tableConfig.EvalS("table_name")}_{parameters.StartDate:yyyy_MM_dd}.csv";
            var importPath = $"{path}/{filename}";

            _ = await ExecuteSSHCommand($"sudo chmod 666 {path}/*");

            _ = await ExecuteClickhouseQuery($"INSERT INTO datasets.import_{tableName} FORMAT CSVWithNames", importPath);

            return parameters;
        }

        private async Task<IEnumerable<Parameters>> CreatePartitionTasks(Parameters parameters)
        {
            var config = parameters.Config;
            var tableIndex = parameters.TableIndex.Value;

            var tableName = await config.EvalS($"source_tables[{tableIndex}].table_name");

            return (await config.EvalL("partitioning.partitions").ToList()).Select(p => parameters with { PartitionIndex = p.Value<string>() });
        }

        private async Task<Parameters> PopulateGroupedTable(Parameters parameters)
        {
            var config = parameters.Config;
            var tableIndex = parameters.TableIndex.Value;

            var tableConfig = await config.EvalE($"source_tables[{tableIndex}]");
            var nestedTableName = await tableConfig.EvalS("nested_table_name");
            var isGrouped = !string.IsNullOrWhiteSpace(nestedTableName);

            var tableName = await tableConfig.EvalS("table_name");
            var partitionIndex = parameters.PartitionIndex;
            var partitionSelector = await config.EvalS("partitioning.partition_selector");

            var keyColumns = await config.EvalL("key_columns").ToList();
            var columns = await tableConfig.EvalL("columns").ToList();

            var sql = @$"insert into datasets.import_{tableName}_{partitionIndex}
select
{await GetSelectList(keyColumns)},
{await GetSelectList(columns, isGrouped)}
from datasets.import_{tableName}
where {partitionSelector} = '{partitionIndex}'";

            if (isGrouped)
            {
                sql += $@"
group by
{await GetSelectList(keyColumns)};";
            }

            _ = await ExecuteClickhouseQuery(sql);

            return parameters;
        }

        private async Task<Parameters> GatherPopulatedPartition(Parameters parameters)
        {
            var config = parameters.Config;
            var tableIndex = parameters.TableIndex.Value;

            var tableName = await config.EvalS($"source_tables[{tableIndex}].table_name");

            var numberOfTables = await config.EvalL("source_tables").Count();

            var completedCount = _partitionPopulationProgress.AddOrUpdate(parameters.PartitionIndex, 1, (_, existing) => existing + 1);

            return completedCount == numberOfTables ? (parameters with { TableIndex = null }) : default;
        }

        private async Task<Parameters> MergeTablesInPartition(Parameters parameters)
        {
            var config = parameters.Config;
            var partitionIndex = parameters.PartitionIndex;

            var sourceTables = await config.EvalL("source_tables").ToList();

            var combinedColumnDefinitions = GetCombinedColumnDefinitions(config, sourceTables);
            var combinedColumnInsert = GetCombinedColumnInserts(config, sourceTables);

            var partitionSelector = await config.EvalS("partitioning.partition_selector");

            var clickhouse = await config.EvalE("clickhouse");

            Entity previousTable = null;

            var previousMergedTableName = string.Empty;

            async Task ProcessSection(StringBuilder sql, string currentTableName, Action<string, bool, Entity> handler, int indentCount = 1)
            {
                foreach (var columnTable in sourceTables)
                {
                    var isCurrent = (await columnTable.EvalS("table_name")) == currentTableName;
                    var nestedTableName = await columnTable.EvalS("nested_table_name");

                    _ = sql.AppendLine($"{new string(' ', 4 * indentCount)}-- {await columnTable.EvalS("table_name")} {(isCurrent ? " -- CURRENT TABLE" : "")}");

                    await foreach (var column in columnTable.EvalL("columns"))
                    {
                        handler(nestedTableName, isCurrent, column);
                    }
                }

                sql.Length -= Environment.NewLine.Length + 1;
            }

            foreach (var currentTable in sourceTables)
            {
                var previousTableName = await previousTable?.EvalS("table_name") ?? await config.EvalS("merged_table_name");
                var firstMerge = previousTableName == await config.EvalS("merged_table_name");
                var currentTableName = await currentTable.EvalS("table_name");

                var tableName = $"import_merge_{previousTableName}_and_{currentTableName}_{partitionIndex}";

                var sql = new StringBuilder(@$"drop table if exists datasets.{tableName};");
                _ = await ExecuteClickhouseQuery(sql.ToString());

                var keyColumns = await config.EvalL("key_columns").ToList();

                sql = new StringBuilder(@$"create table if not exists datasets.{tableName}
(
{combinedColumnDefinitions}
)
engine = MergeTree()
ORDER BY
{await GetSelectList(keyColumns)}
SETTINGS index_granularity = 8192;");
                _ = await ExecuteClickhouseQuery(sql.ToString());

                sql = new StringBuilder(@$"insert into datasets.{tableName}
(
{combinedColumnInsert}
)
select
{await GetSelectList(keyColumns)},
");

                // Outer select
                await ProcessSection(sql, currentTableName, async (nestedTableName, isCurrent, column) =>
                {
                    var columnName = await column.EvalS("name");
                    var defaultValue = new Lazy<Task<string>>(async () => GetDefaultValue(await column.EvalS("target_type")));

                    _ = sql.AppendLine((nestedTableName, isCurrent, firstMerge) switch
                    {
                        (null, true, _) => $"    coalesce(max(z.{columnName}2), max(z.{columnName}1), {defaultValue.Value}) {columnName},",
                        (null, false, _) => $"    coalesce(max(z.{columnName}), {defaultValue.Value}) {columnName},",
                        (_, _, true) or (_, true, _) => $"    arrayFlatten(groupArray({columnName})) {columnName},",
                        (_, false, _) => $"    max({columnName}) {columnName},"
                    });
                });

                _ = sql.AppendLine(@$"
from (
    select
    {await GetSelectList(keyColumns)},");

                // Inner select from previous
                await ProcessSection(sql, currentTableName, async (nestedTableName, isCurrent, column) =>
                {
                    var columnName = await column.EvalS("name");

                    _ = sql.AppendLine((nestedTableName, isCurrent, firstMerge) switch
                    {
                        (null, true, _) => $"        {columnName} {columnName}1,\r\n        NULL {columnName}2,",
                        (null, false, _) => $"        {columnName} {columnName},",
                        (_, _, _) => $"        {nestedTableName}.{columnName} {columnName},"
                    });
                }, 2);

                _ = firstMerge
                    ? sql.Append(@$"
    from datasets.{previousTableName}
    where {partitionSelector} = '{partitionIndex}'
        and email != ''")
                    : sql.Append(@$"
    from datasets.{previousMergedTableName}");

                _ = sql.AppendLine($@"
    union all
    select
    { GetSelectList(keyColumns)},");

                // Inner select from current
                await ProcessSection(sql, currentTableName, async (nestedTableName, isCurrent, column) =>
                {
                    var columnName = await column.EvalS("name");

                    _ = sql.AppendLine((nestedTableName, isCurrent, firstMerge) switch
                    {
                        (null, true, _) => $"        NULL {columnName}1,\r\n        {columnName} {columnName}2,",
                        (null, false, _) => $"        NULL {columnName},",
                        (_, true, _) => $"        `{nestedTableName}.{columnName}` {columnName},",
                        (_, false, _) => $"        [] {columnName},"
                    });
                }, 2);

                _ = sql.AppendLine(@$"
    from datasets.import_{currentTableName}_{partitionIndex}
) z
group by 
{await GetSelectList(keyColumns)};");

                _ = await ExecuteClickhouseQuery(sql.ToString());

                previousTable = currentTable;
                previousMergedTableName = tableName;
            }

            return parameters with { MergedTableName = previousMergedTableName };
        }

        private async Task<Parameters> MergePartitionIntoFinalTable(Parameters parameters)
        {
            var config = parameters.Config;
            var mergedTableName = parameters.MergedTableName;

            var sourceTables = await config.EvalL("source_tables").ToList();
            var combinedColumnInsert = GetCombinedColumnInserts(config, sourceTables);

            var targetTableName = $"{await config.EvalS("merged_table_name")}_new";

            var sql = $@"insert into datasets.{targetTableName}
(
{combinedColumnInsert}
)
select
{combinedColumnInsert}
from datasets.{mergedTableName};";

            _ = await ExecuteClickhouseQuery(sql);

            return parameters with { MergedTableName = null };
        }

        private async Task<Parameters> GatherCompletedPartitions(Parameters parameters)
        {
            var config = parameters.Config;
            var partitionIndex = parameters.PartitionIndex;

            return !_partitionCompletionProgress.TryAdd(partitionIndex, partitionIndex)
                ? throw new InvalidOperationException($"Partition {partitionIndex} completed more than once")
                : _partitionCompletionProgress.Count == await config.EvalL("partitioning.partitions").Count()
                ? (parameters with { PartitionIndex = null })
                : default;
        }

        private async Task<Parameters> SwapMergedTable(Parameters parameters)
        {
            var config = parameters.Config;
            var targetTableName = $"{await config.EvalS("merged_table_name")}";

            var sql = $@"drop table if exists datasets.{targetTableName}_old;";
            _ = await ExecuteClickhouseQuery(sql);

            sql = $@"rename table datasets.{targetTableName} to datasets.{targetTableName}_old;";
            _ = await ExecuteClickhouseQuery(sql);

            sql = $@"rename table datasets.{targetTableName}_new to datasets.{targetTableName};";
            _ = await ExecuteClickhouseQuery(sql);

            sql = $@"optimize table datasets.{targetTableName} final;";
            _ = await ExecuteClickhouseQuery(sql);

            return parameters;
        }

        private async Task<Parameters> CleanupTempTables(Parameters parameters)
        {
            var config = parameters.Config;

            Entity previousTable = null;

            await foreach (var table in config.EvalL("source_tables"))
            {
                var previousTableName = await previousTable?.EvalS("table_name") ?? await config.EvalS("merged_table_name");
                var firstMerge = previousTableName == await config.EvalS("merged_table_name");

                var currentTableName = await table.EvalS("table_name");

                var sql = @$"drop table if exists datasets.import_{currentTableName};";

                _ = await ExecuteClickhouseQuery(sql);

                await foreach (var partition in config.EvalL("partitioning.partitions"))
                {
                    var partitionIndex = partition.Value<string>();
                    sql = @$"drop table if exists datasets.import_{currentTableName}_{partitionIndex}";

                    _ = await ExecuteClickhouseQuery(sql);

                    sql = @$"drop table if exists datasets.import_merge_{previousTableName}_and_{currentTableName}_{partitionIndex}";

                    _ = await ExecuteClickhouseQuery(sql);
                }

                previousTable = table;
            }

            return parameters;
        }

        private async Task CleanupFiles(Parameters parameters)
        {
            await foreach (var tableConfig in parameters.Config.EvalL("source_tables"))
            {
                var tableName = await tableConfig.EvalS("table_name");

                var export = await tableConfig.EvalE("export");
                var path = await export.EvalS("target_path");
                var filename = $"{tableName}_{parameters.StartDate:yyyy_MM_dd}.csv";
                var importPath = $"{path}/{filename}";

                _ = await ExecuteSSHCommand($"sudo rm {importPath}");
            }

            _complete.SetResult();
        }
        #endregion

        #region Helper Methods
        private Task DropEvent(object payload)
        {
            var edwBulkEvent = new EdwBulkEvent();

            edwBulkEvent.AddEvent(Guid.NewGuid(), DateTime.UtcNow, _reportingSequences, payload);

            return _fw.EdwWriter.Write(edwBulkEvent);
        }

        private async Task DropStartEvent(Parameters input, string step, string stepContext)
        {
            var payload = new
            {
                job = await input.Config.EvalS("$meta.name"),
                step,
                stepContext,
                eventType = "Start",
                table = await input.Table(),
                partitionIndex = input.PartitionIndex
            };

            await _fw.Log($"{nameof(ClickhouseImport)}.{step}", JsonSerializer.Serialize(payload));
            await DropEvent(payload);
        }

        private async Task DropEndEvent(Parameters input, TimeSpan elapsed, string step, string stepContext)
        {
            var payload = new
            {
                job = await input.Config.EvalS("$meta.name"),
                step,
                stepContext,
                eventType = "End",
                table = await input.Table(),
                partitionIndex = input.PartitionIndex,
                elapsed = elapsed.TotalSeconds
            };

            await _fw.Log($"{nameof(ClickhouseImport)}.{step}", JsonSerializer.Serialize(payload));
            await DropEvent(payload);
        }

        private async Task DropErrorEvent(Exception ex, Parameters input, string step, string stepContext, bool alert)
        {
            var payload = new
            {
                job = await input.Config.EvalS("$meta.name"),
                step,
                stepContext,
                eventType = "Error",
                table = await input.Table(),
                partitionIndex = input.PartitionIndex,
                message = ex.ToString()
            };

            await _fw.Error($"{nameof(ClickhouseImport)}.{step}", JsonSerializer.Serialize(payload));
            await DropEvent(payload);

            if (alert)
            {
                var text = $"Clickhouse Import - {await input.Config.EvalS("$meta.name")} - ";

                void AddField(string fieldName, object field)
                {
                    if (field != default)
                    {
                        text += $"{fieldName}: {field} ";
                    }
                }

                AddField("Step", step);
                AddField("Table", await input?.Table());
                AddField("PartitionIndex", input?.PartitionIndex);
                AddField("Error", ex.Message);

                _ = await ProtocolClient.HttpPostAsync(await _fw.StartupConfiguration.EvalS("SlackAlertUrl"), JsonSerializer.Serialize(new
                {
                    text
                }), "application/json");
            }

            _complete.SetException(ex);
        }

        private async Task<string> ExecuteSSHCommand(string commandText)
        {
            using var command = _client.CreateCommand(commandText);

            var result = await command.ExecuteAsync();

            return !string.IsNullOrWhiteSpace(command.Error) ? throw new Exception($"{command.Error}\r\nCommand:\r\n{commandText}") : result;
        }

        private Task<string> ExecuteClickhouseQuery(string query, string pipeIn = null)
        {
            var commandText = $"clickhouse-client -u {_clickhouseUser} --password {_clickhousePassword} --query \"{query.Replace("`", "\\`")}\"";
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

            return ExecuteSSHCommand(commandText);
        }

        private static Task<Entity> ExecutePostgresQuery(string connectionName, string functionName, object args)
        {
#if DEBUG
            Console.WriteLine($"{connectionName}:{functionName} {JsonSerializer.Serialize(args)}");
#endif
            return Data.CallFn(connectionName, functionName, JsonSerializer.Serialize(args), timeout: 600000);
        }

        private static async Task<string> GetColumnDefinitions(IEnumerable<Entity> columns, string nestedTableName = null) => string.Join(",\r\n", await columns.Select(column => GetColumnDefinition(column, nestedTableName)));

        private static async Task<string> GetColumnDefinition(Entity columnConfig, string nestedTableName = null) => $"    {(nestedTableName != null ? $"`{nestedTableName}." : "")}{await columnConfig.EvalS("name")}{(nestedTableName != null ? "`" : "")} {(nestedTableName != null ? "Array(" : "")}{await columnConfig.EvalS("target_type")}{(nestedTableName != null ? ")" : "")}";

        private static async Task<string> GetCombinedColumnDefinitions(Entity config, IEnumerable<Entity> sourceTables)
        {
            var combinedColumnDefinitionsBuilder = new StringBuilder();
            _ = combinedColumnDefinitionsBuilder.Append(GetColumnDefinitions(await config.EvalL("key_columns").ToList()));
            _ = combinedColumnDefinitionsBuilder.AppendLine(",");

            foreach (var table in sourceTables)
            {
                _ = combinedColumnDefinitionsBuilder.AppendLine($"    -- {await table.EvalS("table_name")}");
                _ = combinedColumnDefinitionsBuilder.AppendLine(GetColumnDefinitions(await table.EvalL("columns").ToList(), await table.EvalS("nested_table_name")) + ",");
            }

            var combinedColumnDefinitions = combinedColumnDefinitionsBuilder.ToString().TrimEnd(("," + Environment.NewLine).ToArray());
            return combinedColumnDefinitions;
        }

        private static async Task<string> GetCombinedColumnInserts(Entity config, IEnumerable<Entity> sourceTables)
        {
            var combinedColumnInsertBuilder = new StringBuilder();
            _ = combinedColumnInsertBuilder.Append(GetInsertList(await config.EvalL("key_columns").ToList()));
            _ = combinedColumnInsertBuilder.AppendLine(",");
            foreach (var table in sourceTables)
            {
                _ = combinedColumnInsertBuilder.AppendLine($"    -- {table.EvalS("table_name")}");
                _ = combinedColumnInsertBuilder.AppendLine(GetInsertList(await table.EvalL("columns").ToList(), await table.EvalS("nested_table_name")) + ",");
            }

            var combinedColumnInsert = combinedColumnInsertBuilder.ToString().TrimEnd(("," + Environment.NewLine).ToArray());
            return combinedColumnInsert;
        }

        private static string GetDefaultValue(string type) => type switch
        {
            "String" => "''",
            "UInt8" => "0",
            "UInt16" => "0",
            "DateTime" => "null",
            _ => throw new ArgumentException($"{type} not handled")
        };

        private static async Task<string> GetInsertList(IEnumerable<Entity> columns, string nestedTableName = null) => string.Join(",\r\n", await columns.Select(column => InsertColumn(column, nestedTableName)));

        private static async Task<string> GetSelectList(IEnumerable<Entity> columns, bool isArray = false) => string.Join(",\r\n", await columns.Select(c => SelectColumn(c, isArray)));

        private static async Task<string> InsertColumn(Entity columnConfig, string nestedTableName = null) => $"    {(nestedTableName != null ? $"`{nestedTableName}." : "")}{await columnConfig.EvalS("name")}{(nestedTableName != null ? "`" : "")}";

        private static async Task<string> SelectColumn(Entity columnConfig, bool isArray = false) => isArray ? $"    groupArray({await columnConfig.EvalS("name")}) {await columnConfig.EvalS("name")}" : $"    {await columnConfig.EvalS("name")}";
        #endregion
        #endregion

        #region Simple
        public async Task RunAsync(IEnumerable<(Guid rsConfigId, Guid rsId, DateTime rsTs)> additionalReportingSequences = null)
        {
            if (_running)
            {
                throw new InvalidOperationException("Already running");
            }

            var importType = await _config.GetS("Config.import_type", null);
            if (importType != "simple")
            {
                throw new InvalidOperationException($"This import is not of type simple. It is of type {importType}");
            }

            _running = true;

            var rsId = Guid.NewGuid();
            var rsTs = DateTime.UtcNow;

            _reportingSequences = new() { [_rsConfigId] = (rsId, rsTs) };
            if (additionalReportingSequences != null)
            {
                foreach (var rs in additionalReportingSequences)
                {
                    _reportingSequences[rs.rsConfigId] = (rs.rsId, rs.rsTs);
                }
            }

            var edwBulkEvent = new EdwBulkEvent();
            edwBulkEvent.AddReportingSequence(rsId, rsTs, new { name = await _config.GetS("Name") }, _rsConfigId);
            await _fw.EdwWriter.Write(edwBulkEvent);

            await DropStartEvent("ImportProcess", null);
            var start = DateTime.Now;

            try
            {
                var withEventsMaker = new WithEventsMaker(DropStartEvent, DropEndEvent, DropErrorEvent);

                var clickhouseConfig = await _config.GetE("Config.clickhouse");
                var host = await clickhouseConfig.GetS("host");
                var user = await clickhouseConfig.GetS("ssh.user");
                var password = await clickhouseConfig.GetS("ssh.password");

                _clickhouseUser = await clickhouseConfig.GetS("clickhouse.user");
                _clickhousePassword = await clickhouseConfig.GetS("clickhouse.password");

                using (_client = new SshClient(host, user, password))
                {
                    _client.Connect();

                    await withEventsMaker.WithEvents(ExportFileSimple, null)();
                    await withEventsMaker.WithEvents(ImportFileSimple, null)();
                    await withEventsMaker.WithEvents(CleanupSimple, null)();
                }
            }
            finally
            {
                var end = DateTime.Now;
                await DropEndEvent(end - start, "ImportProcess", null);
                _running = false;
#if DEBUG
                Console.WriteLine(end - start);
#endif
            }
        }

        private async Task ExportFileSimple()
        {
            var export = await _config.GetE("Config.export");

            var connectionName = await export.GetS("connection_string");
            var function = await export.GetS("function", null);
            var table = await export.GetS("table", null);

            var path = await export.GetS("source_path");
            var filename = $"{await export.GetS("output_file_name")}.csv";
            var exportPath = $"{path}/{filename}";

            var result = await ExecutePostgresQuery(connectionName, "exportData", new
            {
                export_function = function,
                export_table = table,
                export_path = exportPath,
                columns = await _config.GetL("Config.columns").Select(async c => new
                {
                    name = await c.GetS("name"),
                    type = await c.GetS("source_type")
                })
            });

            if (await result.GetS("result", null) != "success")
            {
                throw new DataException($"Error exporting table: {await _config.GetS("Name")} result: {result}");
            }
        }

        private async Task ImportFileSimple()
        {
            var tableName = await _config.GetS("Config.merged_table_name");
            var schemaName = await _config.GetS("Config.merged_table_schema");

            var export = await _config.GetE("Config.export");
            var path = await export.GetS("target_path");
            var filename = $"{await export.GetS("output_file_name")}.csv";
            var importPath = $"{path}/{filename}";

            _ = await ExecuteSSHCommand($"sudo chmod 666 {importPath}");

            _ = await ExecuteClickhouseQuery($"CREATE TABLE `{schemaName}`.`{tableName}_import` AS `{schemaName}`.`{tableName}`");

            _ = await ExecuteClickhouseQuery($"INSERT INTO `{schemaName}`.`{tableName}_import` FORMAT CSVWithNames", importPath);

            _ = await ExecuteClickhouseQuery($"EXCHANGE TABLES `{schemaName}`.`{tableName}_import` AND `{schemaName}`.`{tableName}`");

            _ = await ExecuteClickhouseQuery($"DROP TABLE `{schemaName}`.`{tableName}_import`");
        }

        private async Task CleanupSimple()
        {
            var export = await _config.GetE("Config.export");
            var path = await export.GetS("target_path");
            var filename = $"{await export.GetS("output_file_name")}.csv";
            var importPath = $"{path}/{filename}";

            _ = await ExecuteSSHCommand($"rm {importPath}");
        }

        #region Helper Methods
        private async Task DropStartEvent(string step, string stepContext)
        {
            var payload = new
            {
                job = await _config.GetS("Name"),
                step,
                stepContext,
                eventType = "Start"
            };

            await _fw.Log($"{nameof(ClickhouseImport)}.{step}", JsonSerializer.Serialize(payload));
            await DropEvent(payload);
        }

        private async Task DropEndEvent(TimeSpan elapsed, string step, string stepContext)
        {
            var payload = new
            {
                job = await _config.GetS("Name"),
                step,
                stepContext,
                eventType = "End",
                elapsed = elapsed.TotalSeconds
            };

            await _fw.Log($"{nameof(ClickhouseImport)}.{step}", JsonSerializer.Serialize(payload));
            await DropEvent(payload);
        }

        private async Task DropErrorEvent(Exception ex, string step, string stepContext, bool alert)
        {
            var payload = new
            {
                job = await _config.GetS("Name"),
                step,
                stepContext,
                eventType = "Error",
                message = ex.ToString()
            };

            await _fw.Error($"{nameof(ClickhouseImport)}.{step}", JsonSerializer.Serialize(payload));
            await DropEvent(payload);

            if (alert)
            {
                var text = $"Clickhouse Import - {await _config.GetS("Name")} - ";

                void AddField(string fieldName, object field)
                {
                    if (field != default)
                    {
                        text += $"{fieldName}: {field} ";
                    }
                }

                AddField("Step", step);
                AddField("Error", ex.Message);

                var slackAlertUrl = await _fw.StartupConfiguration.GetS("Config.SlackAlertUrl", null);

                if (!slackAlertUrl.IsNullOrWhitespace())
                {
                    _ = await ProtocolClient.HttpPostAsync(slackAlertUrl, JsonSerializer.Serialize(new
                    {
                        text
                    }), "application/json");
                }
            }

            _complete.SetException(ex);
        }
        #endregion
        #endregion
    }
}