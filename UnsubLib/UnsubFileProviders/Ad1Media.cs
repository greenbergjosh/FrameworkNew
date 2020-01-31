using System;
using System.Threading.Tasks;
using Utility.GenericEntity;

namespace UnsubLib.UnsubFileProviders
{
    class Ad1Media : IUnsubLocationProvider
    {
        public bool CanHandle(IGenericEntity network, Uri uri)
        {
            return uri.ToString().Contains("api.adgtracker.com");
        }

        public Task<string> GetFileUrl(IGenericEntity network, Uri uri)
        {
            return Task.FromResult(uri.ToString());
        }
    }
}
