using System;
using System.Threading.Tasks;
using Utility.GenericEntity;

namespace UnsubLib.UnsubFileProviders
{
    internal class UnsubscribeMe : IUnsubLocationProvider
    {
        public bool CanHandle(IGenericEntity network, string unsubRelationshipId, Uri uri) => uri.ToString().Contains("unsubscribeme.email");

        public Task<string> GetFileUrl(IGenericEntity network, string unsubRelationshipId, Uri uri) => Task.FromResult(new Uri(uri, "download/file").ToString());
    }
}
