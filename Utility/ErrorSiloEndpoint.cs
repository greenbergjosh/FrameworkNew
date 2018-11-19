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
    public class ErrorSiloEndpoint : IEndpoint
    {
        public string connectionString;

        public ErrorSiloEndpoint(string connectionString)
        {
            this.connectionString = connectionString;
        }
        public async Task<bool> Audit()
        {
            string res = await SqlWrapper.InsertErrorLog(this.connectionString, 1, "ErrorLogAudit", "", "", "").ConfigureAwait(false);
            string result = res.ToLower();
            if (result == "success") return true;
            else return false;
        }

        public async Task<LoadBalancedWriter.Result> Write(object w, bool secondaryWrite, int timeoutSeconds)
        {
            ErrorLogError e = (ErrorLogError)w;
            string res = await SqlWrapper.InsertErrorLog(this.connectionString, e.Severity, e.Process, 
                e.Message, e.Descriptor, e.Message).ConfigureAwait(false);
            string result = res.ToLower();
            if (result == "success") return LoadBalancedWriter.Result.Success;
            else if (result == "walkaway")
                return LoadBalancedWriter.Result.Walkaway;
            else if (result == "removeendpoint") return LoadBalancedWriter.Result.RemoveEndpoint;
            else return LoadBalancedWriter.Result.Failure;
        }

        public override bool Equals(object obj)
        {
            return ((ErrorSiloEndpoint)obj).connectionString == this.connectionString;
        }

        public override int GetHashCode()
        {
            return this.connectionString.GetHashCode();
        }
    }
}
