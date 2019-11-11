using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Xml;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace UnsubLib.NetworkProviders
{
    public interface INetworkProvider
    {
        Task<IGenericEntity> GetCampaigns(IGenericEntity network);
        Task<Uri> GetSuppressionLocationUrl(IGenericEntity network, string unsubRelationshipId);
    }


    public static class Factory
    {
        public static INetworkProvider GetInstance(FrameworkWrapper fw, IGenericEntity network)
        {
            switch (network.GetS("Credentials/NetworkType"))
            {
                case "Cake":
                    return new Cake(fw);

                case "W4":
                    return new W4(fw);

                default:
                    return new Other(fw);
            }
        }

        public class W4 : INetworkProvider
        {
            private readonly FrameworkWrapper _fw;
            private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(W4)}";

            public W4(FrameworkWrapper fw)
            {
                _fw = fw;
            }

            public async Task<IGenericEntity> GetCampaigns(IGenericEntity network)
            {
                var networkId = network.GetS("Id");
                var networkName = network.GetS("Name");
                var apiKey = network.GetS($"Credentials/NetworkApiKey");
                var apiUrl = network.GetS($"Credentials/NetworkApiUrl");
                var limit = int.Parse(network.GetS("Credentials/RequestLimitCount"));
                var offset = 0;
                var url = $"{apiUrl}?key_id={apiKey}&limit={limit}&offset={offset}&status=approved";

                try
                {
                    await _fw.Trace(_logMethod, $"Getting campaigns from {networkName}");
                    
                    var (_, body) = await ProtocolClient.HttpGetAsync(url);

                    // PLEASE WAIT A FEW MINUTES BEFORE NEXT API CALL

                    var allCampaigns = new List<object>();

                    try
                    {
                        do
                        {
                            var ge = Jw.JsonToGenericEntity(body);
                            var success = ge.GetB("success");
                            
                            if (!success)
                                throw new InvalidOperationException(ge.GetS("message"));

                            var data = ge.GetE("data");
                            var results = data.Get<IEnumerable<object>>("results").ToList();

                            if (!results.Any())
                                break;

                            allCampaigns.AddRange(results);
                            offset += results.Count;

                            if (results.Count < limit)
                                break;

                        } while (true);

                        await _fw.Trace(_logMethod, $"Retrieved campaigns from {networkName}");
                    }
                    catch
                    {
                        await _fw.Error(_logMethod,
                            $"Campaign response from {networkName} was invalid xml.\r\nResponse:\r\n{body}");
                        return null;
                    }

                    var payload = Jw.Serialize(new Dictionary<string, object>
                    {
                        ["data"] = allCampaigns
                    });

                    var res = await Data.CallFn("Unsub", "MergeNetworkCampaigns",
                        Jw.Json(new
                        {
                            NetworkId = networkId,
                            PayloadType = "W4"
                        }), payload);

                    if (res == null || res.GetS("result") == "failed")
                    {
                        await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{apiKey}::{apiUrl}\r\nDB Response:\r\n{res.GetS("") ?? "[null]"}\r\nApi Response:\r\n{body ?? "null"}");
                        return null;
                    }

                    return res;
                }
                catch (HttpRequestException e)
                {
                    throw new HaltingException($"Halting exception getting campaigns from {networkName}: {apiUrl}", e);
                }
                catch (Exception e)
                {
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{apiKey}::{apiUrl}::{url}::{e}");
                    throw new Exception($"Failed to get {networkName} campaigns");
                }
            }

            public async Task<Uri> GetSuppressionLocationUrl(IGenericEntity network, string campaignId)
            {
                var networkName = network.GetS("Name");
                var apiKey = network.GetS("Credentials/NetworkApiKey");
                var apiUrl = network.GetS("Credentials/NetworkApiSuppressionUrl");
                var url = $"{apiUrl}?key_id={apiKey}&campaign_id={campaignId}";

                try
                {
                    var resp = await ProtocolClient.HttpGetAsync(url, new[] { (key: "Accept", value: "application/json") }, 300);
                    var ge = Jw.JsonToGenericEntity(resp.body);
                    var success = ge.GetB("success");

                    if (!success)
                        throw new InvalidOperationException(ge.GetS("message"));

                    var data = Jw.JsonToGenericEntity(ge.GetS("data"));
                    var suppressionUrl = data.GetS("download_link");

                    await _fw.Trace(_logMethod, $"Got URL {networkName} {campaignId}:{url}:{suppressionUrl}:{resp.body}");

                    return new Uri(suppressionUrl);
                }
                catch (HttpRequestException e)
                {
                    throw new HaltingException($"Halting exception getting suppression from {networkName} {campaignId}", e);
                }
                catch (Exception findUnsubException)
                {
                    await _fw.Error(_logMethod, $"Exception finding unsub file source from {networkName} {campaignId}:{url}::{findUnsubException}");
                    return null;
                }
            }
        }

        private class Cake : INetworkProvider
        {
            private readonly FrameworkWrapper _fw;
            private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(Cake)}";

            public Cake(FrameworkWrapper fw)
            {
                _fw = fw;
            }

            public async Task<IGenericEntity> GetCampaigns(IGenericEntity network)
            {
                var networkName = network.GetS("Name");
                var networkId = network.GetS("Id");
                var dataPath = network.GetS("Credentials/CampaignDataPath");
                var relationshipPath = network.GetS("Credentials/UnsubRelationshipPath");
                var campaignIdPath = network.GetS("Credentials/CampaignIdPath");
                var campaignNamePath = network.GetS("Credentials/CampaignNamePath");
                var url = BuildUrl(network.GetS("Credentials/BaseUrl"), network.GetS("Credentials/GetCampaignsPath"), network.GetS("Credentials/NetworkApiKey"), network.GetS("Credentials/NetworkAffiliateId"));
                string respBody = null;

                try
                {

                    await _fw.Trace(_logMethod, $"Getting campaigns from {networkName}");
                    var resp = await ProtocolClient.HttpGetAsync(url, new[] { (key: "Accept", value: "application/json") });

                    if (resp.success == false) throw new HaltingException($"Http request for campaigns failed for {networkName}: {url}", null);
                    var jbody = Jw.TryParseObject(resp.body);

                    if (jbody == null) throw new HaltingException($"Http request for campaigns failed for {networkName}: {url} {resp.body}", null);

                    await _fw.Trace(_logMethod, $"Retrieved campaigns from {networkName}");

                    respBody = resp.body;

                    var res = await Data.CallFn("Unsub", "MergeNetworkCampaigns",
                        Jw.Json(new
                        {
                            NetworkId = networkId,
                            PayloadType = "json",
                            DataPath = dataPath,
                            CampaignIdPath = campaignIdPath,
                            NamePath = campaignNamePath,
                            RelationshipPath = relationshipPath
                        }), respBody);

                    if (res == null || res.GetS("result") == "failed")
                    {
                        await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{url}::\r\nDB Response:\r\n{res.GetS("")??"[null]"}\r\nApi Response:\r\n{respBody ?? "[null]"}");
                        return null;
                    }

                    return res;
                }
                catch (HaltingException) { throw; }
                catch (HttpRequestException e)
                {
                    throw new HaltingException($"Halting exception getting campaigns from {networkName}: {url}", e);
                }
                catch (Exception e)
                {
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{url}::{respBody ?? "null"}::{e}");
                    throw new Exception($"Failed to get {networkName} campaigns", e);
                }
            }

            public async Task<Uri> GetSuppressionLocationUrl(IGenericEntity network, string unsubRelationshipId)
            {
                var networkName = network.GetS("Name");
                var networkId = network.GetS("Id");
                var downloadUrlPath = network.GetS("Credentials/DownloadUrlPath");
                var url = BuildUrl(network.GetS("Credentials/BaseUrl"), network.GetS("Credentials/GetSuppressionPath"),
                    network.GetS("Credentials/NetworkApiKey"), network.GetS("Credentials/NetworkAffiliateId"), unsubRelationshipId);
                string respBody = null;

                try
                {
                    var resp = await ProtocolClient.HttpGetAsync(url, new[] { (key: "Accept", value: "application/json") });

                    respBody = resp.body;
                    var rb = Jw.JsonToGenericEntity(respBody);

                    if (rb?.GetS("message") == "Suppresion List Not Found") return null;

                    if (resp.success == false) throw new Exception($"Http request for suppression url failed for {networkName}: {url} {resp.body}", null);
                    
                    var dlUrl = Jw.JsonToGenericEntity(respBody).GetS(downloadUrlPath);

                    return dlUrl.IsNullOrWhitespace() ? null : new Uri(dlUrl);
                }
                catch (HaltingException) { throw; }
                catch (HttpRequestException e)
                {
                    throw new HaltingException($"Halting exception getting unsub from {networkName}: {url}", e);
                }
                catch (Exception e)
                {
                    await _fw.Error(_logMethod, $"Failed to get unsub for {networkName}: {url}::{respBody ?? "null"}::{e}");
                    return null;
                }
            }

            private string BuildUrl(string baseUrl, string path, string apiKey, string affiliateId, string unsubRelationshipId = null, Dictionary<string, string> qs = null)
            {
                var url = $"{baseUrl}";

                if (!baseUrl.EndsWith("/") && !path.StartsWith("/")) url += "/";

                url += path;

                if (!url.Contains("?")) url += "?";
                else url += "&";

                url += $"api_key={apiKey}&affiliate_id={affiliateId}";

                if (qs?.Any() == true) url += qs.Select(p => $"&{p.Key}={p.Value}").Join("&");

                if (unsubRelationshipId != null) url = url.Replace("{unsubRelationshipId}", unsubRelationshipId);

                return url;
            }

        }

        public class Other : INetworkProvider
        {
            private readonly FrameworkWrapper _fw;
            private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(Other)}";

            public Other(FrameworkWrapper fw)
            {
                _fw = fw;
            }

            public async Task<IGenericEntity> GetCampaigns(IGenericEntity network)
            {
                var networkName = network.GetS("Name");
                var apiKey = network.GetS($"Credentials/NetworkApiKey");
                var networkId = network.GetS("Id");
                var apiUrl = network.GetS($"Credentials/NetworkApiUrl");
                string campaignXml = null;

                try
                {
                    IDictionary<string, string> parms = new Dictionary<string, string>
                    {
                        { "apikey", apiKey },
                        { "apiFunc", "getcampaigns" }
                    };

                    await _fw.Trace(_logMethod, $"Getting campaigns from {networkName}");
                    campaignXml = await ProtocolClient.HttpPostAsync(apiUrl, parms);

                    // PLEASE WAIT A FEW MINUTES BEFORE NEXT API CALL

                    var xml = new XmlDocument();

                    try
                    {
                        xml.LoadXml(campaignXml);
                        await _fw.Trace(_logMethod, $"Retrieved campaigns from {networkName}");
                    }
                    catch
                    {
                        await _fw.Error(_logMethod, $"Campaign response from {networkName} was invalid xml.\r\nResponse:\r\n{campaignXml}");
                        return null;
                    }

                    var res = await Data.CallFn("Unsub", "MergeNetworkCampaigns",
                        Jw.Json(new
                        {
                            NetworkId = networkId,
                            PayloadType = "xml",
                            DataPath = "/dataset/data",
                            CampaignIdPath = "campaignid",
                            NamePath = "name",
                            RelationshipPath = "campaignid"
                        }),
                        campaignXml);

                    if (res == null || res.GetS("result") == "failed")
                    {
                        await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{apiKey}::{apiUrl}\r\nDB Response:\r\n{res.GetS("") ?? "[null]"}\r\nApi Response:\r\n{campaignXml ?? "null"}");
                        return null;
                    }

                    return res;
                }
                catch (HttpRequestException e)
                {
                    throw new HaltingException($"Halting exception getting campaigns from {networkName}: {apiUrl}", e);
                }
                catch (Exception e)
                {
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{apiKey}::{apiUrl}::{campaignXml ?? "null"}::{e}");
                    throw new Exception($"Failed to get {networkName} campaigns");
                }
            }

            public async Task<Uri> GetSuppressionLocationUrl(IGenericEntity network, string unsubRelationshipId)
            {
                var networkName = network.GetS("Name");
                var apiKey = network.GetS($"Credentials/NetworkApiKey");
                var apiUrl = network.GetS($"Credentials/NetworkApiUrl");
                var parallelism = network.GetS("Credentials/Parallelism").ParseInt() ?? 5;

                IDictionary<string, string> parms = new Dictionary<string, string>()
                {
                    { "apikey", apiKey },
                    { "apiFunc", "getsuppression" },
                    { "campaignid", unsubRelationshipId }
                };

                string suppDetails = null;

                try
                {
                    suppDetails = await ProtocolClient.HttpPostAsync(apiUrl, parms, 60, "", parallelism);
                    var xml = new XmlDocument();

                    xml.LoadXml(suppDetails);
                    var xn = xml.SelectSingleNode("/dataset/data/suppurl");
                    var url = xn.FirstChild.Value;

                    await _fw.Trace("UV2C", $"GetSuppressionLocationUrl {url} {unsubRelationshipId}");

                    if (url.Contains("unsubcentral"))
                        url += $"|cid={unsubRelationshipId}";

                    return new Uri(url);
                }
                catch (HttpRequestException e)
                {
                    throw new HaltingException($"Halting exception getting suppression from {networkName} {unsubRelationshipId}", e);
                }
                catch (Exception findUnsubException)
                {
                    await _fw.Error(_logMethod, $"Exception finding unsub file source from {networkName} {unsubRelationshipId}: {suppDetails ?? "null"}::{findUnsubException}");
                    return null;
                }
            }
        }
    }



}
