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
            dataLayerClient = DataLayerClientFactory.DataStoreInstance(dataLayerType);
        }
        public async Task<bool> Audit()
        {
            var res = await dataLayerClient.InsertErrorLog(connectionString, 0, 1, "ErrorLogAudit", "", "", "").ConfigureAwait(false);
            var result = res.ToLower();
            return result == "success";
        }

        public async Task<LoadBalancedWriter.Result> Write(object w, bool secondaryWrite, int timeoutSeconds)
        {
            var e = (ErrorLogError)w;
            var res = await dataLayerClient.InsertErrorLog(connectionString, sequence++, e.Severity, e.Process,
                e.Method, e.Descriptor, e.Message).ConfigureAwait(false);
            var result = res.ToLower();

            return result == "success"
                ? LoadBalancedWriter.Result.Success
                : result == "walkaway"
                    ? LoadBalancedWriter.Result.Walkaway
                    : result == "removeendpoint" ? LoadBalancedWriter.Result.RemoveEndpoint : LoadBalancedWriter.Result.Failure;
        }

        public override bool Equals(object obj) => ((ErrorSiloEndpoint)obj).connectionString == connectionString;

        public override int GetHashCode() => connectionString.GetHashCode();
    }
}
