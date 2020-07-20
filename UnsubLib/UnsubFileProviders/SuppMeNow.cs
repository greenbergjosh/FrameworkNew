using System;
using System.Threading.Tasks;
using Utility.GenericEntity;

namespace UnsubLib.UnsubFileProviders
{
    internal class SuppMeNow : IUnsubLocationProvider
    {
        public bool CanHandle(IGenericEntity network, string unsubRelationshipId, Uri uri) => uri.ToString().Contains("suppmenow.com");

        public Task<string> GetFileUrl(IGenericEntity network, string unsubRelationshipId, Uri uri) => Task.FromResult(uri.ToString());
    }
}
