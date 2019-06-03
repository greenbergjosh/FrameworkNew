using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace Utility.DataLayer
{
    public static class Data
    {
        public const string GlobalConfigConnName = "GlobalConfig";
        public const string ConfigFunctionName = "SelectConfig";

        // TODO: This should all be ConcurrentDictionary to become thread-safe
        private static readonly ConcurrentDictionary<string, Connection> Connections = new ConcurrentDictionary<string, Connection>();
        private static Connection _configConn;
        private static string _configFunction;
        private static List<(DateTime logTime, string location, string log)> _traceLog = new List<(DateTime logTime, string location, string log)>();

        private static void TraceLog(string location, string log) => _traceLog.Add((DateTime.Now, location, log));

        public static IEnumerable<(DateTime logTime, string location, string log)> GetTrace() => _traceLog.AsEnumerable();

        public static async Task<IGenericEntity> Initialize(string connStr, string dataLayerType, string[] configKeys, string configFunction, string[] commandLineArgs)
        {
            string configStr = null;

            _configFunction = configFunction;

            TraceLog(nameof(Initialize), "Initializing");

            try
            {
                _configConn = new Connection(GlobalConfigConnName, DataLayerClientFactory.DataStoreInstance(dataLayerType), connStr);

                _configConn.Functions.AddOrUpdate(ConfigFunctionName, configFunction, (key, current) => throw new Exception($"Failed to add {nameof(configFunction)}. {nameof(Data)}.{nameof(Initialize)} may have been called after it's already been initialized"));
                Connections.AddOrUpdate(GlobalConfigConnName, _configConn, (key, current) => current);

                TraceLog(nameof(Initialize), $"{nameof(_configConn)}\r\n{Jw.Serialize(_configConn)}");

                configStr = await GetConfigs(configKeys, commandLineArgs);

                TraceLog(nameof(Initialize), $"{nameof(configStr)}\r\n{configStr}");

                var gc = Jw.JsonToGenericEntity(Jw.Json(new { Config = configStr }, new bool[] { false }));

                if (!gc.GetS("Config/ConnectionStrings").IsNullOrWhitespace()) await AddConnectionStrings(gc.GetD("Config/ConnectionStrings"));

                return gc;
            }
            catch (Exception e)
            {
                throw new Exception($"Failed to build {nameof(FrameworkWrapper)} ConfigKey: {configKeys?.Join("::") ?? "No instance key(s) defined"} Config: {configStr ?? "No Config Found"} Original Exception: {e.Message}", e);
            }
        }

        public static async Task AddConnectionStrings(IEnumerable<Tuple<string, string>> connectionStrings)
        {
            foreach (var o in connectionStrings)
            {
                if (Connections.ContainsKey(o.Item1) && Connections[o.Item1].Id == o.Item2)
                {
                    continue;
                }

                if (Connections.ContainsKey(o.Item1))
                {
                    throw new Exception($"Caught attempt to replace existing connection config with different value for {o.Item1}");
                }

                var conf = Jw.JsonToGenericEntity(await _configConn.Client.CallStoredFunction(Jw.Json(new { InstanceId = o.Item2 }), "{}", _configFunction, _configConn.ConnStr));
                var conn = Connections.AddOrUpdate(o.Item1, new Connection(o.Item2, DataLayerClientFactory.DataStoreInstance(conf.GetS("DataLayerType")), conf.GetS("ConnectionString")), (key, current) => current);

                foreach (var sp in conf.GetD("DataLayer"))
                {
                    conn.Functions.AddOrUpdate(sp.Item1, sp.Item2, (key, current) =>
                    {
                        if (current != sp.Item2)
                        {
                            throw new Exception($"Caught attempt to replace existing data layer config with different value for key: {sp.Item1}, with existing value: {current}, new value: {sp.Item2}");
                        }

                        return current;
                    });
                }
            }
        }

        public static async Task<string> GetConfigs(IEnumerable<string> configKeys, string[] commandLineArgs = null, string confConnName = null, string confFuncName = null)
        {
            var loaded = new HashSet<string>();
            var configConn = confConnName == null ? _configConn : Connections.GetValueOrDefault(confConnName);
            var configFunc = confFuncName == null ? _configFunction : configConn?.Functions.GetValueOrDefault(confFuncName);

            if (configConn == null || configFunc == null)
            {
                throw new Exception($"Invalid config function definition: {confConnName ?? "[Default]"}::{confFuncName ?? "[Default]"}({configFunc ?? "null"})");
            }

            TraceLog(nameof(GetConfigs), $"Loading configs from {configConn}.{configFunc}");

            async Task<JObject> LoadConfig(JObject config, string key)
            {
                // this is not important for the DB, but it is for the local cache.
                // ToDo: We should change it to GUID and that would solve it but not sure if that might break something
                key = key.ToLower();

                if (loaded.Contains(key))
                {
                    return config;
                }

                TraceLog(nameof(GetConfigs), $"Loading config {key}");

                loaded.Add(key);

                try
                {
                    var confStr = await configConn.Client.CallStoredFunction(Jw.Json(new { InstanceId = key }), "{}", configFunc, configConn.ConnStr);
                    var c = JObject.Parse(confStr);
                    JObject mergeConfig = null;

                    if (c["using"] is JArray usng)
                    {

                        TraceLog(nameof(GetConfigs), $"Resolving usings for {key}\r\n{usng}");

                        await usng.Select(u => ((string)u).Trim())
                            .Where(u => !loaded.Contains(u))
                            .AggregateAsync(config, async (cf, k) => await LoadConfig(cf, k));

                        mergeConfig = c["config"] as JObject;
                    }
                    else
                    {
                        mergeConfig = c;
                    }

                    TraceLog(nameof(GetConfigs), $"Merging configs\r\nCurrent\r\n{config}\r\n\r\n{key}\r\n{mergeConfig}");

                    MergeConfigs(config, mergeConfig);

                    TraceLog(nameof(GetConfigs), $"Merged configs into\r\n{config}");

                    return config;
                }
                catch (Exception ex)
                {
                    throw new Exception($"Failed to merge config {key}. Exception: {ex.Message}", ex);
                }
            }

            var resolvedConfig = await configKeys.AggregateAsync(new JObject(), async (c, k) => await LoadConfig(c, k));

            if (commandLineArgs?.Any() == true)
            {
                TraceLog(nameof(GetConfigs), $"Overriding configs from command line:\r\n{Jw.Serialize(commandLineArgs)}");
                var commandLineConfig = new ConfigurationBuilder().AddCommandLine(commandLineArgs).Build();

                foreach (var kvp in commandLineConfig.AsEnumerable())
                {
                    resolvedConfig[kvp.Key] = kvp.Value;
                }
            }

            return resolvedConfig.ToString();
        }

        private static void MergeConfigs(JObject config, JObject mergeConfig)
        {
            if (mergeConfig == null)
            {
                return;
            }

            var mergeRoot = mergeConfig.Parent == null ? mergeConfig : (JObject)mergeConfig.DeepClone();

            var paths = FindRemovePaths(mergeRoot);

            paths.ForEach(p =>
            {
                var prop = ((JObject)mergeRoot.SelectToken(p.path)).Property(p.propName);
                var newToken = new JProperty(prop.Name.Remove(0, 1), prop.Value);

                prop.Value.Parent.Replace(newToken);
            });

            paths.ForEach(p => ((JObject)config.SelectToken(p.path))?.Remove(p.propName.Remove(0, 1)));

            config.Merge(mergeRoot);
        }

        private static IEnumerable<(string path, string propName)> FindRemovePaths(JObject root)
        {
            var paths = new List<(string path, string propName)>();

            foreach (var prop in root.Properties())
            {
                if (prop.Name.StartsWith("~"))
                {
                    paths.Add((prop.Parent.Path, prop.Name));
                }

                if (prop.Value is JObject jo)
                {
                    paths.AddRange(FindRemovePaths(jo));
                }
                else if (prop.Value is JArray ja)
                {
                    paths.AddRange(FindRemovePaths(ja));
                }
            }

            return paths;
        }

        private static IEnumerable<(string path, string propName)> FindRemovePaths(JArray root)
        {
            var paths = new List<(string path, string propName)>();

            foreach (var jai in root.Children())
            {
                if (jai is JObject jo)
                {
                    paths.AddRange(FindRemovePaths(jo));
                }
                else if (jai is JArray ja)
                {
                    paths.AddRange(FindRemovePaths(ja));
                }
            }

            return paths;
        }

        public static Task<List<Dictionary<string, object>>> CallFn(string conName, string method, Dictionary<string, object> parameters, int timeout = 120)
        {
            try
            {
                var conn = Connections.GetValueOrDefault(conName);
                var sp = conn?.Functions.GetValueOrDefault(method);

                if (sp.IsNullOrWhitespace())
                {
                    return Task.FromResult<List<Dictionary<string, object>>>(null);
                }

                return conn.Client.CallStoredFunction(parameters, sp, conn.ConnStr, timeout);
            }
            catch (Exception e)
            {
                throw new Exception($"Failed {nameof(CallFnString)}({conName}, {method}, {Jw.Serialize(parameters)})", e);
            }
        }

        public static async Task<IGenericEntity> CallFn(string conName, string method, string args = null, string payload = null, RoslynWrapper rw = null, object config = null, int timeout = 120)
        {
            args = args.IfNullOrWhitespace(Jw.Empty);
            payload = payload.IfNullOrWhitespace(Jw.Empty);
            var res = await CallFnString(conName, method, args, payload, timeout);

            return res.IsNullOrWhitespace() ? null : Jw.JsonToGenericEntity(res);
        }

        public static Task<string> CallFnString(string conName, string method, string args, string payload, int timeout = 120)
        {
            try
            {
                var conn = Connections.GetValueOrDefault(conName);
                var sp = conn?.Functions.GetValueOrDefault(method);

                if (sp.IsNullOrWhitespace())
                {
                    return Task.FromResult<string>(null);
                }

                return conn.Client.CallStoredFunction(args, payload, sp, conn.ConnStr, timeout);
            }
            catch (Exception e)
            {
                throw new Exception($"Failed {nameof(CallFnString)}({conName}, {method}, {args}, {payload})", e);
            }
        }

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
