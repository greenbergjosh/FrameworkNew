using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;

namespace UnsubLib.NetworkProviders
{
    public class Affise : INetworkProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(Affise)}";

        public Affise(FrameworkWrapper fw) => _fw = fw;

        public async Task<IGenericEntity> GetCampaigns(IGenericEntity network)
        {
            var networkName = network.GetS("Name");
            var networkId = network.GetS("Id");

            var apiUrl = network.GetS("Credentials/NetworkApiUrl");
            var apiKey = network.GetS("Credentials/NetworkApiKey");

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
                        DataPath = "{offers}",
                        CampaignIdPath = "{id}",
                        NamePath = "{title}",
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

                JObject offer;
                try
                {
                    offer = JObject.Parse(result.body);
                }
                catch (JsonReaderException)
                {
                    await _fw.Error(_logMethod, $"Campaign suppression response from {networkName} {unsubRelationshipId} was invalid json.\r\nResponse:\r\n{result.body}");
                    return null;
                }

                if (offer["status"].Value<int>() != 1)
                {
                    await _fw.Error(_logMethod, $"Campaign suppression response from {networkName} {unsubRelationshipId} was invalid.\r\nResponse:\r\n{result.body}");
                    return null;
                }

                var description = offer["offers"][0]["description_lang"]["en"].Value<string>();
                if (string.IsNullOrWhiteSpace(description))
                {
                    await _fw.Error(_logMethod, $"Campaign suppression response from {networkName} {unsubRelationshipId} missing or empty description.\r\nResponse:\r\n{result.body}");
                    return null;
                }

                var urlMatchRegex = network.GetS("Credentials/SuppressionDownloadLinkRegex");

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
