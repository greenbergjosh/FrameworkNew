using System;
using System.Threading.Tasks;
using Utility.GenericEntity;

namespace UnsubLib.UnsubFileProviders
{
    internal class WeOpt : IUnsubLocationProvider
    {
        public bool CanHandle(IGenericEntity network, string unsubRelationshipId, Uri uri) => uri.ToString().Contains("weopt.com");

        public Task<string> GetFileUrl(IGenericEntity network, string unsubRelationshipId, Uri uri)
        {
            var pathParts = uri.AbsolutePath.Split('/');
            var fileId = pathParts[^1];

            var url = $"https://weopt.com/api/suppression_downloads/full_file/{fileId}";

            return Task.FromResult(url);
        }
    }
}
