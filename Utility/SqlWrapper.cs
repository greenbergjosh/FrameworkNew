using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;

namespace Utility
{
    public class SqlWrapper
    {
        public const string GlobalConfig = "GlobalConfig";

        // TODO: This should all be ConcurrentDictionary to become thread-safe
        public static Dictionary<string, string> Connections = new Dictionary<string, string>();
        public static Dictionary<string, Dictionary<string, string>> StoredProcedures = new Dictionary<string, Dictionary<string, string>>();

        public static async Task<IGenericEntity> Initialize(string conStr, string[] configKeys, string configSproc)
        {
            string confStr = null;

            try
            {
                confStr = (await GetConfigs(conStr, configSproc, configKeys)).Fold().ToString();

                var gc = JsonWrapper.JsonToGenericEntity(JsonWrapper.Json(new { Config = confStr }, new bool[] { false }));

                StoredProcedures.Add(GlobalConfig, new Dictionary<string, string>()
                {
                    { "SelectConfig", configSproc}
                });
                Connections.Add(GlobalConfig, conStr);

                foreach (var o in gc.GetD("Config/ConnectionStrings"))
                {
                    IGenericEntity gcon = JsonWrapper.JsonToGenericEntity(
                        JsonWrapper.Json(new
                        {
                            Config =
                            await ExecuteSql(JsonWrapper.Json(new { InstanceId = o.Item2 }), "",
                                configSproc, conStr)
                        }, new bool[] { false }));

                    if (!StoredProcedures.ContainsKey(o.Item1)) StoredProcedures.Add(o.Item1, new Dictionary<string, string>());
                    var spMap = StoredProcedures[o.Item1];
                    foreach (var sp in gcon.GetD("Config/DataLayer"))
                    {
                        spMap.Add(sp.Item1, sp.Item2);
                    }

                    Connections.Add(o.Item1, gcon.GetS("Config/ConnectionString"));
                }

                return gc;
            }
            catch (Exception e)
            {
                throw new Exception($"Failed to build {nameof(FrameworkWrapper)} ConfigKey: {configKeys?.Join("::") ?? "No instance key(s) defined"} Config: {confStr ?? "No Config Found"} Original Exception: {e.Message}", e);
            }
        }

        private static async Task<IEnumerable<JObject>> GetConfigs(string conStr, string configSproc, IEnumerable<string> configKeys)
        {
            var configs = new Dictionary<string, string>();

            foreach (var configKey in configKeys)
            {
                await GetConfigStrings(conStr, configSproc, configKey, configs);
            }

            return configs.Select(c => JObject.Parse(c.Value));
        }

        private static async Task<Dictionary<string, string>> GetConfigStrings(string conStr, string configSproc, string configKey, Dictionary<string, string> configs)
        {
            if (configs == null) configs = new Dictionary<string, string>();

            if (configs.ContainsKey(configKey)) return configs;

            /*
             * We should be able to clean this up if the configSproc could return a collection
             */
            var res = await ExecuteSql(JsonWrapper.Json(new { InstanceId = configKey }), "", configSproc, conStr);

            if (res.StartsWith("using "))
            {
                var usingListStartIndex = 6;
                var usingListLength = res.IndexOf("{") - usingListStartIndex;

                configs.AddRange(res
                    .Substring(usingListStartIndex, usingListLength).Split(",", StringSplitOptions.RemoveEmptyEntries)
                    .Select(async k => await GetConfigStrings(conStr, configSproc, k.Trim(), configs))
                    .SelectMany(c => c.Result)
                    .Select(c => (key: c.Key, value: c.Value))
                    .Where(c => !configs.ContainsKey(c.key))
                );
                configs.Add(configKey, res.Substring(usingListLength + usingListStartIndex).Trim());
            }
            else configs.Add(configKey, res);

            return configs;
        }

        public static async Task<IGenericEntity> SqlToGenericEntity(string conName, string method, string args, string payload, RoslynWrapper rw = null, object config = null, int timeout = 120)
        {
            string result = await SqlWrapper.SqlServerProviderEntry(Connections[conName], method, args, payload, timeout);
            IGenericEntity gp = new GenericEntityJson();
            var gpstate = JsonConvert.DeserializeObject(result);
            gp.InitializeEntity(rw, config, gpstate);
            return gp;
        }

        public static async Task<string> SqlServerProviderEntry(string conName, string method, string args, string payload, int timeout = 120)
        {
            string ret = null;

            string sp = null;
            StoredProcedures[conName].TryGetValue(method, out sp);
            if (sp == null) return "";
            ret = await ExecuteSql(args, payload, sp, Connections[conName], timeout);

            return ret;
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
