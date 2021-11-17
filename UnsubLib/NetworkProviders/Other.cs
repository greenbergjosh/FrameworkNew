using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Xml;
using Utility;
using Utility.DataLayer;
using Utility.Entity;

namespace UnsubLib.NetworkProviders
{
    public class Other : INetworkProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(Other)}";

        public Other(FrameworkWrapper fw) => _fw = fw;

        public async Task<Entity> GetCampaigns(Entity network)
        {
            var networkName = await network.EvalS("$meta.name");
            var apiKey = await network.EvalS("Credentials.NetworkApiKey");
            var networkId = await network.EvalS("$meta.id");
            var apiUrl = await network.EvalS("Credentials.NetworkApiUrl");
            string campaignXml = null;

            try
            {
                IDictionary<string, string> parms = new Dictionary<string, string>
                    {
                        { "apikey", apiKey },
                        { "apiFunc", "getcampaigns" }
                    };

                await _fw.Trace(_logMethod, $"Getting campaigns from {networkName}");
                campaignXml = await ProtocolClient.HttpPostAsync(apiUrl, parms);

                var xml = new XmlDocument();

                try
                {
                    xml.LoadXml(campaignXml);
                    await _fw.Trace(_logMethod, $"Retrieved campaigns from {networkName}");
                }
                catch
                {
                    await _fw.Error(_logMethod, $"Campaign response from {networkName} was invalid xml.\r\nResponse:\r\n{campaignXml}");
                    return null;
                }

                var res = await Data.CallFn("Unsub", "MergeNetworkCampaigns",
                    JsonSerializer.Serialize(new
                    {
                        NetworkId = networkId,
                        PayloadType = "xml",
                        DataPath = "/dataset/data",
                        CampaignIdPath = "campaignid",
                        NamePath = "name",
                        RelationshipPath = "campaignid"
                    }),
                    campaignXml);

                if (res == null || await res.EvalS("result", null) == "failed")
                {
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{apiKey}::{apiUrl}\r\nDB Response:\r\n{res}\r\nApi Response:\r\n{campaignXml ?? "null"}");
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
                await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{apiKey}::{apiUrl}::{campaignXml ?? "null"}::{e}");
                throw new Exception($"Failed to get {networkName} campaigns");
            }
        }

        public async Task<Uri> GetSuppressionLocationUrl(Entity network, string unsubRelationshipId)
        {
            var networkName = await network.EvalS("$meta.name");
            var apiKey = await network.EvalS("Credentials.NetworkApiKey");
            var apiUrl = await network.EvalS("Credentials.NetworkApiUrl");
            var parallelism = await network.EvalI("Credentials.Parallelism", 5);

            IDictionary<string, string> parms = new Dictionary<string, string>()
                {
                    { "apikey", apiKey },
                    { "apiFunc", "getsuppression" },
                    { "campaignid", unsubRelationshipId }
                };

            string suppDetails = null;

            try
            {
                suppDetails = await ProtocolClient.HttpPostAsync(apiUrl, parms, 60, "", parallelism);
                var xml = new XmlDocument();

                xml.LoadXml(suppDetails);
                var xn = xml.SelectSingleNode("/dataset/data/suppurl");
                var url = xn.FirstChild.Value;

                await _fw.Trace("UV2C", $"GetSuppressionLocationUrl {url} {unsubRelationshipId}");

                return new Uri(url);
            }
            catch (HttpRequestException e)
            {
                throw new HaltingException($"Halting exception getting suppression from {networkName} {unsubRelationshipId}", e);
            }
            catch (Exception findUnsubException)
            {
                await _fw.Error(_logMethod, $"Exception finding unsub file source from {networkName} {unsubRelationshipId}: {suppDetails ?? "null"}::{findUnsubException}");
                return null;
            }
        }
    }
}
