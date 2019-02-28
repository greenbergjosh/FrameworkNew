using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Utility.DataLayer;

namespace Utility
{
    class PostingQueueSiloEndpoint : IEndpoint
    {
        public string connectionString;
        public IDataLayerClient dataLayerClient;

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

            if (w is PostingQueueEntry p) res = await dataLayerClient.InsertPostingQueue(this.connectionString, p.PostType, p.PostDate, p.Payload);
            else if (w is IEnumerable<PostingQueueEntry> c) res = await dataLayerClient.BulkInsertPostingQueue(this.connectionString, JsonConvert.SerializeObject(c));
            else throw new Exception($"Invalid posting queue payload type ${w?.GetType().FullName ?? "null"}");

            res = res.ToLower();

            switch (res)
            {
                case "success":
                    return LoadBalancedWriter.Result.Success;
                case "walkaway":
                    return LoadBalancedWriter.Result.Walkaway;
                case "removeendpoint":
                    return LoadBalancedWriter.Result.RemoveEndpoint;
                default:
                    return LoadBalancedWriter.Result.Failure;
            }
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
