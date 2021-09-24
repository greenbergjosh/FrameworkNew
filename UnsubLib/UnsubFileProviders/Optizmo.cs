using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace UnsubLib.UnsubFileProviders
{
    public class Optizmo : IUnsubLocationProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(UnsubFileProviders)}.{nameof(Optizmo)}";
        private const string fileTempl = "https://mailer-api.optizmo.net/accesskey/download/{fileToken}?token={authToken}&format={format}&deltas=0";
        private readonly Regex[] _fileTokenRxs = null;

        public Optizmo(FrameworkWrapper fw)
        {
            _fw = fw;
            _fileTokenRxs = _fw.StartupConfiguration.GetL("Config/OptizmoFilePatterns").Select(ge =>
            {
                string rxStr = null;

                try
                {
                    rxStr = ge.GetS("");

                    if (rxStr.IsNullOrWhitespace()) return (Regex)null;

                    var rx = new Regex(rxStr, RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.ExplicitCapture);

                    if (rx.GetGroupNames().Any(g => g == "token")) return rx;

                    _fw.Error(nameof(Optizmo), $"Failed to load Optizmo file pattern, missing token group {rxStr}").Wait();
                }
                catch (Exception e)
                {
                    _fw.Error(nameof(Optizmo), $"Failed to load Optizmo file pattern {rxStr} {e.UnwrapForLog()}").Wait();
                }

                return null;
            }).Where(rx => rx != null).ToArray();
        }

        public bool CanHandle(IGenericEntity network, string unsubRelationshipId, Uri uri) => uri.ToString().Contains("app.optizmo.com") || uri.ToString().Contains("mailer-api.optizmo.net") || uri.ToString().Contains("mailer.optizmo.net") || uri.ToString().Contains("affiliateaccesskey.com");

        public async Task<(string url, IDictionary<string, string> postData)> GetFileUrl(IGenericEntity network, string unsubRelationshipId, Uri uri)
        {
            if (uri.ToString().Contains("mailer-api.optizmo.net/accesskey/getfile/"))
                return (uri.ToString(), null);

            var useApi = network.GetS("Credentials/UseOptizmoApi").ParseBool() ?? false;
            var authToken = network.GetS($"Credentials/OptizmoToken");

            await _fw.Trace(_logMethod, $"Getting Unsub location: UseApi: {useApi} {uri}");

            if (uri.Query.Contains("mak="))
            {
                var queryString = System.Web.HttpUtility.ParseQueryString(uri.Query);
                var mak = queryString["mak"];

                var path = $"accesskey/download/{mak}";

                return (await GetOptizmoUnsubFileUri(path, authToken), null);
            }
            else if (useApi)
            {
                string fileId = null;

                foreach (var rx in _fileTokenRxs)
                {
                    var m = rx.Match(uri.AbsoluteUri);

                    if (m.Success)
                    {
                        fileId = m.Groups["token"].Value;
                        break;
                    }
                }

                if (!fileId.IsNullOrWhitespace())
                {
                    var baseUrl = fileTempl.Replace("{authToken}", authToken).Replace("{fileToken}", fileId);

                    var retryWalkaway = new[] { 1, 10, 50, 100, 300 };
                    return (await Walkaway.ExecuteWalkaway(async () =>
                    {
                        var res = await ProtocolClient.HttpGetAsync(baseUrl.Replace("{format}", "md5"), timeoutSeconds: 300);

                        if (res.success)
                        {
                            var resGE = Jw.JsonToGenericEntity(res.body);

                            if (String.Equals(resGE?.GetS("error"), "You do not have access to MD5 downloads", StringComparison.CurrentCultureIgnoreCase))
                            {
                                res = await ProtocolClient.HttpGetAsync(baseUrl.Replace("{format}", "plain"), timeoutSeconds: 300);

                                if (res.success) resGE = Jw.JsonToGenericEntity(res.body);
                            }
                            var download = resGE?.GetS("download_link");

                            if (!download.IsNullOrWhitespace())
                            {
                                return download;
                            }

                            await _fw.Error(_logMethod, $"Optizmo API get file url call failed: {baseUrl} derived from: {uri} Response: {resGE?.GetS("")}");
                            throw new InvalidOperationException($"Optizmo API get file url call failed: {baseUrl} derived from: {uri} Response: {resGE?.GetS("")}");
                        }
                        else
                        {
                            await _fw.Error(_logMethod, $"Optizmo API get file call failed against: {baseUrl} derived from: {uri}, with response body: {res.body}");
                            throw new InvalidOperationException($"Optizmo API get file call failed against: {baseUrl} derived from: {uri}, with response body: {res.body}");
                        }
                    }, retryWalkaway), null);
                }
            }

            // Fallback if API failed
            var optizmoUnsubUrl = await GetOptizmoUnsubFileUri(uri.AbsolutePath, authToken);

            await _fw.Trace(_logMethod, $"Retrieved Unsub location: {uri} -> {optizmoUnsubUrl}");

            if (!string.IsNullOrWhiteSpace(optizmoUnsubUrl))
            {
                return (optizmoUnsubUrl, null);
            }

            await _fw.Error(_logMethod, $"Empty Optizmo url returned from: {uri}");

            return default;
        }

        private async Task<string> GetOptizmoUnsubFileUri(string url, string optizmoToken)
        {
            try
            {
                var optizmoUnsubUrl = "";
                var pathParts = url.Split('/');
                //https://mailer-api.optizmo.net/accesskey/download/m-zvnv-i13-7e6680de24eb50b1e795517478d0c959?token=lp1fURUWHOOkPnEq6ec0hrRAe3ezcfVK&format=md5
                var optizmoUrl = new StringBuilder("https://mailer-api.optizmo.net/accesskey/download/");
                optizmoUrl.Append(pathParts[^1]);
                optizmoUrl.Append($"?token={optizmoToken}");
                //503 Service Unavailable
                var retryCount = 0;
                var retryWalkaway = new[] { 1, 10, 50, 100, 300 };
                optizmoUnsubUrl = await Walkaway.ExecuteWalkaway(async () =>
                {
                    await _fw.Trace(nameof(GetOptizmoUnsubFileUri), $"Requesting unsub file uri via: {optizmoUrl}, retries remaining: {retryWalkaway.Length - retryCount}");
                    var (success, body) = await ProtocolClient.HttpGetAsync(optizmoUrl.ToString(), null, 60 * 30);
                    if (success && !string.IsNullOrEmpty(body))
                    {
                        if (body.Contains("503 Service Unavailable"))
                            throw new InvalidOperationException("503 Service Unavailable");

                        var te = new GenericEntityJson();
                        var ts = (JObject)JsonConvert.DeserializeObject(body);
                        te.InitializeEntity(null, null, ts);
                        if (te.GetS("download_link") != null)
                        {
                            return te.GetS("download_link");
                        }
                        else
                        {
                            await _fw.Error(nameof(GetOptizmoUnsubFileUri), $"Via: {optizmoUrl}, download_link value is null");
                            return null;
                        }
                    }
                    else
                    {
                        throw new InvalidOperationException("Invalid response");
                    }
                }, retryWalkaway);

                return optizmoUnsubUrl;
            }
            catch (Exception e)
            {
                await _fw.Error(nameof(GetOptizmoUnsubFileUri), $"Unhandled exception getting unsub link: {e.UnwrapForLog()}");
                return null;
            }
        }
    }
}
