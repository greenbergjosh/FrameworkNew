using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using System.Data.SqlClient;

namespace Utility
{
    public class SqlWrapper
    {
        public static Dictionary<string, string> spMap = new Dictionary<string, string>()
        {
            { "SelectConfig", "[dbo].[spSelectConfig]" }
        };

        public static async Task<IGenericEntity> Initialize(string conStr, string configKey)
        {
            string result = await SqlServerProviderEntry(conStr,
                                "SelectConfig",
                                JsonWrapper.Json(new { InstanceId = configKey }),
                                "");
            IGenericEntity gc = new GenericEntityJson();
            var gcstate = JsonConvert.DeserializeObject(result);
            gc.InitializeEntity(null, null, gcstate);

            foreach (var o in gc.GetL("Config/DataLayer"))
            {
                spMap.Add(o.GetS("n"), o.GetS("v"));
            }

            return gc;
        }

        public static async Task<string> SqlServerProviderEntry(string conStr, string method, string args, string payload, int timeout = 120)
        {
            string ret = null;

            string sp = null;
            spMap.TryGetValue(method, out sp);
            if (sp == null) return "";
            ret = await ExecuteSql(args, payload, sp, conStr, timeout);

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

        public static async Task<string> InsertErrorLog(string connectionString, int severity, string process, string method, string descriptor, string message, int timeout = 120)
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
    }
}
