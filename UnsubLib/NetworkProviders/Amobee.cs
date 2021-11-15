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
    public class Amobee : INetworkProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(Amobee)}";

        public Amobee(FrameworkWrapper fw) => _fw = fw;

        public async Task<Entity> GetCampaigns(Entity network)
        {
            var networkName = await network.GetS("$meta.name");
            var networkId = await network.GetS("$meta.id");
            var apiUrl = await network.GetS("Credentials.NetworkApiUrl");
            var apiKey = await network.GetS("Credentials.NetworkApiKey");
            var campaignsPath = await network.GetS("Credentials.GetCampaignsPath");

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

                Entity campaigns;
                try
                {
                    campaigns = await network.Parse("application/json", result.body);
                    await _fw.Trace(_logMethod, $"Retrieved campaigns from {networkName}");
                }
                catch (Exception ex)
                {
                    await _fw.Error(_logMethod, $"Campaign response from {networkName} was invalid json.\r\nResponse:\r\n{result.body}\r\nException:{ex}");
                    return null;
                }

                var res = await Data.CallFn("Unsub", "MergeNetworkCampaigns",
                    JsonSerializer.Serialize(new
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

                if (res == null || await res.GetS("result", null) == "failed")
                {
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{apiKey}::{apiUrl}\r\nDB Response:\r\n{res}\r\nApi Response:\r\n{campaigns}");
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

        public async Task<Uri> GetSuppressionLocationUrl(Entity network, string unsubRelationshipId)
        {
            var networkName = await network.GetS("$meta.name");
            var networkId = await network.GetS("$meta.id");
            var apiUrl = await network.GetS("Credentials.NetworkApiUrl");
            var apiKey = await network.GetS("Credentials.NetworkApiKey");
            var campaignSuppressionUrlPath = await network.GetS("Credentials.CampaignSuppressionUrlPath");

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

                Entity info;
                try
                {
                    info = await network.Parse("application/json", result.body);
                }
                catch (Exception ex)
                {
                    await _fw.Error(_logMethod, $"Campaign suppression response from {networkName} {unsubRelationshipId} was invalid json.\r\nResponse:\r\n{result.body}\r\nException:{ex}");
                    return null;
                }

                var downloadUrl = await info.GetS("data.download_url");
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
