using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Data;
using Npgsql;
using System.Linq;
using Newtonsoft.Json.Linq;

namespace Utility
{
    public class PostgreSqlDataLayerClient : DataLayerClient
    {

        override public string GlobalConfig { get { return "GlobalConfig"; } }

        // TODO: deal with SQL Nulls (cast doesn't work)
        override public async Task<string> CallStoredFunction(string args, string payload, string sproc, string connectionString, int timeout = 120)
        {
            string outval;
            using (NpgsqlConnection cn = new NpgsqlConnection(connectionString))
            {
                cn.Open();
                using (var cmd = new NpgsqlCommand($"SELECT {sproc}(@Args, @Payload)", cn) { CommandTimeout = timeout })
                {
                    cmd.Parameters.AddWithValue("@Args", NpgsqlTypes.NpgsqlDbType.Json, args);
                    cmd.Parameters.AddWithValue("@Payload",NpgsqlTypes.NpgsqlDbType.Json, payload);
                    cmd.Parameters.Add(new NpgsqlParameter("@Return", NpgsqlTypes.NpgsqlDbType.Text )).Direction = System.Data.ParameterDirection.Output;
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(continueOnCapturedContext: false);
                    outval = (string)cmd.Parameters["@Return"].Value;
                }
                cn.Close();
            }

            return outval;
        }

        override public async Task<string> InsertEdwPayload(string connectionString, string payload, int timeout = 120, byte debug = 0)
        {
            string outval = null;

            try
            {
                using (NpgsqlConnection cn = new NpgsqlConnection(connectionString))
                {
                    cn.Open();
                    using (var cmd = new NpgsqlCommand($"SELECT silo.data.p_submit_bulk_payload(@Payload)", cn) { CommandTimeout = timeout })
                    {
                        cmd.Parameters.AddWithValue("@Payload",NpgsqlTypes.NpgsqlDbType.Jsonb, payload);
                        cmd.Parameters.Add(new NpgsqlParameter("@Return", NpgsqlTypes.NpgsqlDbType.Text )).Direction = System.Data.ParameterDirection.Output;
                        cmd.CommandTimeout = timeout;
                        await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                        outval = (string)cmd.Parameters["@Return"].Value;
                        // Remove this once the function is changed to be consistent with what we expect ("Success" for no errors)
                        if (outval == "200 ok") { outval = "Success"; }
                        cn.Close();
                    }
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

        override public async Task<string> InsertErrorLog(string connectionString, int sequence, int severity,
            string process, string method, string descriptor, string message, int timeout = 120)
        {
            string outval = null;

            try
            {
                using (NpgsqlConnection cn = new NpgsqlConnection(connectionString))
                {
                    cn.Open();
                    using (var cmd = new NpgsqlCommand($"SELECT silo.error_log.insert_error_log(@sequence, @severity, @process, @method, @descriptor, @message)", cn) { CommandTimeout = timeout })
                    {
                        cmd.Parameters.AddWithValue("@sequence",NpgsqlTypes.NpgsqlDbType.Integer,sequence );
                        cmd.Parameters.AddWithValue("@severity",NpgsqlTypes.NpgsqlDbType.Integer,severity );
                        cmd.Parameters.AddWithValue("@process",NpgsqlTypes.NpgsqlDbType.Text,process );
                        cmd.Parameters.AddWithValue("@method",NpgsqlTypes.NpgsqlDbType.Text, method);
                        cmd.Parameters.AddWithValue("@descriptor",NpgsqlTypes.NpgsqlDbType.Text,descriptor );
                        cmd.Parameters.AddWithValue("@message",NpgsqlTypes.NpgsqlDbType.Text,message );
                        cmd.Parameters.Add(new NpgsqlParameter("@Return", NpgsqlTypes.NpgsqlDbType.Text )).Direction = System.Data.ParameterDirection.Output;
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
                    ) outval = "Walkaway";
            }
            catch (Exception ex)
            {
                outval = $"Exception::{ex.ToString()}";
            }

            return outval;
        }

        override public async Task<string> InsertPostingQueue(string connectionString, string postType,
            DateTime postDate, string payload, int timeout = 120)
        {
            string outval = null;

            try
            {
                using (NpgsqlConnection cn = new NpgsqlConnection(connectionString))
                {
                    cn.Open();
                    using (var cmd = new NpgsqlCommand($"SELECT silo.posting_queue.insert_posting_queue(@post_type, @post_date, @payload)", cn) { CommandTimeout = timeout })
                    {
                        cmd.Parameters.AddWithValue("@post_type",NpgsqlTypes.NpgsqlDbType.Varchar,postType );
                        cmd.Parameters.AddWithValue("@post_date",NpgsqlTypes.NpgsqlDbType.Timestamp,postDate);
                        cmd.Parameters.AddWithValue("@payload",NpgsqlTypes.NpgsqlDbType.Text,payload );
                        cmd.Parameters.Add(new NpgsqlParameter("@Return", NpgsqlTypes.NpgsqlDbType.Text )).Direction = System.Data.ParameterDirection.Output;
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
