﻿using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using System.Threading.Tasks;

namespace UnsubLib
{
    public class SqlWrapper
    {
        public static async Task<string> SqlServerProviderEntry(string conStr, string method, string args, string payload)
        {
            string ret = null;
            
            Dictionary<string, string> spMap = new Dictionary<string, string>()
            {
                { "MergeNetworkCampaigns", "[dbo].[spMergeNetworkCampaigns]" },
                { "SelectNetwork", "[dbo].[spSelectNetwork]" },
                { "SelectConfig" , "[dbo].[spSelectConfig]" },
                { "UpdateNetworkCampaignsUnsubFiles" , "[dbo].[spUpdateNetworkCampaignsUnsubFiles]" },
                { "UploadDomainUnsubFile" , "[dbo].[spUploadDomainUnsubFile]" },
                { "PostProcessDiffFile" , "[dbo].[spPostProcessDiffFile]" },
                { "SelectNetworkCampaignsWithPayload" , "[dbo].[spSelectNetworkCampaignsWithPayload]" },
                { "SelectNetworkCampaigns" , "[dbo].[spSelectNetworkCampaigns]" },
                { "SelectNetworkCampaign" , "[dbo].[spSelectNetworkCampaign]" },
                { "MergeNetworkCampaignsManual" , "[dbo].[spMergeNetworkCampaignsManual]" }
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

        public static async Task InsertErrorLog(string connectionString, int severity, string process, string method, string descriptor, string message)
        {
            try
            {
                SqlConnection cn = new SqlConnection(connectionString);
                cn.Open();
                SqlCommand cmd = cn.CreateCommand();
                cmd.CommandText = "[dbo].[spInsertErrorLog]";
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.Add(new SqlParameter("Severity", severity));
                cmd.Parameters.Add(new SqlParameter("Process", process));
                cmd.Parameters.Add(new SqlParameter("Method", method));
                cmd.Parameters.Add(new SqlParameter("Descriptor", descriptor));
                cmd.Parameters.Add(new SqlParameter("Message", message));

                cmd.CommandTimeout = 120;
                await cmd.ExecuteNonQueryAsync().ConfigureAwait(continueOnCapturedContext: false);
                cn.Close();
            }
            catch (Exception ex)
            {
                int i = 1;
            }

        }

        public static async Task CreateSsisTables(string connectionString, string tableName)
        {
            SqlConnection cn = new SqlConnection(connectionString);
            cn.Open();
            SqlCommand cmd = cn.CreateCommand();
            cmd.CommandText = "[dbo].[spCreateSsisTables]";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(new SqlParameter("TableName", tableName));

            cmd.CommandTimeout = 120;
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(continueOnCapturedContext: false);
            cn.Close();
        }

        public static async Task DropSsisTables(string connectionString, string tableName)
        {
            SqlConnection cn = new SqlConnection(connectionString);
            cn.Open();
            SqlCommand cmd = cn.CreateCommand();
            cmd.CommandText = "[dbo].[spDropSsisTables]";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(new SqlParameter("TableName", tableName));

            cmd.CommandTimeout = 120;
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(continueOnCapturedContext: false);
            cn.Close();
        }
    }
}
