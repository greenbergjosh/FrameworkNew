﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Framework.Core;
using Npgsql;

namespace DataLayer.PostgreSQL
{
    public class PostgreSqlDataLayerClient : IDataLayerClient
    {
        public static readonly string Name = "PostgreSQL";

        private string PrepareConnectionString(string connectionString)
        {
            var builder = new NpgsqlConnectionStringBuilder(connectionString);
            if (string.IsNullOrWhiteSpace(builder.ApplicationName))
            {
                builder.ApplicationName = Path.GetFileName(Directory.GetCurrentDirectory());
            }
            return builder.ToString();
        }

        public async Task<List<Dictionary<string, object>>> CallStoredFunction(IDictionary<string, object> parameters, string sproc, string connectionString, int timeout = 120)
        {
            using (var cn = new NpgsqlConnection(PrepareConnectionString(connectionString)))
            {
                var results = new List<Dictionary<string, object>>();

                cn.Open();
                var sql = $"SELECT * from {sproc}({parameters.Select(p => $"{p.Key} := '{p.Value}'").Join(",")})";


                using (var cmd = new NpgsqlCommand(sql, cn) { CommandTimeout = timeout })
                {
                    using (var rdr = await cmd.ExecuteReaderAsync().ConfigureAwait(continueOnCapturedContext: false))
                    {
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
                }
                cn.Close();

                return results;
            }
        }

        // TODO: deal with SQL Nulls (cast doesn't work)
        public async Task<string> CallStoredFunction(string args, string payload, string sproc, string connectionString, int timeout = 120)
        {
            string outval;
            using (var cn = new NpgsqlConnection(PrepareConnectionString(connectionString)))
            {
                cn.Open();
                using (var cmd = new NpgsqlCommand($"SELECT {sproc}(@Args, @Payload)", cn) { CommandTimeout = timeout })
                {
                    cmd.Parameters.AddWithValue("@Args", NpgsqlTypes.NpgsqlDbType.Json, args.IfNullOrWhitespace(JsonWrapper.Empty));
                    cmd.Parameters.AddWithValue("@Payload", NpgsqlTypes.NpgsqlDbType.Text, payload ?? string.Empty);
                    cmd.Parameters.Add(new NpgsqlParameter("@Return", NpgsqlTypes.NpgsqlDbType.Text)).Direction = System.Data.ParameterDirection.Output;
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(continueOnCapturedContext: false);
                    var res = cmd.Parameters["@Return"].Value;

                    outval = res == DBNull.Value ? null : (string)res;
                }
                cn.Close();
            }

            return outval;
        }

        public async Task<string> InsertEdwPayload(string connectionString, string payload, int timeout = 120, byte debug = 0)
        {
            string outval = null;

            try
            {
                using (var cn = new NpgsqlConnection(PrepareConnectionString(connectionString)))
                {
                    cn.Open();
                    using (var cmd = new NpgsqlCommand($"SELECT data.p_submit_bulk_payload(@Payload)", cn) { CommandTimeout = timeout })
                    {
                        cmd.Parameters.AddWithValue("@Payload", NpgsqlTypes.NpgsqlDbType.Jsonb, payload);
                        cmd.Parameters.Add(new NpgsqlParameter("@Return", NpgsqlTypes.NpgsqlDbType.Boolean)).Direction = System.Data.ParameterDirection.Output;
                        cmd.CommandTimeout = timeout;
                        await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                        outval = (string)cmd.Parameters["@Return"].Value;
                        cn.Close();
                    }
                }
            }
            catch (NpgsqlException sqlex)
            {
                if (sqlex.Message.Contains("Timeout") || sqlex.Message.Contains("login failed"))
                {
                    outval = "Walkaway";
                }
            }
            catch (Exception ex)
            {
                outval = $"Exception::{ex.UnwrapForLog()}";
            }

            return outval;
        }

        public async Task<string> InsertErrorLog(string connectionString, int sequence, int severity,
             string process, string method, string descriptor, string message, int timeout = 120)
        {
            string outval = null;

            try
            {
                using (var cn = new NpgsqlConnection(PrepareConnectionString(connectionString)))
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
            catch (NpgsqlException sqlex)
            {
                if (sqlex.Message.Contains("Timeout") || sqlex.Message.Contains("login failed"))
                {
                    outval = "Walkaway";
                }
            }
            catch (Exception ex)
            {
                outval = $"Exception::{ex.UnwrapForLog()}";
            }

            return outval;
        }

        public async Task<string> InsertPostingQueue(string connectionString, string postType, DateTime postDate, string payload, int timeout = 120)
        {
            string outval = null;

            try
            {
                using (var cn = new NpgsqlConnection(PrepareConnectionString(connectionString)))
                {
                    cn.Open();
                    using (var cmd = new NpgsqlCommand($"SELECT posting_queue.insert_posting_queue(@post_type, @post_date, @payload)", cn) { CommandTimeout = timeout })
                    {
                        cmd.Parameters.AddWithValue("@post_type", NpgsqlTypes.NpgsqlDbType.Text, postType);
                        cmd.Parameters.AddWithValue("@post_date", NpgsqlTypes.NpgsqlDbType.TimestampTz, postDate);
                        cmd.Parameters.AddWithValue("@payload", NpgsqlTypes.NpgsqlDbType.Json, payload);
                        cmd.Parameters.Add(new NpgsqlParameter("@Return", NpgsqlTypes.NpgsqlDbType.Text)).Direction = System.Data.ParameterDirection.Output;
                        cmd.CommandTimeout = timeout;
                        await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                        outval = (string)cmd.Parameters["@Return"].Value;
                        cn.Close();
                    }

                }
            }
            catch (NpgsqlException sqlex)
            {
                if (sqlex.Message.Contains("Timeout") || sqlex.Message.Contains("login failed"))
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

        public async Task<string> BulkInsertPostingQueue(string connectionString, string payload, int timeout = 120)
        {
            string outval = null;

            try
            {
                using (var cn = new NpgsqlConnection(PrepareConnectionString(connectionString)))
                {
                    cn.Open();
                    using (var cmd = new NpgsqlCommand($"SELECT posting_queue.insert_posting_queue_bulk(@payload)", cn) { CommandTimeout = timeout })
                    {
                        cmd.Parameters.AddWithValue("@payload", NpgsqlTypes.NpgsqlDbType.Json, payload);
                        cmd.Parameters.Add(new NpgsqlParameter("@Return", NpgsqlTypes.NpgsqlDbType.Text)).Direction = System.Data.ParameterDirection.Output;
                        cmd.CommandTimeout = timeout;
                        await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                        outval = (string)cmd.Parameters["@Return"].Value;
                        cn.Close();
                    }

                }
            }
            catch (NpgsqlException sqlex)
            {
                if (sqlex.Message.Contains("Timeout") || sqlex.Message.Contains("login failed"))
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

    }
}
