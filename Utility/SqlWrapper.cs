using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using Newtonsoft.Json.Linq;

namespace Utility
{
    public class SqlWrapper
    {
        public const string GlobalConfig = "GlobalConfig";

        // TODO: This should all be ConcurrentDictionary to become thread-safe
        public static Dictionary<string, (string Id, string ConnStr)> Connections = new Dictionary<string, (string Id, string ConnStr)>();
        public static Dictionary<string, Dictionary<string, string>> StoredProcedures = new Dictionary<string, Dictionary<string, string>>();
        private static string _configConnStr;
        private static string _configSproc;

        public static async Task<IGenericEntity> Initialize(string connStr, string[] configKeys, string configSproc)
        {
            string configStr = null;

            _configConnStr = connStr;
            _configSproc = configSproc;

            try
            {
                StoredProcedures.Add(GlobalConfig, new Dictionary<string, string>()
                {
                    { "SelectConfig", _configSproc}
                });
                Connections.Add(GlobalConfig, (Id: GlobalConfig, ConnStr: _configConnStr));

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

        public static async Task AddConnectionStrings(IEnumerable<Tuple<string, string>> connectionStrings)
        {
            foreach (var o in connectionStrings)
            {
                if (Connections.ContainsKey(o.Item1) && Connections[o.Item1].Id == o.Item2) continue;
                else if (Connections.ContainsKey(o.Item1)) throw new Exception($"Caught attempt to replace existing connection config with different value for {o.Item1}");

                var gcon = JsonWrapper.JsonToGenericEntity(
                    JsonWrapper.Json(new
                    {
                        Config = await ExecuteSql(JsonWrapper.Json(new { InstanceId = o.Item2 }), "", _configSproc, _configConnStr)
                    }, new bool[] { false }));

                var spMap = new Dictionary<string, string>();

                StoredProcedures.Add(o.Item1, spMap);

                foreach (var sp in gcon.GetD("Config/DataLayer"))
                {
                    spMap.Add(sp.Item1, sp.Item2);
                }

                Connections.Add(o.Item1, (Id: o.Item2, ConnStr: gcon.GetS("Config/ConnectionString")));
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
                    var confStr = await ExecuteSql(JsonWrapper.Json(new { InstanceId = key }), "", _configSproc, _configConnStr);
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

        public static async Task<IGenericEntity> SqlToGenericEntity(string conName, string method, string args, string payload, RoslynWrapper rw = null, object config = null, int timeout = 120)
        {
            string result = await SqlWrapper.SqlServerProviderEntry(conName, method, args, payload, timeout);
            IGenericEntity gp = new GenericEntityJson();
            var gpstate = JsonConvert.DeserializeObject(result);
            gp.InitializeEntity(rw, config, gpstate);
            return gp;
        }

        public static async Task<string> SqlServerProviderEntry(string conName, string method, string args, string payload, int timeout = 120)
        {
            try
            {
                string ret = null;
                string sp = null;
                var connSprocs = StoredProcedures[conName];

                connSprocs.TryGetValue(method, out sp);
                if (sp == null) return "";
                ret = await ExecuteSql(args, payload, sp, Connections[conName].ConnStr, timeout);

                return ret;
            }
            catch (Exception e)
            {
                throw new Exception($"Failed {nameof(ExecuteSql)}({conName}, {method}, {args}, {payload})\n\nStoredProcs: {StoredProcedures.Keys.Join("\n")}", e);
            }
        }

        public static async Task<string> ExecuteSql(string args, string payload, string sproc, string connectionString, int timeout = 120)
        {
            string outval = null;

            using (SqlConnection cn = new SqlConnection(connectionString))
            {
                cn.Open();
                SqlCommand cmd = cn.CreateCommand();
                cmd.CommandText = sproc;
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.Add(new SqlParameter("@Args", args));
                cmd.Parameters.Add(new SqlParameter("@Payload", payload));
                cmd.Parameters.Add("@Return", System.Data.SqlDbType.NVarChar, -1)
                    .Direction = System.Data.ParameterDirection.Output;
                cmd.CommandTimeout = timeout;
                await cmd.ExecuteNonQueryAsync().ConfigureAwait(continueOnCapturedContext: false);
                outval = (string)cmd.Parameters["@Return"].Value;
                cn.Close();
            }

            return outval;
        }

        public static async Task<string> InsertEdwPayload(string connectionString, string payload, int timeout = 120, byte debug = 0)
        {
            string outval = null;

            try
            {
                using (SqlConnection cn = new SqlConnection(connectionString))
                {
                    cn.Open();
                    SqlCommand cmd = cn.CreateCommand();
                    cmd.CommandText = "[Data].[p_submit_bulk_payload]";
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add(new SqlParameter("@Payload", payload));
                    cmd.Parameters.Add(new SqlParameter("@Debug", debug));
                    cmd.Parameters.Add("@Return", System.Data.SqlDbType.NVarChar, -1)
                        .Direction = System.Data.ParameterDirection.Output;
                    cmd.CommandTimeout = timeout;
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                    outval = (string)cmd.Parameters["@Return"].Value;
                    cn.Close();
                }
            }
            catch (System.Data.SqlClient.SqlException sqlex)
            {
                if (sqlex.Message.Contains("Timeout") ||
                    sqlex.Message.Contains("login failed")
                    ) outval = "Walkaway";
            }
            catch (Exception ex)
            {
                outval = $"Exception::{ex.ToString()}";
            }

            return outval;
        }

        public static async Task<string> InsertErrorLog(string connectionString, int sequence, int severity,
            string process, string method, string descriptor, string message, int timeout = 120)
        {
            string outval = null;

            try
            {
                using (SqlConnection cn = new SqlConnection(connectionString))
                {
                    cn.Open();
                    SqlCommand cmd = cn.CreateCommand();
                    cmd.CommandText = "[ErrorLog].[spInsertErrorLog]";
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add(new SqlParameter("Sequence", sequence));
                    cmd.Parameters.Add(new SqlParameter("Severity", severity));
                    cmd.Parameters.Add(new SqlParameter("Process", process));
                    cmd.Parameters.Add(new SqlParameter("Method", method));
                    cmd.Parameters.Add(new SqlParameter("Descriptor", descriptor));
                    cmd.Parameters.Add(new SqlParameter("Message", message));
                    cmd.Parameters.Add("@Return", System.Data.SqlDbType.NVarChar, -1)
                        .Direction = System.Data.ParameterDirection.Output;
                    cmd.CommandTimeout = timeout;
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                    outval = (string)cmd.Parameters["@Return"].Value;
                    cn.Close();
                }
            }
            catch (System.Data.SqlClient.SqlException sqlex)
            {
                if (sqlex.Message.Contains("Timeout") ||
                    sqlex.Message.Contains("login failed")
                    ) outval = "Walkaway";
            }
            catch (Exception ex)
            {
                outval = $"Exception::{ex.ToString()}";
            }

            return outval;
        }

        // spInsertPostingQueue
        public static async Task<string> InsertPostingQueue(string connectionString, string postType,
            DateTime postDate, string payload, int timeout = 120)
        {
            string outval = null;

            try
            {
                using (SqlConnection cn = new SqlConnection(connectionString))
                {
                    cn.Open();
                    SqlCommand cmd = cn.CreateCommand();
                    cmd.CommandText = "[PostingQueue].[spInsertPostingQueue]";
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add(new SqlParameter("PostType", postType));
                    cmd.Parameters.Add(new SqlParameter("PostDate", postDate));
                    cmd.Parameters.Add(new SqlParameter("Payload", payload));
                    cmd.Parameters.Add("@Return", System.Data.SqlDbType.NVarChar, -1)
                        .Direction = System.Data.ParameterDirection.Output;
                    cmd.CommandTimeout = timeout;
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                    outval = (string)cmd.Parameters["@Return"].Value;
                    cn.Close();
                }
            }
            catch (System.Data.SqlClient.SqlException sqlex)
            {
                if (sqlex.Message.Contains("Timeout") ||
                    sqlex.Message.Contains("login failed")
                    ) outval = "Walkaway";
            }
            catch (Exception ex)
            {
                outval = $"Exception::{ex.ToString()}";
            }

            return outval;
        }
    }
}
