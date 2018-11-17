using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Utility;

namespace GenericDataService
{
    public class EdwSiloEndpoint : IEndpoint
    {
        public string connectionString;

        public EdwSiloEndpoint(string connectionString)
        {
            this.connectionString = connectionString;
        }
        public async Task<bool> Audit()
        {
            string result = await EdwSiloEndpoint.ExecuteSql("{\"TestAction\": \"Audit\", \"V\": \"" + 1 + "\"}", "[dbo].[spCreateTestRecord]", connectionString, 1)
                .ConfigureAwait(false);
            if (result == "Success") return true;
            else return false;
        }

        public async Task<LoadBalancedWriter.Result> Write(object w, bool secondaryWrite, int timeoutSeconds)
        {
            string result = await ExecuteSql((string)w, "[dbo].[spCreateTestRecord]", this.connectionString, timeoutSeconds)
                .ConfigureAwait(false);
            if (result == "Success") return LoadBalancedWriter.Result.Success;
            else if (result == "Walkaway")
                return LoadBalancedWriter.Result.Walkaway;
            else if (result == "RemoveEndpoint") return LoadBalancedWriter.Result.RemoveEndpoint;
            else return LoadBalancedWriter.Result.Success;
        }

        public static async Task<string> ExecuteSql(string payload, string sproc, string connectionString, int timeout = 120)
        {
            string outval = null;

            try
            {
                using (SqlConnection cn = new SqlConnection(connectionString))
                {
                    cn.Open();
                    SqlCommand cmd = cn.CreateCommand();
                    cmd.CommandText = sproc;
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add(new SqlParameter("@Payload", payload));
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
                outval = "Failure";
            }

            return outval;
        }

        public override bool Equals(object obj)
        {
            return ((EdwSiloEndpoint)obj).connectionString == this.connectionString;
        }

        public override int GetHashCode()
        {
            return this.connectionString.GetHashCode();
        }
    }
}
