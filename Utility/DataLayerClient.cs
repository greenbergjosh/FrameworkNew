using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Utility
{
    public abstract class DataLayerClient
    {

        public abstract string GlobalConfig { get; }
        // TODO: This should all be ConcurrentDictionary to become thread-safe

        Dictionary<string, (string Id, DataLayerClient Client, string ConnStr)> Connections = new Dictionary<string, (string Id, DataLayerClient Client, string ConnStr)>();
        Dictionary<string, Dictionary<string, string>> StoredFunctions = new Dictionary<string, Dictionary<string, string>>();

        private string _configConnStr;
        private string _configFunction;

        public async Task<IGenericEntity> Initialize(string connStr, string[] configKeys, string configFunction )
        {
            string configStr = null;

            _configConnStr = connStr;
            _configFunction = configFunction;

            try
            {
                StoredFunctions.Add(GlobalConfig, new Dictionary<string, string>()
                {
                    { "SelectConfig", _configFunction}
                });
                Connections.Add(GlobalConfig, (Id: GlobalConfig, Client: this, ConnStr: _configConnStr));

                configStr = await GetConfigs(configKeys);

                var gc = JsonWrapper.JsonToGenericEntity(JsonWrapper.Json(new { Config = configStr }, new bool[] { false }));

                await AddConnectionStrings(gc.GetD("Config/ConnectionStrings"));

                return gc;
            }
            catch (Exception e)
            {
                throw new Exception($"Failed to build {nameof(FrameworkWrapper)} ConfigKey: {configKeys?.Join("::") ?? "No instance key(s) defined"} Config: {configStr ?? "No Config Found"} Original Exception: {e.Message}", e);
            }
        }

        public async Task AddConnectionStrings(IEnumerable<Tuple<string, string>> connectionStrings)
        {
            foreach (var o in connectionStrings)
            {
                if (Connections.ContainsKey(o.Item1) && Connections[o.Item1].Id == o.Item2) continue;
                else if (Connections.ContainsKey(o.Item1)) throw new Exception($"Caught attempt to replace existing connection config with different value for {o.Item1}");

                var gcon = JsonWrapper.JsonToGenericEntity(
                    JsonWrapper.Json(new
                    {
                        Config = await CallStoredFunction(JsonWrapper.Json(new { InstanceId = o.Item2 }), "{}", _configFunction, _configConnStr)
                    }, new bool[] { false }));

                var spMap = new Dictionary<string, string>();

                StoredFunctions.Add(o.Item1, spMap);

                foreach (var sp in gcon.GetD("Config/DataLayer"))
                {
                    if (spMap.ContainsKey(sp.Item1) && spMap[sp.Item1] == sp.Item2) continue;
                    else if (spMap.ContainsKey(sp.Item1)) throw new Exception($"Caught attempt to replace existing data layer config with different value for key: {sp.Item1}, with existing value: {spMap[sp.Item1]}, new value: {sp.Item2}");
                    spMap.Add(sp.Item1, sp.Item2);
                }


                Connections.Add(o.Item1, (Id: o.Item2, Client: DataLayerClientFactory.DataStoreInstance(gcon.GetS("Config/DataLayerType")),  ConnStr: gcon.GetS("Config/ConnectionString")));
            }
        }

        private async Task<string> GetConfigs(IEnumerable<string> configKeys)
        {
            var loaded = new HashSet<string>();

            async Task<JObject> LoadConfig(JObject config, string key)
            {
                if (loaded.Contains(key)) return config;

                loaded.Add(key);

                try
                {
                    var confStr = await CallStoredFunction(JsonWrapper.Json(new { InstanceId = key }), "{}", _configFunction, _configConnStr);
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

        // TODO: Can't this just be a GenericEntity helper function?
        public async Task<IGenericEntity> GenericEntityFromEntry(string conName, string method, string args, string payload, RoslynWrapper rw = null, object config = null, int timeout = 120)
        {
            string result = await RetrieveEntry(conName, method, args, payload, timeout);
            IGenericEntity gp = new GenericEntityJson();
            var gpstate = JsonConvert.DeserializeObject(result);
            gp.InitializeEntity(rw, config, gpstate);
            return gp;
        }

        public async Task<string> RetrieveEntry(string conName, string method, string args, string payload, int timeout = 120)
        {
            try
            {
                string ret = null;
                string sp = null;
                var connSprocs = StoredFunctions[conName];

                connSprocs.TryGetValue(method, out sp);
                if (sp == null) return "";
                ret = await CallStoredFunction(args, payload, sp, Connections[conName].ConnStr, timeout);

                return ret;
            }
            catch (Exception e)
            {
                throw new Exception($"Failed {nameof(CallStoredFunction)}({conName}, {method}, {args}, {payload})", e);
            }
        }

        virtual public Task<string> CallStoredFunction(string args, string payload, string sproc, string connectionString, int timeout = 120)
        {
            throw new NotImplementedException();
        }


        virtual public Task<string> InsertEdwPayload(string connectionString, string payload, int timeout = 120, byte debug = 0)
        {
            throw new NotImplementedException();
        }


        virtual public Task<string> InsertErrorLog(string connectionString, int sequence, int severity,
            string process, string method, string descriptor, string message, int timeout = 120)
        {
            throw new NotImplementedException();
        }


        virtual public Task<string> InsertPostingQueue(string connectionString, string postType,
            DateTime postDate, string payload, int timeout = 120)
        {
            throw new NotImplementedException();
        }
    }

}
