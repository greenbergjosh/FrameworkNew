using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
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

        public static async Task<IGenericEntity> Initialize(string connStr, string dataLayerType, string[] configKeys, string configFunction)
        {
            string configStr = null;

            _configFunction = configFunction;

            try
            {
                _configConn = new Connection(GlobalConfigConnName, DataLayerClientFactory.DataStoreInstance(dataLayerType), connStr);

                _configConn.Functions.AddOrUpdate(ConfigFunctionName, configFunction, (key, current) => throw new Exception($"Failed to add {nameof(configFunction)}. {nameof(Data)}.{nameof(Initialize)} may have been called after it's already been initialized"));
                Connections.AddOrUpdate(GlobalConfigConnName, _configConn, (key, current) => current);

                configStr = await GetConfigs(configKeys);

                var gc = Jw.JsonToGenericEntity(Jw.Json(new { Config = configStr }, new bool[] { false }));

                await AddConnectionStrings(gc.GetD("Config/ConnectionStrings"));

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
                if (Connections.ContainsKey(o.Item1) && Connections[o.Item1].Id == o.Item2) continue;

                if (Connections.ContainsKey(o.Item1)) throw new Exception($"Caught attempt to replace existing connection config with different value for {o.Item1}");

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

        private static async Task<string> GetConfigs(IEnumerable<string> configKeys)
        {
            var loaded = new HashSet<string>();

            async Task<JObject> LoadConfig(JObject config, string key)
            {
                if (loaded.Contains(key)) return config;

                loaded.Add(key);

                try
                {
                    var confStr = await _configConn.Client.CallStoredFunction(Jw.Json(new { InstanceId = key }), "{}", _configFunction, _configConn.ConnStr);
                    var c = JObject.Parse(confStr);

                    if (c["using"] != null)
                    {
                        await ((JArray)c["using"])
                            .Select(u => ((string)u).Trim())
                            .Where(u => !loaded.Contains(u))
                            .AggregateAsync(config, async (cf, k) => await LoadConfig(cf, k));

                        if (c["config"] != null) config.Merge(c["config"]);
                    }
                    else config.Merge(c);

                    return config;
                }
                catch (Exception ex)
                {
                    throw new Exception($"Failed to merge config {key}. Exception: {ex.Message}", ex);
                }
            }

            return (await configKeys.AggregateAsync(new JObject(), async (c, k) => await LoadConfig(c, k))).ToString();
        }

        public static async Task<IGenericEntity> CallFn(string conName, string method, string args, string payload, RoslynWrapper rw = null, object config = null, int timeout = 120)
        {
            var res = await CallFnString(conName, method, args, payload, timeout);

            return res.IsNullOrWhitespace() ? null : Jw.JsonToGenericEntity(res);
        }

        public static async Task<string> CallFnString(string conName, string method, string args, string payload, int timeout = 120)
        {
            try
            {
                var conn = Connections.GetValueOrDefault(conName);
                var sp = conn?.Functions.GetValueOrDefault(method);

                if (sp.IsNullOrWhitespace()) return null;

                return await conn.Client.CallStoredFunction(args, payload, sp, conn.ConnStr, timeout);
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
            public IDataLayerClient Client { get; }
            public string ConnStr { get; }
            public ConcurrentDictionary<string, string> Functions { get; } = new ConcurrentDictionary<string, string>();
        }
    }
}
