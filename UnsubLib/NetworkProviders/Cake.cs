using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.Entity;

namespace UnsubLib.NetworkProviders
{
    public class Cake : INetworkProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(Cake)}";

        public Cake(FrameworkWrapper fw) => _fw = fw;

        public async Task<Entity> GetCampaigns(Entity network)
        {
            var networkName = await network.GetS("Name");
            var networkId = await network.GetS("Id");
            var dataPath = await network.GetS("Credentials.CampaignDataPath");
            var relationshipPath = await network.GetS("Credentials.UnsubRelationshipPath");
            var campaignIdPath = await network.GetS("Credentials.CampaignIdPath");
            var campaignNamePath = await network.GetS("Credentials.CampaignNamePath");
            var url = BuildUrl(await network.GetS("Credentials.BaseUrl"), await network.GetS("Credentials.GetCampaignsPath"), await network.GetS("Credentials.NetworkApiKey"), await network.GetS("Credentials.NetworkAffiliateId"));
            string respBody = null;

            try
            {

                await _fw.Trace(_logMethod, $"Getting campaigns from {networkName}");
                var resp = await ProtocolClient.HttpGetAsync(url, new[] { (key: "Accept", value: "application/json") });

                if (resp.success == false)
                {
                    throw new HaltingException($"Http request for campaigns failed for {networkName}: {url}", null);
                }

                Entity campaigns;
                try
                {
                    campaigns = await network.Parse("application/json", resp.body);
                }
                catch (Exception ex)
                {
                    throw new HaltingException($"Http request for campaigns failed for {networkName}: {url} {resp.body}", ex);
                }

                await _fw.Trace(_logMethod, $"Retrieved campaigns from {networkName}");

                respBody = resp.body;

                var res = await Data.CallFn("Unsub", "MergeNetworkCampaigns",
                    JsonSerializer.Serialize(new
                    {
                        NetworkId = networkId,
                        PayloadType = "json",
                        DataPath = dataPath,
                        CampaignIdPath = campaignIdPath,
                        NamePath = campaignNamePath,
                        RelationshipPath = relationshipPath
                    }), respBody);

                if (res == null || await res.GetS("result") == "failed")
                {
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{url}::\r\nDB Response:\r\n{res}\r\nApi Response:\r\n{respBody ?? "[null]"}");
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

        public async Task<Uri> GetSuppressionLocationUrl(Entity network, string unsubRelationshipId)
        {
            var networkName = await network.GetS("Name");
            var downloadUrlPath = await network.GetS("Credentials.DownloadUrlPath");
            var url = BuildUrl(await network.GetS("Credentials.BaseUrl"), await network.GetS("Credentials.GetSuppressionPath"), await network.GetS("Credentials.NetworkApiKey"), await network.GetS("Credentials.NetworkAffiliateId"), unsubRelationshipId);
            string respBody = null;

            try
            {
                var resp = await ProtocolClient.HttpGetAsync(url, new[] { (key: "Accept", value: "application/json") });

                respBody = resp.body;

                var rb = await network.Parse("application/json", respBody);
                if (await rb?.GetS("message") == "Suppresion List Not Found")
                {
                    return null;
                }

                if (resp.success == false)
                {
                    throw new Exception($"Http request for suppression url failed for {networkName}: {url} {resp.body}", null);
                }

                var dlUrl = await (await network.Parse("application/json", respBody)).GetS(downloadUrlPath);

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
