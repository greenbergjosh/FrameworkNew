using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;

namespace UnsubLib.NetworkProviders
{
    public class SiteMath : INetworkProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(SiteMath)}";

        public SiteMath(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public async Task<IGenericEntity> GetCampaigns(IGenericEntity network)
        {
            var networkId = network.GetS("Id");
            var networkName = network.GetS("Name");
            var baseUrl = network.GetS("Credentials/BaseUrl");
            var apiKey = network.GetS("Credentials/NetworkApiKey");

            var relationshipPath = network.GetS("Credentials/UnsubRelationshipPath");
            var campaignIdPath = network.GetS("Credentials/CampaignIdPath");
            var campaignNamePath = network.GetS("Credentials/CampaignNamePath");

            var url = baseUrl.Replace("{apiKey}", apiKey);

            string responseBody = null;

            try
            {
                await _fw.Trace(_logMethod, $"Getting campaigns from {networkName}");
                bool success;
                (success, responseBody) = await ProtocolClient.HttpGetAsync(url, new[] { (key: "Accept", value: "application/json") });

                if (success == false)
                {
                    throw new HaltingException($"Http request for campaigns failed for {networkName}: {url}", null);
                }

                var campaigns = JsonWrapper.ToGenericEntity(responseBody);

                await _fw.Trace(_logMethod, $"Retrieved campaigns from {networkName}");

                var converted = JsonWrapper.Serialize(new { body = campaigns.GetL("").Select(entity => JsonConvert.DeserializeObject(entity.GetS(""))) });

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

                return res;
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

        public Task<Uri> GetSuppressionLocationUrl(IGenericEntity network, string unsubRelationshipId) => Task.FromResult(new Uri(network.GetS("Credentials/GlobalSuppressionUrl")));
    }
}
