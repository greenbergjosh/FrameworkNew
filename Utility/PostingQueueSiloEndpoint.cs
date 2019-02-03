using System;
using System.Threading.Tasks;

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
            PostingQueueEntry p = (PostingQueueEntry)w;
            string res = await dataLayerClient.InsertPostingQueue(this.connectionString, p.PostType, p.PostDate,
                p.Payload).ConfigureAwait(false);
            string result = res.ToLower();
            if (result == "success") return LoadBalancedWriter.Result.Success;
            else if (result == "walkaway")
                return LoadBalancedWriter.Result.Walkaway;
            else if (result == "removeendpoint") return LoadBalancedWriter.Result.RemoveEndpoint;
            else return LoadBalancedWriter.Result.Failure;
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
