using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Utility.DataLayer
{
    public class SqlServerDataLayerClient : IDataLayerClient
    {
        public async Task<List<Dictionary<string, object>>> CallStoredFunction(IDictionary<string, object> parameters, string sproc, string connectionString, int timeout = 120)
        {
            using var cn = new SqlConnection(connectionString);
            var results = new List<Dictionary<string, object>>();

            cn.Open();
            using (var cmd = new SqlCommand($"EXEC {sproc} {parameters.Select(p => $"@{p.Key}").Join(",")}", cn) { CommandTimeout = timeout })
            {

                foreach (var p in parameters)
                {
                    _ = cmd.Parameters.AddWithValue($"@{p.Key}", p.Value);
                }

                using var rdr = await cmd.ExecuteReaderAsync().ConfigureAwait(continueOnCapturedContext: false);
                var fields = new string[rdr.FieldCount];

                for (var i = 0; i < rdr.FieldCount; i++)
                {
                    fields[i] = rdr.GetName(i);
                }

                while (await rdr.ReadAsync())
                {
                    var row = new Dictionary<string, object>();

                    foreach (var f in fields)
                    {
                        var val = rdr[f];

                        if (val == DBNull.Value)
                        {
                            val = null;
                        }

                        row.Add(f, val);
                    }

                    results.Add(row);
                }
            }

            cn.Close();

            return results;
        }

        public async Task<string> CallStoredFunction(string args, string payload, string sproc, string connectionString, int timeout = 120)
        {
            string outval = null;

            using (var cn = new SqlConnection(connectionString))
            {
                cn.Open();
                var cmd = cn.CreateCommand();
                cmd.CommandText = sproc;
                cmd.CommandType = CommandType.StoredProcedure;

                _ = cmd.Parameters.Add(new SqlParameter("@Args", args));
                _ = cmd.Parameters.Add(new SqlParameter("@Payload", payload));
                cmd.Parameters.Add("@Return", SqlDbType.NVarChar, -1)
                    .Direction = ParameterDirection.Output;
                cmd.CommandTimeout = timeout;
                _ = await cmd.ExecuteNonQueryAsync().ConfigureAwait(continueOnCapturedContext: false);
                var ov = cmd.Parameters["@Return"].Value;
                outval = ov == DBNull.Value ? null : (string)ov;
                cn.Close();
            }

            return outval;
        }

        public async Task<string> InsertEdwPayload(string connectionString, string payload, int timeout = 120, byte debug = 0)
        {
            string outval = null;

            try
            {
                using var cn = new SqlConnection(connectionString);
                cn.Open();
                var cmd = cn.CreateCommand();
                cmd.CommandText = "[Data].[p_submit_bulk_payload]";
                cmd.CommandType = CommandType.StoredProcedure;

                _ = cmd.Parameters.Add(new SqlParameter("@Payload", payload));
                _ = cmd.Parameters.Add(new SqlParameter("@Debug", debug));
                cmd.Parameters.Add("@Return", SqlDbType.NVarChar, -1)
                    .Direction = ParameterDirection.Output;
                cmd.CommandTimeout = timeout;
                _ = await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                outval = (string)cmd.Parameters["@Return"].Value;
                cn.Close();
            }
            catch (System.Data.SqlClient.SqlException sqlex)
            {
                if (sqlex.Message.Contains("Timeout") ||
                    sqlex.Message.Contains("login failed")
                    )
                {
                    outval = "Walkaway";
                }
            }
            catch (Exception ex)
            {
                outval = $"Exception::{ex}";
            }

            return outval;
        }

        public async Task<string> InsertErrorLog(string connectionString, int sequence, int severity,
            string process, string method, string descriptor, string message, int timeout = 120)
        {
            string outval = null;

            try
            {
                using var cn = new SqlConnection(connectionString);
                cn.Open();
                var cmd = cn.CreateCommand();
                cmd.CommandText = "[ErrorLog].[spInsertErrorLog]";
                cmd.CommandType = CommandType.StoredProcedure;

                _ = cmd.Parameters.Add(new SqlParameter("Sequence", sequence));
                _ = cmd.Parameters.Add(new SqlParameter("Severity", severity));
                _ = cmd.Parameters.Add(new SqlParameter("Process", process));
                _ = cmd.Parameters.Add(new SqlParameter("Method", method));
                _ = cmd.Parameters.Add(new SqlParameter("Descriptor", descriptor));
                _ = cmd.Parameters.Add(new SqlParameter("Message", message));
                cmd.Parameters.Add("@Return", SqlDbType.NVarChar, -1)
                    .Direction = ParameterDirection.Output;
                cmd.CommandTimeout = timeout;
                _ = await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                outval = (string)cmd.Parameters["@Return"].Value;
                cn.Close();
            }
            catch (System.Data.SqlClient.SqlException sqlex)
            {
                if (sqlex.Message.Contains("Timeout") ||
                    sqlex.Message.Contains("login failed")
                    )
                {
                    outval = "Walkaway";
                }
            }
            catch (Exception ex)
            {
                outval = $"Exception::{ex}";
            }

            return outval;
        }

        // spInsertPostingQueue
        public async Task<string> InsertPostingQueue(string connectionString, string postType,
            DateTime postDate, string payload, int timeout = 120)
        {
            string outval = null;

            try
            {
                using var cn = new SqlConnection(connectionString);
                cn.Open();
                var cmd = cn.CreateCommand();
                cmd.CommandText = "[PostingQueue].[spInsertPostingQueue]";
                cmd.CommandType = CommandType.StoredProcedure;

                _ = cmd.Parameters.Add(new SqlParameter("PostType", postType));
                _ = cmd.Parameters.Add(new SqlParameter("PostDate", postDate));
                _ = cmd.Parameters.Add(new SqlParameter("Payload", payload));
                cmd.Parameters.Add("@Return", SqlDbType.NVarChar, -1)
                    .Direction = ParameterDirection.Output;
                cmd.CommandTimeout = timeout;
                _ = await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                outval = (string)cmd.Parameters["@Return"].Value;
                cn.Close();
            }
            catch (System.Data.SqlClient.SqlException sqlex)
            {
                if (sqlex.Message.Contains("Timeout") ||
                    sqlex.Message.Contains("login failed")
                    )
                {
                    outval = "Walkaway";
                }
            }
            catch (Exception ex)
            {
                outval = $"Exception::{ex}";
            }

            return outval;
        }

        public async Task<string> BulkInsertPostingQueue(string connectionString, string payload, int timeout = 120)
        {
            string outval = null;

            try
            {
                using var cn = new SqlConnection(connectionString);
                cn.Open();
                var cmd = cn.CreateCommand();
                cmd.CommandText = "[PostingQueue].[spBulkInsertPostingQueue]";
                cmd.CommandType = CommandType.StoredProcedure;

                _ = cmd.Parameters.Add(new SqlParameter("Payload", payload));
                cmd.Parameters.Add("@Return", SqlDbType.NVarChar, -1)
                    .Direction = ParameterDirection.Output;
                cmd.CommandTimeout = timeout;
                _ = await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                outval = (string)cmd.Parameters["@Return"].Value;
            }
            catch (SqlException sqlex)
            {
                if (sqlex.Message.Contains("Timeout") || sqlex.Message.Contains("login failed"))
                {
                    outval = "Walkaway";
                }
            }
            catch (Exception ex)
            {
                outval = $"Exception::{ex}";
            }

            return outval;
        }
    }
}
