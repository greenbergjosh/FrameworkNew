using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.Entity;

namespace UnsubLib.NetworkProviders
{
    internal class Tune : INetworkProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(Tune)}";

        public Tune(FrameworkWrapper fw) => _fw = fw;

        public async Task<Entity> GetCampaigns(Entity network)
        {
            var networkId = await network.EvalS("$meta.id");
            var networkName = await network.EvalS("$meta.name");
            var baseUrl = await network.EvalS("Credentials.BaseUrl");
            var affiliateId = await network.EvalS("Credentials.NetworkAffiliateId");
            var apiKey = await network.EvalS("Credentials.NetworkApiKey");

            var relationshipPath = await network.EvalS("Credentials.UnsubRelationshipPath");
            var campaignIdPath = await network.EvalS("Credentials.CampaignIdPath");
            var campaignNamePath = await network.EvalS("Credentials.CampaignNamePath");

            var url = baseUrl.Replace("{affiliateId}", affiliateId).Replace("{apiKey}", apiKey);

            string responseBody = null;

            try
            {
                await _fw.Trace(_logMethod, $"Getting campaigns from {networkName}");
                var (success, body) = await ProtocolClient.HttpGetAsync(url, new[] { (key: "Accept", value: "application/json") });

                if (success == false)
                {
                    throw new HaltingException($"Http request for campaigns failed for {networkName}: {url}", null);
                }

                var campaigns = await network.Parse("application/json", body);

                await _fw.Trace(_logMethod, $"Retrieved campaigns from {networkName}");

                var flattened = new Dictionary<string, Entity>();
                foreach (var (key, value) in await campaigns.EvalD("response.data"))
                {
                    flattened[key] = await value.EvalE("Offer");
                }

                var converted = JsonSerializer.Serialize(new { body = flattened });

                var res = await Data.CallFn("Unsub", "MergeNetworkCampaigns",
                    JsonSerializer.Serialize(new
                    {
                        NetworkId = networkId,
                        PayloadType = "json",
                        DataPath = "{body}",
                        CampaignIdPath = campaignIdPath,
                        NamePath = campaignNamePath,
                        RelationshipPath = relationshipPath
                    }), converted);

                if (res == null || await res.EvalS("result", defaultValue: null) == "failed")
                {
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{url}::\r\nDB Response:\r\n{res}\r\nApi Response:\r\n{responseBody ?? "[null]"}");
                    return null;
                }

                var enriched = await AddUnsubDownloadFileUri(res, flattened);

                return enriched;
            }
            catch (HaltingException)
            {
                throw;
            }
            catch (HttpRequestException e)
            {
                throw new HaltingException($"Halting exception getting campaigns from {networkName}: {url}", e);
            }
            catch (Exception e)
            {
                await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{url}::{responseBody ?? "null"}::{e}");
                throw new Exception($"Failed to get {networkName} campaigns", e);
            }
        }

        public async Task<Uri> GetSuppressionLocationUrl(Entity network, string unsubRelationshipId)
        {
            var campaigns = await GetCampaigns(network);

            var campaign = await campaigns.Eval($"[NetworkCampaignId='{unsubRelationshipId}']").SingleOrDefault();

            if (campaign == null)
            {
                await _fw.Error(_logMethod, $"Failed to get {await network.EvalS("$meta.name")} campaign {unsubRelationshipId}");
            }

            var unsubFileDownloadUri = await campaign.EvalS("UnsubFileDownloadUri");
            if (string.IsNullOrWhiteSpace(unsubFileDownloadUri))
            {
                await _fw.Error(_logMethod, $"{await network.EvalS("$meta.name")} campaign {await campaign.EvalS("NetworkCampaignName")} has no file download Uri");
                return null;
            }

            return new Uri(unsubFileDownloadUri);
        }

        private static async Task<Entity> AddUnsubDownloadFileUri(Entity campaigns, Dictionary<string, Entity> tuneCampaigns)
        {
            var enriched = new List<Entity>();

            await foreach (var campaign in campaigns.EvalL("@"))
            {
                var offerId = await campaign.EvalS("NetworkCampaignId");
                if (!tuneCampaigns.TryGetValue(offerId, out var tuneCampaign))
                {
                    continue;
                }

                var unsubFileDownloadUri = await tuneCampaign.EvalS("dne_download_url");

                if (string.IsNullOrWhiteSpace(unsubFileDownloadUri))
                {
                    continue;
                }

                var serialized = await campaign.EvalD("@");

                serialized["UnsubFileDownloadUri"] = campaigns.Create(unsubFileDownloadUri);

                enriched.Add(campaign.Create(serialized));
            }

            return campaigns.Create(enriched);
        }
    }
}
