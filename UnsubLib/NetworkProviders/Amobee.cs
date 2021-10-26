using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;

namespace UnsubLib.NetworkProviders
{
    public class Amobee : INetworkProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(Amobee)}";

        public Amobee(FrameworkWrapper fw) => _fw = fw;

        public async Task<IGenericEntity> GetCampaigns(IGenericEntity network)
        {
            var networkName = network.GetS("Name");
            var networkId = network.GetS("Id");
            var apiUrl = network.GetS("Credentials/NetworkApiUrl");
            var apiKey = network.GetS("Credentials/NetworkApiKey");
            var campaignsPath = network.GetS("Credentials/GetCampaignsPath");

            var requestHeaders = new[] { ("Accept", "application/json"), ("Authorization", $"Bearer {apiKey}") };

            (bool success, string body) result = default;

            try
            {
                await _fw.Trace(_logMethod, $"Getting campaigns from {networkName}");
                var campaignsUrl = INetworkProvider.BuildUrl(apiUrl, campaignsPath, new Dictionary<string, string> { ["records"] = "9999" });

                result = await ProtocolClient.HttpGetAsync(campaignsUrl, requestHeaders);

                if (!result.success)
                {
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{apiKey}::{apiUrl}\r\nAPI Response:\r\n{result.body}");
                    return null;
                }

                JObject campaigns;
                try
                {
                    campaigns = JObject.Parse(result.body);
                    await _fw.Trace(_logMethod, $"Retrieved campaigns from {networkName}");
                }
                catch (JsonReaderException)
                {
                    await _fw.Error(_logMethod, $"Campaign response from {networkName} was invalid json.\r\nResponse:\r\n{result.body}");
                    return null;
                }

                var res = await Data.CallFn("Unsub", "MergeNetworkCampaigns",
                    JsonConvert.SerializeObject(new
                    {
                        NetworkId = networkId,
                        PayloadType = "json",
                        DataPath = "{data}",
                        CampaignIdPath = "{id}",
                        NamePath = "{name}",
                        RelationshipPath = "{id}"
                    }),
                    campaigns.ToString()
                );

                if (res == null || res.GetS("result") == "failed")
                {
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{apiKey}::{apiUrl}\r\nDB Response:\r\n{res.GetS("") ?? "[null]"}\r\nApi Response:\r\n{campaigns}");
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
                await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{apiKey}::{apiUrl}::{result}::{e}");
                throw new Exception($"Failed to get {networkName} campaigns");
            }
        }

        public async Task<Uri> GetSuppressionLocationUrl(IGenericEntity network, string unsubRelationshipId)
        {
            var networkName = network.GetS("Name");
            var networkId = network.GetS("Id");
            var apiUrl = network.GetS("Credentials/NetworkApiUrl");
            var apiKey = network.GetS("Credentials/NetworkApiKey");
            var campaignSuppressionUrlPath = network.GetS("Credentials/CampaignSuppressionUrlPath");

            var requestHeaders = new[] { ("Accept", "application/json"), ("Authorization", $"Bearer {apiKey}") };

            (bool success, string body) result = default;

            try
            {
                var campaignsUrl = INetworkProvider.BuildUrl(apiUrl, campaignSuppressionUrlPath).Replace("{campaignId}", unsubRelationshipId);

                result = await ProtocolClient.HttpGetAsync(campaignsUrl, requestHeaders);

                if (!result.success)
                {
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaign {unsubRelationshipId} {networkId}::{apiKey}::{apiUrl}\r\nAPI Response:\r\n{result.body}");
                    return null;
                }

                JObject info;
                try
                {
                    info = JObject.Parse(result.body);
                }
                catch (JsonReaderException)
                {
                    await _fw.Error(_logMethod, $"Campaign suppression response from {networkName} {unsubRelationshipId} was invalid json.\r\nResponse:\r\n{result.body}");
                    return null;
                }

                var downloadUrl = info["data"]?["download_url"]?.Value<string>();
                if (string.IsNullOrWhiteSpace(downloadUrl))
                {
                    await _fw.Error(_logMethod, $"Campaign suppression response from {networkName} {unsubRelationshipId} missing or empty download url.\r\nResponse:\r\n{result.body}");
                    return null;
                }

                return new Uri(downloadUrl);
            }
            catch (HttpRequestException ex)
            {
                throw new HaltingException($"Halting exception getting suppression from {networkName} {unsubRelationshipId}", ex);
            }
            catch (Exception ex)
            {
                await _fw.Error(_logMethod, $"Exception finding unsub file source from {networkName} {unsubRelationshipId}::{result}::{ex}");
                return null;
            }
        }
    }
}
