using System;
using System.Threading.Tasks;
using System.Web;
using Utility;

namespace UnsubLib.UnsubFileProviders
{
    public class UnsubCentral : IUnsubLocationProvider
    {
        private readonly FrameworkWrapper _fw;
        private string _logMethod = $"{nameof(UnsubFileProviders)}.{nameof(UnsubCentral)}";

        public UnsubCentral(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public async Task<string> GetFileUrl(IGenericEntity network, Uri uri)
        {
            if (uri.ToString().Contains("go.unsubcentral.com"))
            {
                var qs = HttpUtility.ParseQueryString(uri.Query);

                if (qs["key"] != null && qs["s"] != null)
                {
                    var res =  "https://api.unsubcentral.com/api/service/keys/" + qs["key"] + "?s=" + qs["s"] + "&format=hash&zipped=true";

                    await _fw.Trace(_logMethod, $"Retrieved Unsub location: {uri} -> {res}");

                    return res;
                }
            }

            return null;
        }
    }

}
