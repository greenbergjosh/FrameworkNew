using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utility.DataLayer;

namespace Utility.EDW.Reporting
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

        public async Task<bool> Audit()
        {
            var e = new EdwBulkEvent();
            e.AddEvent(Guid.NewGuid(), DateTime.UtcNow, new Dictionary<Guid, (Guid, DateTime)>() { [Guid.Parse("f15d0bf2-87a8-4131-80c4-4284229f7e1d")] = (default, default) }, new { audit = true });

            try
            {
                var result = await Write(e, false, 120);
                Console.WriteLine($"{DateTime.Now}: Audit result: {result == LoadBalancedWriter.Result.Success}");
                return result == LoadBalancedWriter.Result.Success;
            }
            catch
            {
                Console.WriteLine($"{DateTime.Now}: Audit result: false");
                return false;
            }
        }

        public async Task<LoadBalancedWriter.Result> Write(object w, bool secondaryWrite, int timeoutSeconds)
        {
            var res = await dataLayerClient.InsertEdwPayload(connectionString, w.ToString(), timeoutSeconds).ConfigureAwait(false);
            var result = res.ToLower();
            return result switch
            {
                "success" or "200 ok" => LoadBalancedWriter.Result.Success,
                "walkaway" => LoadBalancedWriter.Result.Walkaway,
                "removeendpoint" => LoadBalancedWriter.Result.RemoveEndpoint,
                _ => LoadBalancedWriter.Result.Failure
            };
        }

        public override bool Equals(object obj) => ((EdwSiloEndpoint)obj).connectionString == connectionString;

        public override int GetHashCode() => connectionString.GetHashCode();
    }
}
