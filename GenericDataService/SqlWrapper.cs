using Utility;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Jw = Utility.JsonWrapper;

namespace GenericDataService
{
    public class SqlWrapper
    {
        public static Dictionary<string, string> spMap = new Dictionary<string, string>()
        {
            { "SelectConfig", "[dbo].[spSelectConfig]" }
        };

        public static async Task<IGenericEntity> Initialize(string conStr, string configKey)
        {
            string result = await SqlWrapper.SqlServerProviderEntry(conStr,
                                "SelectConfig",
                                Jw.Json(new { InstanceId = configKey }),
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
    }
}
