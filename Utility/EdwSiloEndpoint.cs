using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Utility;

namespace Utility
{
    public class EdwSiloEndpoint : IEndpoint
    {
        public string connectionString;
        public DataLayerClient dataLayerClient;

        public EdwSiloEndpoint(string dataLayerType, string connectionString)
        {
            this.connectionString = connectionString;
            this.dataLayerClient = DataLayerClientFactory.DataStoreInstance(dataLayerType);
        }
        public async Task<bool> Audit()
        {
            // TODO: Replace audit logic with select top 1 id (nolock) from EDW event table
            // string res = await SqlWrapper.InsertErrorLog(this.connectionString, 1, "EDWLogAudit", "", "", "").ConfigureAwait(false);
            //string result = res.ToLower();
            //if (result == "success") return true;
            //else return false;
            return true;  // Default to true for now
        }

        public async Task<LoadBalancedWriter.Result> Write(object w, bool secondaryWrite, int timeoutSeconds)
        {
            string res = await this.dataLayerClient.InsertEdwPayload(this.connectionString, w.ToString(), timeoutSeconds)
                .ConfigureAwait(false);
            string result = res.ToLower();
            if (result == "success") return LoadBalancedWriter.Result.Success;
            else if (result == "walkaway")
                return LoadBalancedWriter.Result.Walkaway;
            else if (result == "removeendpoint") return LoadBalancedWriter.Result.RemoveEndpoint;
            else return LoadBalancedWriter.Result.Failure;
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
