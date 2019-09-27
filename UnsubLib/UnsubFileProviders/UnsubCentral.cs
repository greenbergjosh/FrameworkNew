using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using Utility;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

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

        public bool CanHandle(IGenericEntity network, Uri uri)
        {
            if (uri.ToString().Contains("go.unsubcentral.com"))
            {
                var qs = HttpUtility.ParseQueryString(uri.Query);

                return qs["key"] != null && qs["s"] != null;
            }

            return false;
        }

        public async Task<string> GetFileUrl(IGenericEntity network, Uri uri)
        {
            var qs = HttpUtility.ParseQueryString(uri.Query);

            var res = $"https://api.unsubcentral.com/api/service/keys/{qs["key"]}?s={qs["s"]}&format=hash&zipped=true";

            await _fw.Trace(_logMethod, $"Retrieved Unsub location: {uri} -> {res}");

            return res;
        }
    }

    public class UnsubCentralV2 : IUnsubLocationProvider
    {
        private readonly FrameworkWrapper _fw;
        private string _logMethod = $"{nameof(UnsubFileProviders)}.{nameof(UnsubCentral)}";

        public UnsubCentralV2(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public bool CanHandle(IGenericEntity network, Uri uri)
        {
            if (uri.ToString().Contains("go.unsubcentral.com"))
            {
                var qs = HttpUtility.ParseQueryString(uri.Query);

                return qs["keyID"] != null;
            }

            return false;
        }

        public async Task<string> GetFileUrl(IGenericEntity network, Uri uri)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    var resp = await client.GetAsync(uri);
                    var redirectUrl = resp?.Headers?.Location;

                    if (redirectUrl == null)
                    {
                        await _fw.Error($"{_logMethod}.{nameof(GetFileUrl)}", "Response had no redirect");
                        return null;
                    }

                    var qs = HttpUtility.ParseQueryString(redirectUrl.Query);
                    var key = qs["key"];
                    var secure = qs["s"];

                    if (key.IsNullOrWhitespace() || secure.IsNullOrWhitespace()) return null;

                    var data = new Dictionary<string, string> { { "key", key }, { "s", secure } };
                    var loginUrl = $"https://go.unsubcentral.com/backend/api/login";

                    resp = await client.PostAsync(loginUrl, new FormUrlEncodedContent(data));
                    var res = Jw.JsonToGenericEntity(await resp.Content.ReadAsStringAsync());

                    var token = res.GetS("payload");

                    if (token.IsNullOrWhitespace()) return null;

                    var fileIdUrl = $"https://go.unsubcentral.com/backend/api/keys?token={token}&find=ByAffiliateKeyStringEquals&keyString={key}";

                    resp = await client.GetAsync(fileIdUrl);
                    res = Jw.JsonToGenericEntity(await resp.Content.ReadAsStringAsync());
                    var unsubListId = res.GetS("unsubList/id");
                    var dlUrl = $"https://go.unsubcentral.com/backend/api/export/list/{unsubListId}/download?token={token}&type=DOWNLOAD_GRP_ENC_TEXT";

                    resp = await client.GetAsync(dlUrl);
                    res = Jw.JsonToGenericEntity(await resp.Content.ReadAsStringAsync());

                    var dl = res.GetS("payload");

                    await _fw.Trace(_logMethod, $"Retrieved Unsub location: {uri} -> {res}");

                    return dl;
                }
            }
            catch (Exception e)
            {
                await _fw.Error(_logMethod, $"Unhandled exception getting unsub link: {e.UnwrapForLog()}");
                return null;
            }
        }
    }
}
