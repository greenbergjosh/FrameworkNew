using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Utility.Entity.Implementations;

namespace Utility.DataLayer
{
    public static class Data
    {
        public const string GlobalConfigConnName = "GlobalConfig";
        public const string ConfigFunctionName = "SelectConfig";

        private static readonly ConcurrentDictionary<string, Connection> Connections = new();
        private static Connection _configConn;
        private static string _configFunction;
        private static string[] _commandLineArgs;
        private static readonly List<(DateTime logTime, string location, string log)> _traceLog = new();
        private static Entity.Entity _entity;

        private static void TraceLog(string location, string log) => _traceLog.Add((DateTime.Now, location, log));

        public static IEnumerable<(DateTime logTime, string location, string log)> GetTrace() => _traceLog.AsEnumerable();

        public static async Task<Entity.Entity> Initialize(Entity.Entity entity, string connStr, string dataLayerType, string[] configKeys, string configFunction, string[] commandLineArgs)
        {
            TraceLog(nameof(Initialize), "Initializing");

            _entity = entity;
            _configFunction = configFunction;

            Entity.Entity config = null;

            try
            {
                _configConn = new Connection(GlobalConfigConnName, DataLayerClientFactory.DataStoreInstance(dataLayerType), connStr);
                _commandLineArgs = commandLineArgs;

                _ = _configConn.Functions.AddOrUpdate(ConfigFunctionName, configFunction, (key, current) => throw new Exception($"Failed to add {nameof(configFunction)}. {nameof(Data)}.{nameof(Initialize)} may have been called after it's already been initialized"));
                _ = Connections.AddOrUpdate(GlobalConfigConnName, _configConn, (key, current) => current);

                TraceLog(nameof(Initialize), $"{nameof(_configConn)}\r\n{JsonSerializer.Serialize(_configConn)}");

                config = await GetConfigs(configKeys, commandLineArgs);

                TraceLog(nameof(Initialize), $"{nameof(config)}\r\n{config}");

                await AddConnectionStrings(await config.EvalE("ConnectionStrings"));

                var appName = await config.EvalS("AppName");
                DataLayerClientFactory.AppName = appName;

                return config;
            }
            catch (Exception e)
            {
                throw new Exception($"Failed to build {nameof(FrameworkWrapper)} ConfigKey: {configKeys?.Join("::") ?? "No instance key(s) defined"} Config: {config?.ToString() ?? "No Config Found"} Original Exception: {e.Message}", e);
            }
        }

        public static async Task<Entity.Entity> Reinitialize(string[] configKeys)
        {
            TraceLog(nameof(Reinitialize), "Reinitializing");

            try
            {
                var config = await GetConfigs(configKeys, _commandLineArgs);

                await AddConnectionStrings(await config.EvalE("ConnectionStrings"), true);

                return config;
            }
            catch (Exception e)
            {
                TraceLog(nameof(Reinitialize), $"Reinitialize failed: {e.UnwrapForLog()}");
                return null;
            }
        }

        public static async Task AddConnectionStrings(Entity.Entity connectionStrings) => await AddConnectionStrings(connectionStrings, false);

        private static async Task<Entity.Entity> GetConfigRecordValue(string id, Connection configConn, string configFunc)
        {
            var confStr = await configConn.Client.CallStoredFunction(JsonSerializer.Serialize(new { InstanceId = id }), "{}", configFunc, configConn.ConnStr);
            var entity = await _entity.Parse("application/json", confStr);

            return entity;
        }

        private static async Task AddConnectionStrings(Entity.Entity connectionStrings, bool merge)
        {
            if (connectionStrings != null && connectionStrings.IsObject)
            {
                foreach (var item in await connectionStrings.EvalD<string>())
                {
                    if (Connections.ContainsKey(item.Key) && Connections[item.Key].Id == item.Value && !merge)
                    {
                        continue;
                    }

                    if (Connections.ContainsKey(item.Key) && !merge)
                    {
                        throw new Exception($"Caught attempt to replace existing connection config with different value for {item.Key}");
                    }

                    var conf = await GetConfigRecordValue(item.Value, _configConn, _configFunction);

                    var dataLayerType = await conf.EvalS("DataLayerType");
                    var connectionString = await conf.EvalS("ConnectionString");
                    var conn = Connections.GetOrAdd(item.Key, s => new Connection(item.Value, DataLayerClientFactory.DataStoreInstance(dataLayerType), connectionString));

                    foreach (var sp in await conf.EvalD<string>("DataLayer"))
                    {
                        _ = conn.Functions.AddOrUpdate(sp.Key, sp.Value, (key, current) => current != sp.Value && !merge
                                  ? throw new Exception($"Caught attempt to replace existing data layer config with different value for key: {sp.Key}, with existing value: {current}, new value: {sp.Value}")
                                  : sp.Value);
                    }
                }
            }
        }

        public static async Task<Entity.Entity> GetConfigs(IEnumerable<string> configKeys, string[] commandLineArgs = null, string confConnName = null, string confFuncName = null)
        {
            var loaded = new HashSet<string>();
            var configConn = confConnName == null ? _configConn : Connections.GetValueOrDefault(confConnName);
            var configFunc = confFuncName == null ? _configFunction : configConn?.Functions.GetValueOrDefault(confFuncName);

            if (configConn == null || configFunc == null)
            {
                throw new Exception($"Invalid config function definition: {confConnName ?? "[Default]"}::{confFuncName ?? "[Default]"}({configFunc ?? "null"})");
            }

            TraceLog(nameof(GetConfigs), $"Loading configs from {configConn}.{configFunc}");

            async Task LoadConfig(EntityDocumentStack config, string key)
            {
                key = key.ToLower();

                if (loaded.Contains(key))
                {
                    return;
                }

                TraceLog(nameof(GetConfigs), $"Loading config {key}");

                _ = loaded.Add(key);

                try
                {
                    var current = await GetConfigRecordValue(key, configConn, configFunc);
                    var usings = (await current.Eval("using")).FirstOrDefault();
                    var mergeConfig = current;

                    if (usings != null)
                    {
                        TraceLog(nameof(GetConfigs), $"Resolving usings for {key}\r\n{usings}");

                        foreach (var u in (await usings.EvalL<string>()).Select(u => u.Trim()))
                        {
                            await LoadConfig(config, u);
                        }

                        mergeConfig = _entity.Create(new
                        {
                            Id = await current.EvalS("$meta.id"),
                            Name = await current.EvalS("$meta.name"),
                            Type = await current.EvalS("$meta.type"),
                            Config = await current.EvalE("config", null)
                        });
                    }

                    TraceLog(nameof(GetConfigs), $"Merging configs\r\nCurrent\r\n{config}\r\n\r\n{key}\r\n{mergeConfig}");

                    config.Push(mergeConfig);

                    TraceLog(nameof(GetConfigs), $"Merged configs into\r\n{config}");
                }
                catch (Exception ex)
                {
                    throw new Exception($"Failed to merge config {key}. Exception: {ex.Message}", ex);
                }
            }

            var resolvedConfig = new EntityDocumentStack();
            foreach (var configKey in configKeys)
            {
                await LoadConfig(resolvedConfig, configKey);
            }

            if (commandLineArgs?.Any() == true)
            {
                TraceLog(nameof(GetConfigs), $"Overriding configs from command line:\r\n{JsonSerializer.Serialize(commandLineArgs)}");
                var commandLineConfig = new ConfigurationBuilder().AddCommandLine(commandLineArgs).Build();

                var commandLineDictionary = new Dictionary<string, string>(commandLineConfig.AsEnumerable());

                resolvedConfig.Push(_entity.Create(commandLineDictionary));
            }

            return _entity.Create(resolvedConfig);
        }

        public static async Task<Entity.Entity> CallFn(string conName, string method, object args, string payload = null, int timeout = 120)
        {
            var argsString = JsonSerializer.Serialize(args ?? new object());
            payload = payload.IfNullOrWhitespace("{}");
            var res = await CallFnString(conName, method, argsString, payload, timeout);

            return res.IsNullOrWhitespace() ? null : await _entity.Parse("application/json", res);
        }

        public static async Task<Entity.Entity> CallFn(string conName, string method, string args = null, string payload = null, int timeout = 120)
        {
            args = args.IfNullOrWhitespace("{}");
            payload = payload.IfNullOrWhitespace("{}");
            var res = await CallFnString(conName, method, args, payload, timeout);

            return res.IsNullOrWhitespace() ? null : await _entity.Parse("application/json", res);
        }

        public static Task<string> CallFnString(string conName, string method, string args, string payload, int timeout = 120)
        {
            try
            {
                var conn = Connections.GetValueOrDefault(conName) ?? throw new ArgumentException($"Unknown connection name {conName}.", nameof(conName));

                var sp = conn.Functions.GetValueOrDefault(method);

                return sp.IsNullOrWhitespace()
                    ? Task.FromResult<string>(null)
                    : conn.Client.CallStoredFunction(args, payload, sp, conn.ConnStr, timeout);
            }
            catch (Exception e)
            {
                throw new Exception($"Failed {nameof(CallFnString)}({conName}, {method}, {args}, {payload})", e);
            }
        }

        public static bool ContainsFunction(string connectionName, string method) => Connections.TryGetValue(connectionName, out var connection) && connection.Functions.ContainsKey(method);

        private class Connection
        {
            public Connection(string id, IDataLayerClient client, string connStr)
            {
                Id = id;
                Client = client;
                ConnStr = connStr;
            }

            public string Id { get; }
            [JsonIgnore]
            public IDataLayerClient Client { get; }
            public string ConnStr { get; }
            public ConcurrentDictionary<string, string> Functions { get; } = new ConcurrentDictionary<string, string>();
        }
    }
}
