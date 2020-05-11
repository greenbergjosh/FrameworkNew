using System;
using System.Threading.Tasks;
using Utility.GenericEntity;

namespace UnsubLib.UnsubFileProviders
{
    class Ad1Media : IUnsubLocationProvider
    {
        public bool CanHandle(IGenericEntity network, string unsubRelationshipId, Uri uri) => uri.ToString().Contains("api.adgtracker.com");

        public Task<string> GetFileUrl(IGenericEntity network, string unsubRelationshipId, Uri uri) => Task.FromResult(uri.ToString());
    }
}
