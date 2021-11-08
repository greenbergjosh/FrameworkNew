using System.Threading.Tasks;
using Utility.DataLayer;

namespace Utility.EDW.Logging
{
    public class ErrorSiloEndpoint : IEndpoint
    {
        private readonly IDataLayerClient _dataLayerClient;

        private int _sequence = 0;

        public string ConnectionString { get; }

        public ErrorSiloEndpoint(string dataLayerType, string connectionString)
        {
            ConnectionString = connectionString;
            _dataLayerClient = DataLayerClientFactory.DataStoreInstance(dataLayerType);
        }
        public async Task<bool> Audit()
        {
            var res = await _dataLayerClient.InsertErrorLog(ConnectionString, 0, 1, "ErrorLogAudit", "", "", "").ConfigureAwait(false);
            var result = res.ToLower();
            return result == "success";
        }

        public async Task<LoadBalancedWriter.Result> Write(object w, bool secondaryWrite, int timeoutSeconds)
        {
            var e = (ErrorLogError)w;
            var res = await _dataLayerClient.InsertErrorLog(ConnectionString, _sequence++, e.Severity, e.Process,
                e.Method, e.Descriptor, e.Message).ConfigureAwait(false);
            var result = res.ToLower();

            return result switch
            {
                "success" => LoadBalancedWriter.Result.Success,
                "walkaway" => LoadBalancedWriter.Result.Walkaway,
                "removeendpoint" => LoadBalancedWriter.Result.RemoveEndpoint,
                _ => LoadBalancedWriter.Result.Failure,
            };
        }

        public override bool Equals(object obj) => ((ErrorSiloEndpoint)obj).ConnectionString == ConnectionString;

        public override int GetHashCode() => ConnectionString.GetHashCode();
    }
}
