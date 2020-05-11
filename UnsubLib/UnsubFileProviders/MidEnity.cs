using System;
using System.Threading.Tasks;
using Utility;
using Utility.GenericEntity;

namespace UnsubLib.UnsubFileProviders
{
    public class MidEnity : IUnsubLocationProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(UnsubFileProviders)}.{nameof(MidEnity)}";

        public MidEnity(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public bool CanHandle(IGenericEntity network, string unsubRelationshipId, Uri uri) => uri.ToString().Contains("api.midenity.com");

        public async Task<string> GetFileUrl(IGenericEntity network, string unsubRelationshipId, Uri uri)
        {
            var res = uri.ToString();

            await _fw.Trace(_logMethod, $"Retrieved Unsub location: {uri} -> {res}");

            return res;
        }
    }

}
