using System;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Utility;

namespace UnsubLib.UnsubFileProviders
{
    public class Optizmo : IUnsubLocationProvider
    {
        private readonly FrameworkWrapper _fw;
        private string _logMethod = $"{nameof(UnsubFileProviders)}.{nameof(Optizmo)}";

        public Optizmo(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public async Task<string> GetFileUrl(IGenericEntity network, Uri uri)
        {
            if (uri.ToString().Contains("mailer.optizmo.net"))
            {
                await _fw.Trace(_logMethod, $"Getting Unsub location: {uri}");

                var optizmoUnsubUrl = await GetOptizmoUnsubFileUri(uri.AbsolutePath, network.GetS($"Credentials/OptizmoToken"));

                await _fw.Trace(_logMethod, $"Retrieved Unsub location: {uri} -> {optizmoUnsubUrl}");

                if (optizmoUnsubUrl != "") return optizmoUnsubUrl;

                await _fw.Error(_logMethod, $"Empty Optizmo url: {uri}");
            }

            return null;
        }

        public async Task<string> GetOptizmoUnsubFileUri(string url, string optizmoToken)
        {
            var optizmoUnsubUrl = "";
            var pathParts = url.Split('/');
            //https://mailer-api.optizmo.net/accesskey/download/m-zvnv-i13-7e6680de24eb50b1e795517478d0c959?token=lp1fURUWHOOkPnEq6ec0hrRAe3ezcfVK&format=md5
            var optizmoUrl = new StringBuilder("https://mailer-api.optizmo.net/accesskey/download/");
            optizmoUrl.Append(pathParts[pathParts.Length - 1]);
            optizmoUrl.Append($"?token={optizmoToken}&format=md5");
            //503 Service Unavailable
            Tuple<bool, string> aojson = null;
            var retryCount = 0;
            var retryWalkaway = new[] { 1, 10, 50, 100, 300 };
            while (retryCount < 5)
            {
                aojson = await ProtocolClient.HttpGetAsync(optizmoUrl.ToString(), 60 * 30);
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

    }

}
