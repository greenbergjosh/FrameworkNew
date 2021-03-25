using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using ClickHouse.Ado;
using Newtonsoft.Json;
using Renci.SshNet;
using Renci.SshNet.Async;
using Utility;
using Utility.DataLayer;
using Utility.EDW.Reporting;
using Utility.GenericEntity;

namespace EdwRollupLib
{
    public class ClickhouseImport
    {
        private record Parameters(DateTime StartDate, DateTime EndDate, IGenericEntity Config, int? TableIndex = null, string PartitionIndex = null, string MergedTableName = null)
        {
            public string Table
            {
                get
                {
                    if (TableIndex.HasValue)
                    {
                        var tableConfig = Config.GetE($"source_tables[{TableIndex.Value}]");
                        return tableConfig.GetS("table_name");
                    }

                    return null;
                }
            }
        }

        private readonly IGenericEntity _config;
        private readonly Guid _rsConfigId;
        private readonly FrameworkWrapper _fw;

        private readonly ConcurrentDictionary<string, int> _partitionPopulationProgress = new();
        private readonly ConcurrentDictionary<string, string> _partitionCompletionProgress = new();

        private bool _running;
        private SshClient _client;
        private string _clickhouseUser;
        private string _clickhousePassword;

        private Guid _rsId;
        private DateTime _rsTs;

        public ClickhouseImport(IGenericEntity config, FrameworkWrapper fw)
        {
            _config = config;
            _rsConfigId = Guid.Parse(_config.GetS("Config/rs_config_id"));
            _fw = fw;
        }

        public async Task RunAsync(DateTime startDate, DateTime endDate)
        {
            if (_running)
            {
                throw new InvalidOperationException("Already running");
            }

            _running = true;
            _partitionPopulationProgress.Clear();
            _partitionCompletionProgress.Clear();
            _rsId = Guid.NewGuid();
            _rsTs = DateTime.UtcNow;

            var edwBulkEvent = new EdwBulkEvent();
            edwBulkEvent.AddReportingSequence(_rsId, _rsTs, new { name = _config.GetS("Name") }, _rsConfigId);
            await _fw.EdwWriter.Write(edwBulkEvent);

            await DropStartEvent(new Parameters(startDate, endDate, _config.GetE("Config")), "ImportProcess");
            var start = DateTime.Now;

            try
            {
                var options = new ExecutionDataflowBlockOptions { MaxDegreeOfParallelism = 4, EnsureOrdered = false, BoundedCapacity = -1 };

                var withEventsMaker = new WithEventsMaker<Parameters>(DropStartEvent, DropEndEvent, DropErrorEvent);

                var createTargetTable = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(CreateTargetTable), options);
                var createFileTasks = new TransformManyBlock<Parameters, Parameters>(withEventsMaker.WithEvents(CreateFileTasks), options);
                var createExportFile = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(CreateExportFile), options);
                var createImportTables = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(CreateImportTables), options);
                var importFile = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(ImportFile), options);
                var createPartitionTasks = new TransformManyBlock<Parameters, Parameters>(withEventsMaker.WithEvents(CreatePartitionTasks), options);
                var populateGroupedTable = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(PopulateGroupedTable), options);
                var gatherPopulatedPartition = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(GatherPopulatedPartition), options);
                var mergeTablesInPartition = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(MergeTablesInPartition), options);
                var mergePartitionIntoFinalTable = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(MergePartitionIntoFinalTable), options);
                var gatherCompletedPartitions = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(GatherCompletedPartitions), options);
                var swapMergedTables = new TransformBlock<Parameters, Parameters>(withEventsMaker.WithEvents(SwapMergedTable), options);
                var cleanupTempTables = new ActionBlock<Parameters>(withEventsMaker.WithEvents(CleanupTempTables), options);

                var linkOptions = new DataflowLinkOptions { PropagateCompletion = true };

                createTargetTable.LinkTo(createFileTasks, linkOptions);
                createFileTasks.LinkTo(createExportFile, linkOptions);
                createExportFile.LinkTo(createImportTables, linkOptions);
                createImportTables.LinkTo(importFile, linkOptions);
                importFile.LinkTo(createPartitionTasks, linkOptions);
                createPartitionTasks.LinkTo(populateGroupedTable, linkOptions);
                populateGroupedTable.LinkTo(gatherPopulatedPartition, linkOptions);
                gatherPopulatedPartition.LinkTo(DataflowBlock.NullTarget<Parameters>(), linkOptions, (output) => output == default);
                gatherPopulatedPartition.LinkTo(mergeTablesInPartition, linkOptions);
                mergeTablesInPartition.LinkTo(mergePartitionIntoFinalTable, linkOptions);
                mergePartitionIntoFinalTable.LinkTo(gatherCompletedPartitions, linkOptions);
                gatherCompletedPartitions.LinkTo(DataflowBlock.NullTarget<Parameters>(), linkOptions, (output) => output == default);
                gatherCompletedPartitions.LinkTo(swapMergedTables, linkOptions);
                swapMergedTables.LinkTo(cleanupTempTables, linkOptions);

                var clickhouseConfig = _config.GetE("Config/clickhouse");
                var host = clickhouseConfig.GetS("host");
                var user = clickhouseConfig.GetS("ssh/user");
                var password = clickhouseConfig.GetS("ssh/password");

                _clickhouseUser = clickhouseConfig.GetS("clickhouse/user");
                _clickhousePassword = clickhouseConfig.GetS("clickhouse/password");

                using (_client = new SshClient(host, user, password))
                {
                    _client.Connect();
                    await createTargetTable.SendAsync(new Parameters(startDate, endDate, _config.GetE("Config")));

                    createTargetTable.Complete();

                    await cleanupTempTables.Completion;
                }
            }
            finally
            {
                var end = DateTime.Now;
                await DropEndEvent(new Parameters(startDate, endDate, _config.GetE("Config")), end - start, "ImportProcess");
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

            var sourceTables = config.GetL("source_tables");
            var targetTableName = $"{config.GetS("merged_table_name")}";

            var combinedColumnDefinitions = GetCombinedColumnDefinitions(config, sourceTables);

            var sql = @$"create table if not exists datasets.{targetTableName}
(
{combinedColumnDefinitions}
)
engine = MergeTree()
ORDER BY
{GetSelectList(config.GetL("key_columns"))}
SETTINGS index_granularity = 8192;";

            await ExecuteClickhouseQuery(sql);

            sql = $"drop table if exists datasets.{targetTableName}_new;";

            await ExecuteClickhouseQuery(sql);

            sql = @$"create table datasets.{targetTableName}_new
(
{combinedColumnDefinitions}
)
engine = MergeTree()
ORDER BY
{GetSelectList(config.GetL("key_columns"))}
SETTINGS index_granularity = 8192;";

            await ExecuteClickhouseQuery(sql);

            return parameters;
        }

        private IEnumerable<Parameters> CreateFileTasks(Parameters parameters)
        {
            return Enumerable.Range(0, parameters.Config.GetL("source_tables").Count()).Select(i => parameters with { TableIndex = i });
        }

        private async Task<Parameters> CreateExportFile(Parameters parameters)
        {
            var config = parameters.Config;
            var tableIndex = parameters.TableIndex.Value;

            var tableConfig = config.GetE($"source_tables[{tableIndex}]");
            var tableName = tableConfig.GetS("table_name");

            var export = tableConfig.GetE("export");

            var connectionString = export.GetS("connection_string");
            var function = export.GetS("function");
            var path = export.GetS("source_path");
            var filename = $"{tableName}_{parameters.StartDate:yyyy_MM_dd}.csv";

            var result = await ExecutePostgresQuery(connectionString, "exportData", new
            {
                date_start = parameters.StartDate,
                date_end = parameters.EndDate,
                export_function = function,
                export_path = $"{path}/{filename}",
                columns = config.GetL("key_columns").Concat(tableConfig.GetL("columns")).Select(c => new
                {
                    name = c.GetS("name"),
                    type = c.GetS("source_type")
                })
            });

            if (result.GetS("result") != "success")
            {
                throw new DataException($"Error exporting table: {tableName} error: {result.GetS("err")}");
            }

            return parameters;
        }

        private async Task<Parameters> CreateImportTables(Parameters parameters)
        {
            var config = parameters.Config;
            var tableIndex = parameters.TableIndex.Value;

            var tableConfig = config.GetE($"source_tables[{tableIndex}]");
            var tableName = tableConfig.GetS("table_name");

            var sql = @$"drop table if exists datasets.import_{tableName};";

            await ExecuteClickhouseQuery(sql);

            sql = $@"create table datasets.import_{tableName}
(
{GetColumnDefinitions(config.GetL("key_columns"))},
{GetColumnDefinitions(tableConfig.GetL("columns"))}
)
engine = MergeTree()
ORDER BY
{GetSelectList(config.GetL("key_columns"))}
SETTINGS index_granularity = 8192;";

            await ExecuteClickhouseQuery(sql);

            var partitions = config.GetL("partitioning/partitions");
            var nestedTableName = tableConfig.GetS("nested_table_name");
            foreach (var partition in partitions)
            {
                sql = @$"drop table if exists datasets.import_{tableName}_{partition.GetS("")};";
                await ExecuteClickhouseQuery(sql);

                if (nestedTableName != null)
                {
                    sql = @$"create table datasets.import_{tableName}_{partition.GetS("")}
(
{GetColumnDefinitions(config.GetL("key_columns"))},
{GetColumnDefinitions(tableConfig.GetL("columns"), nestedTableName)}
)
engine = MergeTree()
ORDER BY
{GetSelectList(config.GetL("key_columns"))}
SETTINGS index_granularity = 8192;";
                }
                else
                {
                    sql = @$"create table datasets.import_{tableName}_{partition.GetS("")}
(
{GetColumnDefinitions(config.GetL("key_columns"))},
{GetColumnDefinitions(tableConfig.GetL("columns"))}
)
engine = MergeTree()
ORDER BY
{GetSelectList(config.GetL("key_columns"))}
SETTINGS index_granularity = 8192;";
                }

                await ExecuteClickhouseQuery(sql);
            }

            return parameters;
        }

        private async Task<Parameters> ImportFile(Parameters parameters)
        {
            var config = parameters.Config;
            var tableIndex = parameters.TableIndex.Value;

            var tableConfig = config.GetE($"source_tables[{tableIndex}]");
            var tableName = tableConfig.GetS("table_name");

            var export = tableConfig.GetE("export");
            var path = export.GetS("target_path");
            var filename = $"{tableConfig.GetS("table_name")}_{parameters.StartDate:yyyy_MM_dd}.csv";
            var importPath = $"{path}/{filename}";

            await ExecuteClickhouseQuery($"INSERT INTO datasets.import_{tableName} FORMAT CSVWithNames", importPath);

            return parameters;
        }

        private IEnumerable<Parameters> CreatePartitionTasks(Parameters parameters)
        {
            var config = parameters.Config;
            var tableIndex = parameters.TableIndex.Value;

            var tableConfig = config.GetE($"source_tables[{tableIndex}]");
            var tableName = tableConfig.GetS("table_name");

            return config.GetL("partitioning/partitions").Select(p => parameters with { PartitionIndex = p.GetS("") });
        }

        private async Task<Parameters> PopulateGroupedTable(Parameters parameters)
        {
            var config = parameters.Config;
            var tableIndex = parameters.TableIndex.Value;

            var tableConfig = config.GetE($"source_tables[{tableIndex}]");
            var nestedTableName = tableConfig.GetS("nested_table_name");
            var isGrouped = !string.IsNullOrWhiteSpace(nestedTableName);

            var tableName = tableConfig.GetS("table_name");
            var partitionIndex = parameters.PartitionIndex;
            var partitionSelector = config.GetS("partitioning/partition_selector");

            var sql = @$"insert into datasets.import_{tableName}_{partitionIndex}
select
{GetSelectList(config.GetL("key_columns"))},
{GetSelectList(tableConfig.GetL("columns"), isGrouped)}
from datasets.import_{tableName}
where {partitionSelector} = '{partitionIndex}'";

            if (isGrouped)
            {
                sql += $@"
group by
{GetSelectList(config.GetL("key_columns"))};";
            }

            await ExecuteClickhouseQuery(sql);

            return parameters;
        }

        private Parameters GatherPopulatedPartition(Parameters parameters)
        {
            var config = parameters.Config;
            var tableIndex = parameters.TableIndex.Value;

            var tableConfig = config.GetE($"source_tables[{tableIndex}]");
            var tableName = tableConfig.GetS("table_name");

            var numberOfTables = config.GetL("source_tables").Count();

            var completedCount = _partitionPopulationProgress.AddOrUpdate(parameters.PartitionIndex, 1, (_, existing) => existing + 1);

            if (completedCount == numberOfTables)
            {
                return parameters with { TableIndex = null };
            }

            return default;
        }

        private async Task<Parameters> MergeTablesInPartition(Parameters parameters)
        {
            var config = parameters.Config;
            var partitionIndex = parameters.PartitionIndex;

            var sourceTables = config.GetL("source_tables");

            var combinedColumnDefinitions = GetCombinedColumnDefinitions(config, sourceTables);
            var combinedColumnInsert = GetCombinedColumnInserts(config, sourceTables);

            var partitionSelector = config.GetS("partitioning/partition_selector");

            var clickhouse = config.GetE("clickhouse");

            IGenericEntity previousTable = null;

            var previousMergedTableName = string.Empty;

            void ProcessSection(StringBuilder sql, string currentTableName, Action<string, bool, IGenericEntity> handler, int indentCount = 1)
            {
                foreach (var columnTable in sourceTables)
                {
                    var isCurrent = columnTable.GetS("table_name") == currentTableName;
                    var nestedTableName = columnTable.GetS("nested_table_name");

                    sql.AppendLine($"{new string(' ', 4 * indentCount)}-- {columnTable.GetS("table_name")} {(isCurrent ? " -- CURRENT TABLE" : "")}");

                    foreach (var column in columnTable.GetL("columns"))
                    {
                        handler(nestedTableName, isCurrent, column);
                    }
                }

                sql.Length -= Environment.NewLine.Length + 1;
            }

            foreach (var currentTable in sourceTables)
            {
                var previousTableName = previousTable?.GetS("table_name") ?? config.GetS("merged_table_name");
                var firstMerge = previousTableName == config.GetS("merged_table_name");
                var currentTableName = currentTable.GetS("table_name");

                var tableName = $"import_merge_{previousTableName}_and_{currentTableName}_{partitionIndex}";

                var sql = new StringBuilder(@$"drop table if exists datasets.{tableName};");
                await ExecuteClickhouseQuery(sql.ToString());

                sql = new StringBuilder(@$"create table if not exists datasets.{tableName}
(
{combinedColumnDefinitions}
)
engine = MergeTree()
ORDER BY
{GetSelectList(config.GetL("key_columns"))}
SETTINGS index_granularity = 8192;");
                await ExecuteClickhouseQuery(sql.ToString());

                sql = new StringBuilder(@$"insert into datasets.{tableName}
(
{combinedColumnInsert}
)
select
{GetSelectList(config.GetL("key_columns"))},
");

                // Outer select
                ProcessSection(sql, currentTableName, (nestedTableName, isCurrent, column) =>
                {
                    var columnName = column.GetS("name");
                    var defaultValue = new Lazy<string>(() => GetDefaultValue(column.GetS("target_type")));

                    sql.AppendLine((nestedTableName, isCurrent, firstMerge) switch
                    {
                        (null, true, _) => $"    coalesce(max(z.{columnName}2), max(z.{columnName}1), {defaultValue.Value}) {columnName},",
                        (null, false, _) => $"    coalesce(max(z.{columnName}), {defaultValue.Value}) {columnName},",
                        (_, _, true) or (_, true, _) => $"    arrayFlatten(groupArray({columnName})) {columnName},",
                        (_, false, _) => $"    max({columnName}) {columnName},"
                    });
                });

                sql.AppendLine(@$"
from (
    select
    {GetSelectList(config.GetL("key_columns"))},");

                // Inner select from previous
                ProcessSection(sql, currentTableName, (nestedTableName, isCurrent, column) =>
                {
                    var columnName = column.GetS("name");

                    sql.AppendLine((nestedTableName, isCurrent, firstMerge) switch
                    {
                        (null, true, _) => $"        {columnName} {columnName}1,\r\n        NULL {columnName}2,",
                        (null, false, _) => $"        {columnName} {columnName},",
                        (_, _, _) => $"        {nestedTableName}.{columnName} {columnName},"
                    });
                }, 2);

                if (firstMerge)
                {
                    sql.Append(@$"
    from datasets.{previousTableName}
    where {partitionSelector} = '{partitionIndex}'
        and email != ''
    limit 100");
                }
                else
                {
                    sql.Append(@$"
    from datasets.{previousMergedTableName}");
                }

                sql.AppendLine($@"
    union all
    select
    { GetSelectList(config.GetL("key_columns"))},");

                // Inner select from current
                ProcessSection(sql, currentTableName, (nestedTableName, isCurrent, column) =>
                {
                    var columnName = column.GetS("name");

                    sql.AppendLine((nestedTableName, isCurrent, firstMerge) switch
                    {
                        (null, true, _) => $"        NULL {columnName}1,\r\n        {columnName} {columnName}2,",
                        (null, false, _) => $"        NULL {columnName},",
                        (_, true, _) => $"        `{nestedTableName}.{columnName}` {columnName},",
                        (_, false, _) => $"        [] {columnName},"
                    });
                }, 2);

                sql.AppendLine(@$"
    from datasets.import_{currentTableName}_{partitionIndex}
) z
group by 
{GetSelectList(config.GetL("key_columns"))};");

                await ExecuteClickhouseQuery(sql.ToString());

                previousTable = currentTable;
                previousMergedTableName = tableName;
            }

            return parameters with { MergedTableName = previousMergedTableName };
        }

        private async Task<Parameters> MergePartitionIntoFinalTable(Parameters parameters)
        {
            var config = parameters.Config;
            var mergedTableName = parameters.MergedTableName;

            var sourceTables = config.GetL("source_tables");
            var combinedColumnInsert = GetCombinedColumnInserts(config, sourceTables);

            var targetTableName = $"{config.GetS("merged_table_name")}_new";

            var sql = $@"insert into datasets.{targetTableName}
(
{combinedColumnInsert}
)
select
{combinedColumnInsert}
from datasets.{mergedTableName};";

            await ExecuteClickhouseQuery(sql);

            return parameters with { MergedTableName = null };
        }

        private Parameters GatherCompletedPartitions(Parameters parameters)
        {
            var config = parameters.Config;
            var partitionIndex = parameters.PartitionIndex;

            if (!_partitionCompletionProgress.TryAdd(partitionIndex, partitionIndex))
            {
                throw new InvalidOperationException($"Partition {partitionIndex} completed more than once");
            }

            if (_partitionCompletionProgress.Count == config.GetL("partitioning/partitions").Count())
            {
                return parameters with { PartitionIndex = null };
            }

            return default;
        }

        private async Task<Parameters> SwapMergedTable(Parameters parameters)
        {
            var config = parameters.Config;
            var targetTableName = $"{config.GetS("merged_table_name")}";

            var sql = $@"drop table if exists datasets.{targetTableName}_old;";
            await ExecuteClickhouseQuery(sql);

            sql = $@"rename table datasets.{targetTableName} to datasets.{targetTableName}_old;";
            await ExecuteClickhouseQuery(sql);

            sql = $@"rename table datasets.{targetTableName}_new to datasets.{targetTableName};";
            await ExecuteClickhouseQuery(sql);

            sql = $@"optimize table datasets.{targetTableName} final;";
            await ExecuteClickhouseQuery(sql);

            return parameters;
        }

        private async Task CleanupTempTables(Parameters parameters)
        {
            var config = parameters.Config;

            IGenericEntity previousTable = null;

            foreach (var table in config.GetL("source_tables"))
            {
                var previousTableName = previousTable?.GetS("table_name") ?? config.GetS("merged_table_name");
                var firstMerge = previousTableName == config.GetS("merged_table_name");

                var currentTableName = table.GetS("table_name");

                var sql = @$"drop table if exists datasets.import_{currentTableName};";

                await ExecuteClickhouseQuery(sql);

                foreach (var partition in config.GetL("partitioning/partitions"))
                {
                    var partitionIndex = partition.GetS("");
                    sql = @$"drop table if exists datasets.import_{currentTableName}_{partitionIndex}";

                    await ExecuteClickhouseQuery(sql);

                    sql = @$"drop table if exists datasets.import_merge_{previousTableName}_and_{currentTableName}_{partitionIndex}";

                    await ExecuteClickhouseQuery(sql);
                }

                previousTable = table;
            }
        }
        #endregion

        #region Helper Methods
        private Task DropEvent(object payload)
        {
            var edwBulkEvent = new EdwBulkEvent();

            edwBulkEvent.AddEvent(Guid.NewGuid(), DateTime.UtcNow, new Dictionary<Guid, (Guid rsId, DateTime rsTs)> { [_rsConfigId] = (_rsId, _rsTs) }, payload);

            return _fw.EdwWriter.Write(edwBulkEvent);
        }

        private async Task DropStartEvent(Parameters input, [CallerMemberName] string step = null)
        {
            var payload = new
            {
                job = input.Config.GetS("Name"),
                step,
                eventType = "Start",
                table = input.Table,
                partitionIndex = input.PartitionIndex
            };

            await _fw.Log($"{nameof(ClickhouseImport)}.{step}", JsonConvert.SerializeObject(payload));
            await DropEvent(payload);
        }

        private async Task DropEndEvent(Parameters input, TimeSpan elapsed, [CallerMemberName] string step = null)
        {
            var payload = new
            {
                job = input.Config.GetS("Name"),
                step,
                eventType = "End",
                table = input.Table,
                partitionIndex = input.PartitionIndex,
                elapsed = elapsed.TotalSeconds
            };

            await _fw.Log($"{nameof(ClickhouseImport)}.{step}", JsonConvert.SerializeObject(payload));
            await DropEvent(payload);
        }

        private async Task DropErrorEvent(Exception ex, Parameters input, [CallerMemberName] string step = null, bool alert = true)
        {
            var payload = new
            {
                job = input.Config.GetS("Name"),
                step,
                eventType = "Error",
                table = input.Table,
                partitionIndex = input.PartitionIndex,
                message = ex.ToString()
            };

            await _fw.Error($"{nameof(ClickhouseImport)}.{step}", JsonConvert.SerializeObject(payload));
            await DropEvent(payload);

            if (alert)
            {
                var text = $"Clickhouse Import - {input.Config.GetS("Name")} - ";

                void AddField(string fieldName, object field)
                {
                    if (field != default)
                    {
                        text += $"{fieldName}: {field} ";
                    }
                }

                AddField("Step", step);
                AddField("Table", input?.Table);
                AddField("PartitionIndex", input?.PartitionIndex);
                AddField("Error", ex.Message);

                await ProtocolClient.HttpPostAsync(_fw.StartupConfiguration.GetS("Config/SlackAlertUrl"), JsonConvert.SerializeObject(new
                {
                    text
                }), "application/json");
            }

        }

        private async Task<string> ExecuteClickhouseQuery(string query, string pipeIn = null)
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

            using var command = _client.CreateCommand(commandText);

            var result = await command.ExecuteAsync();

            if (!string.IsNullOrWhiteSpace(command.Error))
            {
                throw new ClickHouseException(command.Error);
            }

            return result;
        }

        private static Task<IGenericEntity> ExecutePostgresQuery(string connectionName, string functionName, object args)
        {
#if DEBUG
            Console.WriteLine($"{connectionName}:{functionName} {JsonConvert.SerializeObject(args)}");
#endif
            return Data.CallFn(connectionName, functionName, JsonConvert.SerializeObject(args), timeout: 600000);
        }

        private static string GetColumnDefinitions(IEnumerable<IGenericEntity> columns, string nestedTableName = null) => string.Join(",\r\n", columns.Select(c => GetColumnDefinition(c, nestedTableName)));

        private static string GetColumnDefinition(IGenericEntity columnConfig, string nestedTableName = null) => $"    {(nestedTableName != null ? $"`{nestedTableName}." : "")}{columnConfig.GetS("name")}{(nestedTableName != null ? "`" : "")} {(nestedTableName != null ? "Array(" : "")}{columnConfig.GetS("target_type")}{(nestedTableName != null ? ")" : "")}";

        private static string GetCombinedColumnDefinitions(IGenericEntity config, IEnumerable<IGenericEntity> sourceTables)
        {
            var combinedColumnDefinitionsBuilder = new StringBuilder();
            combinedColumnDefinitionsBuilder.Append(GetColumnDefinitions(config.GetL("key_columns")));
            combinedColumnDefinitionsBuilder.AppendLine(",");

            foreach (var table in sourceTables)
            {
                combinedColumnDefinitionsBuilder.AppendLine($"    -- {table.GetS("table_name")}");
                combinedColumnDefinitionsBuilder.AppendLine(GetColumnDefinitions(table.GetL("columns"), table.GetS("nested_table_name")) + ",");
            }
            var combinedColumnDefinitions = combinedColumnDefinitionsBuilder.ToString().TrimEnd(("," + Environment.NewLine).ToArray());
            return combinedColumnDefinitions;
        }

        private static string GetCombinedColumnInserts(IGenericEntity config, IEnumerable<IGenericEntity> sourceTables)
        {
            var combinedColumnInsertBuilder = new StringBuilder();
            combinedColumnInsertBuilder.Append(GetInsertList(config.GetL("key_columns")));
            combinedColumnInsertBuilder.AppendLine(",");
            foreach (var table in sourceTables)
            {
                combinedColumnInsertBuilder.AppendLine($"    -- {table.GetS("table_name")}");
                combinedColumnInsertBuilder.AppendLine(GetInsertList(table.GetL("columns"), table.GetS("nested_table_name")) + ",");
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

        private static string GetInsertList(IEnumerable<IGenericEntity> columns, string nestedTableName = null) => string.Join(",\r\n", columns.Select(c => InsertColumn(c, nestedTableName)));

        private static string GetSelectList(IEnumerable<IGenericEntity> columns, bool isArray = false) => string.Join(",\r\n", columns.Select(c => SelectColumn(c, isArray)));

        private static string InsertColumn(IGenericEntity columnConfig, string nestedTableName = null) => $"    {(nestedTableName != null ? $"`{nestedTableName}." : "")}{columnConfig.GetS("name")}{(nestedTableName != null ? "`" : "")}";

        private static string SelectColumn(IGenericEntity columnConfig, bool isArray = false) => isArray ? $"    groupArray({columnConfig.GetS("name")}) {columnConfig.GetS("name")}" : $"    {columnConfig.GetS("name")}";
        #endregion
    }
}