using System;
using System.Threading.Tasks;
using Utility.GenericEntity;

namespace UnsubLib.UnsubFileProviders
{
    class DirectLink : IUnsubLocationProvider
    {
        public bool CanHandle(IGenericEntity network, string unsubRelationshipId, Uri uri) => true;

        public Task<string> GetFileUrl(IGenericEntity network, string unsubRelationshipId, Uri uri) => Task.FromResult(uri.ToString());
    }
}
