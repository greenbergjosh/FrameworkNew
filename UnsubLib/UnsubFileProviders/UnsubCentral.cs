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

                return qs["key"] != null && qs["s"] != null ||
                        qs["keyID"] != null;
            }

            return false;
        }

        public async Task<string> GetFileUrl(IGenericEntity network, Uri uri)
        {
            var uriStr = uri.ToString();
            var campaignId = "unknown";
            var cidIndex = uriStr.IndexOf("|cid=");
            
            await _fw.Trace("UV2C", $"{campaignId} {uriStr} Entering GetFileUrl");

            if (cidIndex != -1)
            {
                campaignId = uriStr.Substring(cidIndex + 5);
                uri = new Uri(uriStr.Substring(0, cidIndex));
                await _fw.Trace("UV2C", $"{campaignId} {uriStr} Got CampaignId");
            }
            else
            {
                await _fw.Trace("UV2C", $"{campaignId} {uriStr} Did not get CampaignId");
            }

            var qs2 = HttpUtility.ParseQueryString(uri.Query);
            var defaultUrl = "https://api.unsubcentral.com/api/service/keys/" + qs2["key"] + "?s=" + qs2["s"] + "&format=hash&zipped=true";

            try
            {

                using (var client = new HttpClient())
                {
                    string key;
                    string secure;

                    HttpResponseMessage resp;
                    var qsOriginal = HttpUtility.ParseQueryString(uri.Query);
                    if (qsOriginal["keyID"] != null)
                    {
                        await _fw.Trace("UV2C", $"{campaignId} {uriStr} Has keyID");

                        resp = await client.GetAsync(uri);
                        var redirectUrl = resp?.Headers?.Location;
                        if (redirectUrl == null)
                        {
                            await _fw.Error("UV2C", $"{campaignId} {uriStr} Response had no redirect");
                            await _fw.Error($"{_logMethod}.{nameof(GetFileUrl)}", "Response had no redirect");
                            return defaultUrl;
                        }

                        var qs = HttpUtility.ParseQueryString(redirectUrl.Query);
                        key = qs["key"];
                        secure = qs["s"];
                    }
                    else
                    {
                        key = qsOriginal["key"];
                        secure = qsOriginal["s"];
                    }

                    await _fw.Trace("UV2C", $"{campaignId} {uriStr} key {key} secure {secure}");

                    if (key.IsNullOrWhitespace() || secure.IsNullOrWhitespace())
                    {
                        await _fw.Trace("UV2C", $"{campaignId} {uriStr} defaultUrl {defaultUrl}");
                        return defaultUrl;
                    }

                    var data = new Dictionary<string, string> { { "key", key }, { "s", secure } };
                    var loginUrl = $"https://go.unsubcentral.com/backend/api/login";

                    await _fw.Trace("UV2C", $"{campaignId} {uriStr} before login");

                    resp = await client.PostAsync(loginUrl, new FormUrlEncodedContent(data));
                    var res = Jw.JsonToGenericEntity(await resp.Content.ReadAsStringAsync());

                    await _fw.Trace("UV2C", $"{campaignId} {uriStr} after login {res}");

                    var token = res.GetS("payload");

                    if (token.IsNullOrWhitespace()) return defaultUrl;

                    var fileIdUrl = $"https://go.unsubcentral.com/backend/api/keys?token={token}&find=ByAffiliateKeyStringEquals&keyString={key}";

                    await _fw.Trace("UV2C", $"{campaignId} {uriStr} before get {fileIdUrl}");

                    resp = await client.GetAsync(fileIdUrl);
                    res = Jw.JsonToGenericEntity(await resp.Content.ReadAsStringAsync());

                    await _fw.Trace("UV2C", $"{campaignId} {uriStr} after get {fileIdUrl}");

                    var unsubListId = res.GetS("unsubList/id");
                    var dlUrl = $"https://go.unsubcentral.com/backend/api/export/list/{unsubListId}/download?token={token}&type=DOWNLOAD_GRP_ENC_TEXT";

                    await _fw.Trace("UV2C", $"{campaignId} {uriStr} before get {dlUrl}");
                    resp = await client.GetAsync(dlUrl);
                    res = Jw.JsonToGenericEntity(await resp.Content.ReadAsStringAsync());

                    await _fw.Trace("UV2C", $"{campaignId} {uriStr} after get {dlUrl}");

                    var dl = res.GetS("payload");

                    await _fw.Trace(_logMethod, $"Retrieved Unsub location: {uri} -> {res}");

                    var result = string.IsNullOrWhiteSpace(dl) ? defaultUrl : dl;
                    await _fw.Trace("UV2C", $"{campaignId} {uriStr} result {result}");

                    return result;
                }
            }
            catch (Exception e)
            {
                await _fw.Error("UV2C", $"{campaignId} {uriStr} Unhandled exception getting unsub link: {e.UnwrapForLog()}");
                await _fw.Error(_logMethod, $"Unhandled exception getting unsub link: {e.UnwrapForLog()}");
                return defaultUrl;
            }
        }
    }
}
