using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;

namespace UnsubLib.NetworkProviders
{
    class Tune : INetworkProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(Tune)}";

        public Tune(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public async Task<IGenericEntity> GetCampaigns(IGenericEntity network)
        {
            var networkId = network.GetS("Id");
            var networkName = network.GetS("Name");
            var baseUrl = network.GetS("Credentials/BaseUrl");
            var affiliateId = network.GetS("Credentials/NetworkAffiliateId");
            var apiKey = network.GetS("Credentials/NetworkApiKey");

            var relationshipPath = network.GetS("Credentials/UnsubRelationshipPath");
            var campaignIdPath = network.GetS("Credentials/CampaignIdPath");
            var campaignNamePath = network.GetS("Credentials/CampaignNamePath");

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

                var campaigns = JsonWrapper.ToGenericEntity(body);

                await _fw.Trace(_logMethod, $"Retrieved campaigns from {networkName}");

                var flattened = new Dictionary<string, IGenericEntity>(campaigns.GetDe("response/data").Select(c => new KeyValuePair<string, IGenericEntity>(c.key, c.entity.GetE("Offer"))));
                var converted = JsonWrapper.Serialize(new { body = flattened.Values.Select(entity => JsonConvert.DeserializeObject(entity.GetS(""))) });

                var res = await Data.CallFn("Unsub", "MergeNetworkCampaigns",
                        JsonWrapper.Json(new
                        {
                            NetworkId = networkId,
                            PayloadType = "json",
                            DataPath = "{body}",
                            CampaignIdPath = campaignIdPath,
                            NamePath = campaignNamePath,
                            RelationshipPath = relationshipPath
                        }), converted);

                if (res == null || res.GetS("result") == "failed")
                {
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{url}::\r\nDB Response:\r\n{res.GetS("") ?? "[null]"}\r\nApi Response:\r\n{responseBody ?? "[null]"}");
                    return null;
                }

                var enriched = AddUnsubDownloadFileUri(res, flattened);

                return enriched;
            }
            catch (HaltingException) { throw; }
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

        public Task<Uri> GetSuppressionLocationUrl(IGenericEntity network, string unsubRelationshipId)
        {
            throw new NotImplementedException();
        }

        private static IGenericEntity AddUnsubDownloadFileUri(IGenericEntity campaigns, Dictionary<string, IGenericEntity> tuneCampaigns)
        {
            var enriched = new List<IGenericEntity>();

            foreach (var campaign in campaigns.GetL(""))
            {
                var offerId = campaign.GetS("NetworkCampaignId");
                if (!tuneCampaigns.TryGetValue(offerId, out var tuneCampaign))
                {
                    continue;
                }

                var unsubFileDownloadUri = tuneCampaign.GetS("dne_download_url");

                if (string.IsNullOrWhiteSpace(unsubFileDownloadUri))
                {
                    continue;
                }

                var serialized = campaign.GetS("");

                var uriProperty = PL.C("UnsubFileDownloadUri", unsubFileDownloadUri);

                var campaignObject = PL.FromJsonString(serialized);
                campaignObject.Add(uriProperty);

                var entity = JsonWrapper.JsonToGenericEntity(campaignObject.ToString());
                enriched.Add(entity);
            }

            return JsonWrapper.JsonToGenericEntity(JsonWrapper.Serialize(enriched.Select(campaign => JsonConvert.DeserializeObject(campaign.GetS("")))));
        }
    }
}
