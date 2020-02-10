using System.Threading.Tasks;

namespace Framework.Core.EDW.Reporting
{
    public class EdwSiloEndpoint : IEndpoint
    {
        public string connectionString;
        public IDataLayerClient dataLayerClient;

        public EdwSiloEndpoint(string dataLayerType, string connectionString)
        {
            this.connectionString = connectionString;
            dataLayerClient = DataLayerClientFactory.DataStoreInstance(dataLayerType);
        }
        public Task<bool> Audit()
        {
            // TODO: Replace audit logic with select top 1 id (nolock) from EDW event table
            // string res = await SqlWrapper.InsertErrorLog(this.connectionString, 1, "EDWLogAudit", "", "", "").ConfigureAwait(false);
            //string result = res.ToLower();
            //if (result == "success") return true;
            //else return false;
            return Task.FromResult(true);  // Default to true for now
        }

        public async Task<LoadBalancedWriter.Result> Write(object w, bool secondaryWrite, int timeoutSeconds)
        {
            var res = await dataLayerClient.InsertEdwPayload(connectionString, w.ToString(), timeoutSeconds)
                .ConfigureAwait(false);
            var result = res.ToLower();
            if (result == "success")
            {
                return LoadBalancedWriter.Result.Success;
            }
            else if (result == "walkaway") return LoadBalancedWriter.Result.Walkaway;
            else if (result == "removeendpoint") return LoadBalancedWriter.Result.RemoveEndpoint;
            else return LoadBalancedWriter.Result.Failure;
        }

        public override bool Equals(object obj) => ((EdwSiloEndpoint)obj).connectionString == connectionString;

        public override int GetHashCode() => connectionString.GetHashCode();
    }
}
