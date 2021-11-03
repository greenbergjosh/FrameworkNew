using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using Utility;
using Utility.Entity;

namespace UnsubLib.UnsubFileProviders
{
    public class UnsubCentralV2 : IUnsubLocationProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(UnsubFileProviders)}.{nameof(UnsubCentralV2)}";

        public UnsubCentralV2(FrameworkWrapper fw) => _fw = fw;

        public Task<bool> CanHandle(Entity network, string unsubRelationshipId, Uri uri)
        {
            if (uri.ToString().Contains("go.unsubcentral.com"))
            {
                var qs = HttpUtility.ParseQueryString(uri.Query);

                return Task.FromResult((qs["key"] != null && qs["s"] != null) || qs["keyID"] != null);
            }

            return Task.FromResult(false);
        }

        public async Task<(string url, IDictionary<string, string> postData)> GetFileUrl(Entity network, string unsubRelationshipId, Uri uri)
        {
            var uriStr = uri.ToString();

            await _fw.Trace("UV2C", $"{unsubRelationshipId} {uriStr} Entering GetFileUrl");

            var qs2 = HttpUtility.ParseQueryString(uri.Query);
            var defaultUrl = "https://api.unsubcentral.com/api/service/keys/" + qs2["key"] + "?s=" + qs2["s"] + "&format=hash&zipped=true";

            try
            {
                using var client = new HttpClient();
                string key;
                string secure;

                HttpResponseMessage resp;
                var qsOriginal = HttpUtility.ParseQueryString(uri.Query);
                if (qsOriginal["keyID"] != null)
                {
                    await _fw.Trace("UV2C", $"{unsubRelationshipId} {uriStr} Has keyID");

                    var requestMessage = new HttpRequestMessage(HttpMethod.Get, uri);

                    resp = await client.SendAsync(requestMessage);
                    var redirectUrl = resp?.Headers?.Location ?? requestMessage.RequestUri;
                    if (redirectUrl == null)
                    {
                        await _fw.Error("UV2C", $"{unsubRelationshipId} {uriStr} Response had no redirect");
                        await _fw.Error($"{_logMethod}.{nameof(GetFileUrl)}", "Response had no redirect");
                        return (defaultUrl, null);
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

                await _fw.Trace("UV2C", $"{unsubRelationshipId} {uriStr} key {key} secure {secure}");

                if (key.IsNullOrWhitespace() || secure.IsNullOrWhitespace())
                {
                    await _fw.Trace("UV2C", $"{unsubRelationshipId} {uriStr} defaultUrl {defaultUrl}");
                    return (defaultUrl, null);
                }

                // Try new style API first
                var authInfo = await network.GetS("Credentials.DomainAuthStrings[@=\"api.unsubcentral.com\"]", null);

                if (!authInfo.IsNullOrWhitespace())
                {
                    var url = $"https://api.unsubcentral.com/api/service/keys/{key}?s={secure}&format=hash";

                    await _fw.Trace(_logMethod, $"Retrieved Unsub location: {uri} -> {url}");

                    await _fw.Trace("UV2C", $"{unsubRelationshipId} {uriStr} final result {url}");

                    return (url, null);
                }

                var data = new Dictionary<string, string> { { "key", key }, { "s", secure } };
                var loginUrl = $"https://go.unsubcentral.com/backend/api/login";

                await _fw.Trace("UV2C", $"{unsubRelationshipId} {uriStr} before login");

                resp = await client.PostAsync(loginUrl, new FormUrlEncodedContent(data));
                var res = await network.Parse("application/json", await resp.Content.ReadAsStringAsync());

                await _fw.Trace("UV2C", $"{unsubRelationshipId} {uriStr} after login {res.GetS("")}");

                var token = await res.GetS("payload");

                if (token.IsNullOrWhitespace())
                {
                    return (defaultUrl, null);
                }

                var fileIdUrl = $"https://go.unsubcentral.com/backend/api/keys?token={token}&find=ByAffiliateKeyStringEquals&keyString={key}";

                await _fw.Trace("UV2C", $"{unsubRelationshipId} {uriStr} before get {fileIdUrl}");

                resp = await client.GetAsync(fileIdUrl);
                res = await network.Parse("application/json", await resp.Content.ReadAsStringAsync());

                await _fw.Trace("UV2C", $"{unsubRelationshipId} {uriStr} after get {fileIdUrl} response: {res.GetS("")}");

                var unsubListId = await res.GetS("unsubList.id");
                var dlUrl = $"https://go.unsubcentral.com/backend/api/export/list/{unsubListId}/download?token={token}&type=DOWNLOAD_GRP_ENC_TEXT";

                await _fw.Trace("UV2C", $"{unsubRelationshipId} {uriStr} before get {dlUrl}");
                resp = await client.GetAsync(dlUrl);
                res = await network.Parse("application/json", await resp.Content.ReadAsStringAsync());

                await _fw.Trace("UV2C", $"{unsubRelationshipId} {uriStr} after get {dlUrl} response: {res.GetS("")}");

                var dl = await res.GetS("payload");
                await _fw.Trace("UV2C", $"{unsubRelationshipId} payload value: {(!dl.IsNullOrWhitespace() ? dl : $"empty, will use default Url: {defaultUrl}")}");

                var result = string.IsNullOrWhiteSpace(dl) ? defaultUrl : dl;

                await _fw.Trace(_logMethod, $"Retrieved Unsub location: {uri} -> {dl}");

                await _fw.Trace("UV2C", $"{unsubRelationshipId} {uriStr} final result {result}");

                return (result, null);
            }
            catch (Exception e)
            {
                await _fw.Error("UV2C", $"{unsubRelationshipId} {uriStr} Unhandled exception getting unsub link: {e.UnwrapForLog()}");
                await _fw.Error(_logMethod, $"Unhandled exception getting unsub link: {e.UnwrapForLog()}");
                return (defaultUrl, null);
            }
        }
    }
}
