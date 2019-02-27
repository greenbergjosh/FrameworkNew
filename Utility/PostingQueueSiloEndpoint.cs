using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Utility
{
    class PostingQueueSiloEndpoint : IEndpoint
    {
        public string connectionString;
        public DataLayerClient dataLayerClient;

        public PostingQueueSiloEndpoint(string dataLayerType, string connectionString)
        {
            this.connectionString = connectionString;
            this.dataLayerClient = DataLayerClientFactory.DataStoreInstance(dataLayerType);
        }
        public async Task<bool> Audit()
        {
            string res = await dataLayerClient.InsertPostingQueue(this.connectionString, "Audit", DateTime.Now, "{}").ConfigureAwait(false);
            string result = res.ToLower();
            if (result == "success") return true;
            else return false;
        }

        public async Task<LoadBalancedWriter.Result> Write(object w, bool secondaryWrite, int timeoutSeconds)
        {
            string res;

            if (w is PostingQueueEntry p) res = await SqlWrapper.InsertPostingQueue(this.connectionString, p.PostType, p.PostDate, p.Payload);
            else if (w is IEnumerable<PostingQueueEntry> c) res = await SqlWrapper.BulkInsertPostingQueue(this.connectionString, JsonConvert.SerializeObject(c));
            else throw new Exception($"Invalid posting queue payload type ${w?.GetType().FullName ?? "null"}");

            res = res.ToLower();

            if (res == "success") return LoadBalancedWriter.Result.Success;

            if (res == "walkaway") return LoadBalancedWriter.Result.Walkaway;

            if (res == "removeendpoint") return LoadBalancedWriter.Result.RemoveEndpoint;

            return LoadBalancedWriter.Result.Failure;
        }

        public override bool Equals(object obj)
        {
            return ((PostingQueueSiloEndpoint)obj).connectionString == this.connectionString;
        }

        public override int GetHashCode()
        {
            return this.connectionString.GetHashCode();
        }
    }
}
