using System.Threading.Tasks;
using Utility.DataLayer;

namespace Utility.EDW.Logging
{
    public class ErrorSiloEndpoint : IEndpoint
    {
        public string connectionString;
        public int sequence = 0;
        public IDataLayerClient dataLayerClient;

        public ErrorSiloEndpoint(string dataLayerType, string connectionString)
        {
            this.connectionString = connectionString;
            this.dataLayerClient = DataLayerClientFactory.DataStoreInstance(dataLayerType);
        }
        public async Task<bool> Audit()
        {
            string res = await dataLayerClient.InsertErrorLog(this.connectionString, 0, 1, "ErrorLogAudit", "", "", "").ConfigureAwait(false);
            string result = res.ToLower();
            if (result == "success") return true;
            else return false;
        }

        public async Task<LoadBalancedWriter.Result> Write(object w, bool secondaryWrite, int timeoutSeconds)
        {
            ErrorLogError e = (ErrorLogError)w;
            string res = await dataLayerClient.InsertErrorLog(this.connectionString, sequence++, e.Severity, e.Process,
                e.Method, e.Descriptor, e.Message).ConfigureAwait(false);
            string result = res.ToLower();
            if (result == "success") return LoadBalancedWriter.Result.Success;
            else if (result == "walkaway")
                return LoadBalancedWriter.Result.Walkaway;
            else if (result == "removeendpoint") return LoadBalancedWriter.Result.RemoveEndpoint;
            else return LoadBalancedWriter.Result.Failure;
        }

        public override bool Equals(object obj) => ((ErrorSiloEndpoint)obj).connectionString == this.connectionString;

        public override int GetHashCode() => this.connectionString.GetHashCode();
    }
}
