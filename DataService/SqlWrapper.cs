using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace DataService
{
    public class SqlWrapper
    {
        public static async Task<string> SqlServerProviderEntry(string conStr, string method, string args, string payload)
        {
            string ret = null;

            Dictionary<string, string> spMap = new Dictionary<string, string>()
            {
                { "SelectConfig", "[dbo].[spSelectConfig]" },
                { "LogPixelFire", "[TowerVisitorRedirectPixel].[spLogPixelFire]" },
                { "SelectOnMd5", "[TowerVisitorRedirectPixel].[spSelectOnMd5]" },
                { "AddNewTowerEmail", "[TowerVisitorRedirectPixel].[spAddNewTowerEmail]" },
                { "SaveOnPointConsoleLiveFeed", "[OnPointConsoleLiveFeed].[spSaveOnPointConsoleLiveFeed]" },
                { "TowerVisitorErrorLog", "[TowerVisitorRedirectPixel].[spInsertErrorLog]" },
                { "OnPointConsoleErrorLog", "[OnPointConsoleLiveFeed].[spInsertErrorLog]" }
            };

            string sp = null;
            spMap.TryGetValue(method, out sp);
            if (sp == null) return "";
            ret = await ExecuteSql(args, payload, sp, conStr);

            return ret;
        }

        public static async Task<string> ExecuteSql(string args, string payload, string sproc, string connectionString)
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
                cmd.CommandTimeout = 120;
                await cmd.ExecuteNonQueryAsync().ConfigureAwait(continueOnCapturedContext: false);
                outval = (string)cmd.Parameters["@Return"].Value;
                cn.Close();
            }

            return outval;
        }
    }
}
