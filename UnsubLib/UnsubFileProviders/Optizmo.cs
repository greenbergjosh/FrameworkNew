using System;
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
        private string _logMethod = $"{nameof(UnsubFileProviders)}.{nameof(Optizmo)}";
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

        public bool CanHandle(IGenericEntity network, Uri uri) => 
            uri.ToString().Contains("mailer-api.optizmo.net") || 
            uri.ToString().Contains("mailer.optizmo.net") && !network.GetS($"Credentials/OptizmoToken").IsNullOrWhitespace();

        public async Task<string> GetFileUrl(IGenericEntity network, Uri uri)
        {
            if (uri.ToString().Contains("mailer-api.optizmo.net/accesskey/getfile/"))
                return uri.ToString();

            var useApi = network.GetS("Credentials/UseOptizmoApi").ParseBool() ?? false;
            var authToken = network.GetS($"Credentials/OptizmoToken");

            await _fw.Trace(_logMethod, $"Getting Unsub location: UseApi: {useApi} {uri}");

            if (useApi)
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
                    var res = await ProtocolClient.HttpGetAsync(baseUrl.Replace("{format}", "md5"), timeoutSeconds: 300);

                    if (res.success)
                    {
                        var resGE = res.success ? Jw.JsonToGenericEntity(res.body) : null;
                        
                        if (String.Equals(resGE?.GetS("error"), "You do not have access to MD5 downloads", StringComparison.CurrentCultureIgnoreCase))
                        {
                            res = await ProtocolClient.HttpGetAsync(baseUrl.Replace("{format}", "plain"), timeoutSeconds: 300);

                            if (res.success) resGE = Jw.JsonToGenericEntity(res.body);
                        }
                        var download = resGE?.GetS("download_link");

                        if (!download.IsNullOrWhitespace()) return download;

                        await _fw.Error(_logMethod, $"Optizmo API get file url call failed: {uri} Response: {resGE?.GetS("")}");
                    }
                    else await _fw.Error(_logMethod, $"Optizmo API get file url call failed: {uri}");
                }
            }
            else
            {
                var optizmoUnsubUrl = await GetOptizmoUnsubFileUri(uri.AbsolutePath, authToken);

                await _fw.Trace(_logMethod, $"Retrieved Unsub location: {uri} -> {optizmoUnsubUrl}");

                if (optizmoUnsubUrl != "") return optizmoUnsubUrl;

                await _fw.Error(_logMethod, $"Empty Optizmo url: {uri}");
            }

            return null;
        }

        public async Task<string> GetOptizmoUnsubFileUri(string url, string optizmoToken)
        {
            try
            {
                var optizmoUnsubUrl = "";
                var pathParts = url.Split('/');
                //https://mailer-api.optizmo.net/accesskey/download/m-zvnv-i13-7e6680de24eb50b1e795517478d0c959?token=lp1fURUWHOOkPnEq6ec0hrRAe3ezcfVK&format=md5
                var optizmoUrl = new StringBuilder("https://mailer-api.optizmo.net/accesskey/download/");
                optizmoUrl.Append(pathParts[pathParts.Length - 1]);
                optizmoUrl.Append($"?token={optizmoToken}&format=md5");
                //503 Service Unavailable
                var retryCount = 0;
                var retryWalkaway = new[] { 1, 10, 50, 100, 300 };
                while (retryCount < 5)
                {
                    var aojson = await ProtocolClient.HttpGetAsync(optizmoUrl.ToString(), null, 60 * 30);
                    if (!String.IsNullOrEmpty(aojson.Item2) && aojson.Item1)
                    {
                        if (aojson.Item2.Contains("503 Service Unavailable"))
                        {
                            await Task.Delay(retryWalkaway[retryCount] * 1000);
                            retryCount += 1;
                            continue;
                        }
                        IGenericEntity te = new GenericEntityJson();
                        var ts = (JObject)JsonConvert.DeserializeObject(aojson.Item2);
                        te.InitializeEntity(null, null, ts);
                        if (te.GetS("download_link") != null)
                        {
                            optizmoUnsubUrl = te.GetS("download_link");
                        }
                    }
                    break;
                }

                return optizmoUnsubUrl;
            }
            catch (Exception e)
            {
                await _fw.Error(_logMethod, $"Unhandled exception getting unsub link: {e.UnwrapForLog()}");
                return null;
            }
        }

    }

}
