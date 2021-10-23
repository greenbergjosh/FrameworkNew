using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utility;
using Utility.GenericEntity;

namespace UnsubLib.UnsubFileProviders
{
    public class W4 : IUnsubLocationProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(UnsubFileProviders)}.{nameof(W4)}";

        public W4(FrameworkWrapper fw) => _fw = fw;

        public bool CanHandle(IGenericEntity network, string unsubRelationshipId, Uri uri) => uri.ToString().Contains("w4api.com");

        public async Task<(string url, IDictionary<string, string> postData)> GetFileUrl(IGenericEntity network, string unsubRelationshipId, Uri uri)
        {
            if (uri.ToString().Contains("/pub/unsub_list/get/"))
                return (uri.ToString(), null);

            var (success, body) = await ProtocolClient.HttpGetAsync(uri.ToString(), timeoutSeconds: 300);
            if (!success)
            {
                await _fw.Error(_logMethod, $"W4 API get file url call failed: {uri}");
                return default;
            }

            var resGe = JsonWrapper.JsonToGenericEntity(body);
            var download = resGe?.GetS("download_link");

            if (!download.IsNullOrWhitespace())
                return (download, null);

            await _fw.Error(_logMethod, $"W4 API get file url call failed: {uri} Response: {resGe?.GetS("")}");
            return default;
        }
    }
}
