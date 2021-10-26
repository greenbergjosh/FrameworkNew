using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace UnsubLib.NetworkProviders
{
    public class Cake : INetworkProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(Cake)}";

        public Cake(FrameworkWrapper fw) => _fw = fw;

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
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{url}::\r\nDB Response:\r\n{res.GetS("") ?? "[null]"}\r\nApi Response:\r\n{respBody ?? "[null]"}");
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

        private static string BuildUrl(string baseUrl, string path, string apiKey, string affiliateId, string unsubRelationshipId = null, Dictionary<string, string> qs = null)
        {
            qs ??= new Dictionary<string, string>();
            qs["api_key"] = apiKey;
            qs["affiliate_id"] = affiliateId;

            var url = INetworkProvider.BuildUrl(baseUrl, path, qs);

            if (unsubRelationshipId != null) url = url.Replace("{unsubRelationshipId}", unsubRelationshipId);

            return url;
        }
    }
}
