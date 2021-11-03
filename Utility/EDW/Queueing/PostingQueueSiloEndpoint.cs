using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Utility.DataLayer;

namespace Utility.EDW.Queueing
{
    internal class PostingQueueSiloEndpoint : IEndpoint
    {
        public string connectionString;
        public IDataLayerClient dataLayerClient;

        public PostingQueueSiloEndpoint(string dataLayerType, string connectionString)
        {
            this.connectionString = connectionString;
            dataLayerClient = DataLayerClientFactory.DataStoreInstance(dataLayerType);
        }

        public async Task<bool> Audit()
        {
            var res = await dataLayerClient.InsertPostingQueue(connectionString, "Audit", DateTime.Now, "{}").ConfigureAwait(false);
            var result = res.ToLower();
            return result == "success";
        }

        public async Task<LoadBalancedWriter.Result> Write(object w, bool secondaryWrite, int timeoutSeconds)
        {
            var res = w is PostingQueueEntry p
                ? await dataLayerClient.InsertPostingQueue(connectionString, p.PostType, p.PostDate, p.Payload)
                : w is IEnumerable<PostingQueueEntry> c
                    ? await dataLayerClient.BulkInsertPostingQueue(connectionString, JsonConvert.SerializeObject(c))
                    : throw new Exception($"Invalid posting queue payload type ${w?.GetType().FullName ?? "null"}");
            res = res?.ToLower();

            return res switch
            {
                "success" => LoadBalancedWriter.Result.Success,
                "walkaway" => LoadBalancedWriter.Result.Walkaway,
                "removeendpoint" => LoadBalancedWriter.Result.RemoveEndpoint,
                _ => LoadBalancedWriter.Result.Failure,
            };
        }

        public override bool Equals(object obj) => ((PostingQueueSiloEndpoint)obj).connectionString == connectionString;

        public override int GetHashCode() => connectionString.GetHashCode();
    }
}
