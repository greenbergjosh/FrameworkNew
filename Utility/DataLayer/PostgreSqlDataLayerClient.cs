using Npgsql;
using System;
using System.Threading.Tasks;

namespace Utility.DataLayer
{
    public class PostgreSqlDataLayerClient : IDataLayerClient
    {

        // TODO: deal with SQL Nulls (cast doesn't work)
        public async Task<string> CallStoredFunction(string args, string payload, string sproc, string connectionString, int timeout = 120)
        {
            string outval;
            using (var cn = new NpgsqlConnection(connectionString))
            {
                cn.Open();
                using (var cmd = new NpgsqlCommand($"SELECT {sproc}(@Args, @Payload)", cn) { CommandTimeout = timeout })
                {
                    cmd.Parameters.AddWithValue("@Args", NpgsqlTypes.NpgsqlDbType.Json, args.IfNullOrWhitespace(JsonWrapper.Empty));
                    cmd.Parameters.AddWithValue("@Payload", NpgsqlTypes.NpgsqlDbType.Json, payload.IfNullOrWhitespace(JsonWrapper.Empty));
                    cmd.Parameters.Add(new NpgsqlParameter("@Return", NpgsqlTypes.NpgsqlDbType.Text)).Direction = System.Data.ParameterDirection.Output;
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(continueOnCapturedContext: false);
                    outval = (string)cmd.Parameters["@Return"].Value;
                }
                cn.Close();
            }

            return outval;
        }

        public async Task<string> InsertEdwPayload(string connectionString, string payload, int timeout = 120, byte debug = 0)
        {
            string result = null;

            try
            {
                using (var cn = new NpgsqlConnection(connectionString))
                {
                    cn.Open();
                    using (var cmd = new NpgsqlCommand($"SELECT data.p_submit_bulk_payload(@Payload)", cn) { CommandTimeout = timeout })
                    {
                        cmd.Parameters.AddWithValue("@Payload", NpgsqlTypes.NpgsqlDbType.Jsonb, payload);
                        cmd.Parameters.Add(new NpgsqlParameter("@Return", NpgsqlTypes.NpgsqlDbType.Boolean)).Direction = System.Data.ParameterDirection.Output;
                        cmd.CommandTimeout = timeout;
                        await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                        var outval = (bool)cmd.Parameters["@Return"].Value;
                        // Remove this once the function is changed to be consistent with what we expect ("Success" for no errors)
                        result = outval ? "Success" : "Failure";
                        cn.Close();
                    }
                }
            }
            catch (System.Data.SqlClient.SqlException sqlex)
            {
                if (sqlex.Message.Contains("Timeout") ||
                    sqlex.Message.Contains("login failed")
                    )
                {
                    result = "Walkaway";
                }
            }
            catch (Exception ex)
            {
                result = $"Exception::{ex.UnwrapForLog()}";
            }

            return result;
        }

        public async Task<string> InsertErrorLog(string connectionString, int sequence, int severity,
             string process, string method, string descriptor, string message, int timeout = 120)
        {
            string outval = null;

            try
            {
                using (var cn = new NpgsqlConnection(connectionString))
                {
                    cn.Open();
                    using (var cmd = new NpgsqlCommand($"SELECT error_log.insert_error_log(@sequence, @severity, @process, @method, @descriptor, @message)", cn) { CommandTimeout = timeout })
                    {
                        cmd.Parameters.AddWithValue("@sequence", NpgsqlTypes.NpgsqlDbType.Integer, sequence);
                        cmd.Parameters.AddWithValue("@severity", NpgsqlTypes.NpgsqlDbType.Integer, severity);
                        cmd.Parameters.AddWithValue("@process", NpgsqlTypes.NpgsqlDbType.Text, process);
                        cmd.Parameters.AddWithValue("@method", NpgsqlTypes.NpgsqlDbType.Text, method);
                        cmd.Parameters.AddWithValue("@descriptor", NpgsqlTypes.NpgsqlDbType.Text, descriptor);
                        cmd.Parameters.AddWithValue("@message", NpgsqlTypes.NpgsqlDbType.Text, message);
                        cmd.Parameters.Add(new NpgsqlParameter("@Return", NpgsqlTypes.NpgsqlDbType.Text)).Direction = System.Data.ParameterDirection.Output;
                        cmd.CommandTimeout = timeout;
                        await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                        outval = (string)cmd.Parameters["@Return"].Value;
                        cn.Close();
                    }
                }
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
                outval = $"Exception::{ex.ToString()}";
            }

            return outval;
        }

        public async Task<string> InsertPostingQueue(string connectionString, string postType, DateTime postDate, string payload, int timeout = 120)
        {
            string outval = null;

            try
            {
                using (var cn = new NpgsqlConnection(connectionString))
                {
                    cn.Open();
                    using (var cmd = new NpgsqlCommand($"SELECT posting_queue.insert_posting_queue(@post_type, @post_date, @payload)", cn) { CommandTimeout = timeout })
                    {
                        cmd.Parameters.AddWithValue("@post_type", NpgsqlTypes.NpgsqlDbType.Varchar, postType);
                        cmd.Parameters.AddWithValue("@post_date", NpgsqlTypes.NpgsqlDbType.Timestamp, postDate);
                        cmd.Parameters.AddWithValue("@payload", NpgsqlTypes.NpgsqlDbType.Text, payload);
                        cmd.Parameters.Add(new NpgsqlParameter("@Return", NpgsqlTypes.NpgsqlDbType.Text)).Direction = System.Data.ParameterDirection.Output;
                        cmd.CommandTimeout = timeout;
                        await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                        outval = (string)cmd.Parameters["@Return"].Value;
                        cn.Close();
                    }

                }
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
                outval = $"Exception::{ex.ToString()}";
            }

            return outval;
        }

        public Task<string> BulkInsertPostingQueue(string connectionString, string payload, int timeout = 120) => throw new NotImplementedException();
    }
}
