using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Xml;
using Utility;

using Sql = Utility.SqlWrapper;
using Jw = Utility.JsonWrapper;

namespace UnsubLib.NetworkProviders
{
    public interface INetworkProvider
    {
        Task<IGenericEntity> GetCampaigns(IGenericEntity network);
        Task<Uri> GetSuppresionLocationUrl(IGenericEntity network, string unsubRelationshipId);
    }

    public class HaltingException : Exception
    {
        public HaltingException(string message, Exception e) : base(message, e) { }
    }

    public static class Factory
    {
        public static INetworkProvider GetInstance(FrameworkWrapper fw, IGenericEntity network)
        {
            return network.GetS("Credentials/NetworkType") == "Cake" ? new Cake(fw) : (INetworkProvider)new Other(fw);
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
                var relationshipPath = network.GetS("Credentials/UnsubRelationshipPath");
                var campaignIdPath = network.GetS("Credentials/CampaignIdPath");
                var campaignNamePath = network.GetS("Credentials/CampaignNamePath");
                var url = BuildUrl(network.GetS("Credentials/BaseUrl"), network.GetS("Credentials/GetCampaignsPath"), network.GetS("Credentials/NetworkApiKey"), network.GetS("Credentials/NetworkAffiliateId"));
                string respBody = null;

                try
                {

                    await _fw.Trace(_logMethod, $"Getting campaigns from {networkName}");
                    var resp = await ProtocolClient.HttpGetAsync(url, new[] { (key: "Accept", value: "application/json") });
                    await _fw.Trace(_logMethod, $"Retrieved campaigns from {networkName}");

                    if (resp.success == false) throw new HaltingException($"Http request for campaigns failed for {networkName}: {url}", null);

                    respBody = resp.body;

                    var res = await Sql.SqlToGenericEntity("Unsub", "MergeNetworkCampaigns",
                        Jw.Json(new
                        {
                            NetworkId = networkId,
                            PayloadType = "json",
                            DataPath = "$.data",
                            CampaignIdPath = campaignIdPath,
                            NamePath = campaignNamePath,
                            RelationshipPath = relationshipPath
                        }), respBody);

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

            public async Task<Uri> GetSuppresionLocationUrl(IGenericEntity network, string unsubRelationshipId)
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

                    if (resp.success == false) throw new HaltingException($"Http request for campaigns failed for {networkName}: {url}", null);

                    respBody = resp.body;
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
                var url = $"{baseUrl}{path}";

                if (!url.Contains("?")) url += "?";
                else url += "&";

                url += $"api_key={apiKey}&affiliate_id={affiliateId}";

                if (qs?.Any() == true) url += qs.Select(p => $"&{p.Key}={p.Value}").Join("&");

                if (unsubRelationshipId != null) url = url.Replace("{unsubRelationshipId}", unsubRelationshipId);

                return url;
            }

        }

        private class Other : INetworkProvider
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
                    await _fw.Trace(_logMethod, $"Retrieved campaigns from {networkName}");

                    var res = await Sql.SqlToGenericEntity("Unsub", "MergeNetworkCampaigns",
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

            public async Task<Uri> GetSuppresionLocationUrl(IGenericEntity network, string unsubRelationshipId)
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

                    return new Uri(xn.FirstChild.Value);
                }
                catch (HttpRequestException e)
                {
                    throw new HaltingException($"Halting exception getting suppression from {networkName} {unsubRelationshipId}", e);
                }
                catch (Exception findUnsubException)
                {
                    await _fw.Error(_logMethod, $"Exception finding unsub file source fro {networkName} {unsubRelationshipId}: {suppDetails ?? "null"}::{findUnsubException}");
                    return null;
                }
            }
        }
    }



}
