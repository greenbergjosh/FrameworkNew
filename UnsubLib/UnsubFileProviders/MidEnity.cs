using System;
using System.Threading.Tasks;
using Utility;

namespace UnsubLib.UnsubFileProviders
{
    public class MidEnity : IUnsubLocationProvider
    {
        private readonly FrameworkWrapper _fw;
        private string _logMethod = $"{nameof(UnsubFileProviders)}.{nameof(MidEnity)}";

        public MidEnity(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public async Task<string> GetFileUrl(IGenericEntity network, Uri uri)
        {
            var res = uri.ToString().Contains("api.midenity.com") ? uri.ToString() : null;

            await _fw.Trace(_logMethod, $"Retrieved Unsub location: {uri} -> {res}");

            return res;
        }
    }

}
