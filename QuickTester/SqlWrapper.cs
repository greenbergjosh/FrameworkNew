using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace QuickTester
{
    public class SqlWrapper
    {
        public static async Task<string> SqlServerProviderEntry(string conStr, string method, string args, string payload, int timeout = 120)
        {
            string ret = null;

            Dictionary<string, string> spMap = new Dictionary<string, string>()
            {
                { "SelectConfig", "[dbo].[spSelectConfig]" },
                { "CreateCampaign", "[TowerVisitorRedirectPixel].[spLogPixelFire]" },
                { "GetCampaignTemplates", "[TowerVisitorRedirectPixel].[spSelectOnMd5]" },
                { "AddNewTowerEmail", "[TowerVisitorRedirectPixel].[spAddNewTowerEmail]" },
                { "SaveOnPointConsoleLiveFeed", "[OnPointConsoleLiveFeed].[spSaveOnPointConsoleLiveFeed]" },
                { "TowerVisitorErrorLog", "[TowerVisitorRedirectPixel].[spInsertErrorLog]" },
                { "OnPointConsoleErrorLog", "[OnPointConsoleLiveFeed].[spInsertErrorLog]" },
                { "SaveOnPointConsoleLiveEmailEvent", "[OnPointConsoleLiveFeed].[spSaveOnPointConsoleLiveEmailEvent]" },
                { "InsertImpression", "[VisitorId].[spInsertImpression]" },
                { "Md5ToLegacyEmail", "[VisitorId].[spMd5ToLegacyEmail]" },
                { "VisitorIdErrorLog", "[VisitorId].[spInsertErrorLog]" },
                { "GetEmailFromMd5", "[VisitorId].[spGetEmailFromMd5]" },
                { "SelectProvider", "[VisitorId].[spSelectProvider]" }
            };

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
