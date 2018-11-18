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

        public EdwSiloEndpoint(string connectionString)
        {
            this.connectionString = connectionString;
        }
        public async Task<bool> Audit()
        {
            return await SqlWrapper.InsertErrorLog(this.connectionString, 1, "EDWAudit", "", "", "").ConfigureAwait(false);
        }

        public async Task<LoadBalancedWriter.Result> Write(object w, bool secondaryWrite, int timeoutSeconds)
        {
            string res = await SqlWrapper.InsertEdwPayload(this.connectionString, (string)w, timeoutSeconds)
                .ConfigureAwait(false);
            IGenericEntity gp = new GenericEntityJson();
            var gpstate = JsonConvert.DeserializeObject(res);
            gp.InitializeEntity(null, null, gpstate);
            string result = gp.GetS("title").ToLower();
            if (result == "ok") return LoadBalancedWriter.Result.Success;
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
