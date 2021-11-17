using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.Entity;

namespace UnsubLib.NetworkProviders
{
    public class Affise : INetworkProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(Affise)}";

        public Affise(FrameworkWrapper fw) => _fw = fw;

        public async Task<Entity> GetCampaigns(Entity network)
        {
            var networkName = await network.EvalS("$meta.name");
            var networkId = await network.EvalS("$meta.id");

            var apiUrl = await network.EvalS("Credentials.NetworkApiUrl");
            var apiKey = await network.EvalS("Credentials.NetworkApiKey");

            var requestHeaders = new[] { ("Accept", "application/json"), ("API-Key", apiKey) };

            (bool success, string body) result = default;

            try
            {
                await _fw.Trace(_logMethod, $"Getting campaigns from {networkName}");
                var campaignsUrl = INetworkProvider.BuildUrl(apiUrl, "partner/offers", new Dictionary<string, string> { ["limit"] = "500" });

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
                        DataPath = "{offers}",
                        CampaignIdPath = "{id}",
                        NamePath = "{title}",
                        RelationshipPath = "{id}"
                    }),
                    campaigns.ToString()
                );

                if (res == null || await res.EvalS("result", null) == "failed")
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
            var networkName = await network.EvalS("$meta.name");
            var networkId = await network.EvalS("$meta.id");
            var apiUrl = await network.EvalS("Credentials.NetworkApiUrl");
            var apiKey = await network.EvalS("Credentials.NetworkApiKey");

            var requestHeaders = new[] { ("Accept", "application/json"), ("API-Key", apiKey) };

            (bool success, string body) result = default;

            try
            {
                var campaignsUrl = INetworkProvider.BuildUrl(apiUrl, "partner/offers", new Dictionary<string, string> { ["int_id[]"] = unsubRelationshipId });

                result = await ProtocolClient.HttpGetAsync(campaignsUrl, requestHeaders);

                if (!result.success)
                {
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaign {unsubRelationshipId} {networkId}::{apiKey}::{apiUrl}\r\nAPI Response:\r\n{result.body}");
                    return null;
                }

                Entity offer;
                try
                {
                    offer = await network.Parse("application/json", result.body);
                }
                catch (Exception ex)
                {
                    await _fw.Error(_logMethod, $"Campaign suppression response from {networkName} {unsubRelationshipId} was invalid json.\r\nResponse:\r\n{result.body}\r\nException:{ex}");
                    return null;
                }

                if (await offer.EvalI("status") != 1)
                {
                    await _fw.Error(_logMethod, $"Campaign suppression response from {networkName} {unsubRelationshipId} was invalid.\r\nResponse:\r\n{result.body}");
                    return null;
                }

                var description = await offer.EvalS("offers[0].description_lang.en");
                if (string.IsNullOrWhiteSpace(description))
                {
                    await _fw.Error(_logMethod, $"Campaign suppression response from {networkName} {unsubRelationshipId} missing or empty description.\r\nResponse:\r\n{result.body}");
                    return null;
                }

                var urlMatchRegex = await network.EvalS("Credentials.SuppressionDownloadLinkRegex");

                var match = Regex.Match(description, urlMatchRegex);
                if (!match.Success)
                {
                    await _fw.Error(_logMethod, $"Campaign suppression response from {networkName} {unsubRelationshipId} no download URL found in description.\r\nResponse:\r\n{result.body}\r\nRegex:\r\n{urlMatchRegex}");
                    return null;
                }

                var downloadUrl = match.Groups["url"].Value;

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
