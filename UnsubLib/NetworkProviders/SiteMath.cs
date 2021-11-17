using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.Entity;

namespace UnsubLib.NetworkProviders
{
    public class SiteMath : INetworkProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(SiteMath)}";

        public SiteMath(FrameworkWrapper fw) => _fw = fw;

        public async Task<Entity> GetCampaigns(Entity network)
        {
            var networkId = await network.EvalS("$meta.id");
            var networkName = await network.EvalS("$meta.name");
            var baseUrl = await network.EvalS("Credentials.BaseUrl");
            var apiKey = await network.EvalS("Credentials.NetworkApiKey");

            var relationshipPath = await network.EvalS("Credentials.UnsubRelationshipPath");
            var campaignIdPath = await network.EvalS("Credentials.CampaignIdPath");
            var campaignNamePath = await network.EvalS("Credentials.CampaignNamePath");

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

                var campaigns = await network.Parse("application/json", responseBody);

                await _fw.Trace(_logMethod, $"Retrieved campaigns from {networkName}");

                var res = await Data.CallFn("Unsub", "MergeNetworkCampaigns",
                    JsonSerializer.Serialize(new
                    {
                        NetworkId = networkId,
                        PayloadType = "json",
                        DataPath = "{}",
                        CampaignIdPath = campaignIdPath,
                        NamePath = campaignNamePath,
                        RelationshipPath = relationshipPath
                    }), responseBody);

                if (res == null || await res.EvalS("result", null) == "failed")
                {
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{url}::\r\nDB Response:\r\n{res}\r\nApi Response:\r\n{responseBody ?? "[null]"}");
                    return null;
                }

                return res;
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

        public async Task<Uri> GetSuppressionLocationUrl(Entity network, string unsubRelationshipId) => new Uri(await network.EvalS("Credentials.GlobalSuppressionUrl"));
    }
}
