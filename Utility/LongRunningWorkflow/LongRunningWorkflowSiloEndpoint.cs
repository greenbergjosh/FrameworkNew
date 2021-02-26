using System;
using System.Threading.Tasks;
using Utility.DataLayer;
using Utility.EDW;
using Utility.GenericEntity;

namespace Utility.LongRunningWorkflow
{
    public class LongRunningWorkflowSiloEndpoint : IEndpoint
    {
        private readonly string _connectionString;
        private readonly IDataLayerClient _dataLayerClient;

        public LongRunningWorkflowSiloEndpoint(string dataLayerType, string connectionString)
        {
            _connectionString = connectionString;
            _dataLayerClient = DataLayerClientFactory.DataStoreInstance(dataLayerType);
        }

        public Task<bool> Audit() => throw new NotImplementedException();

        public async Task<LoadBalancedWriter.Result> Write(object w, bool secondaryWrite, int timeoutSeconds)
        {
            var result = await _dataLayerClient.CallStoredFunction(w.ToString(), string.Empty, "lrw.add_new", _connectionString);
            var jResult = GenericEntityJson.Parse(result);
            var status = jResult.GetS("status");
            if (status == "ok")
            {
                return LoadBalancedWriter.Result.Success;
            }
            else
            {
                return LoadBalancedWriter.Result.Failure;
            }
        }
    }
}