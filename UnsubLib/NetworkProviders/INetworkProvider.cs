using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Sockets;
using System.Threading.Tasks;
using System.Xml;
using Utility;

using Sql = Utility.SqlWrapper;
using Jw = Utility.JsonWrapper;

namespace UnsubLib.NetworkProviders
{
    public interface INetworkProvider
    {
        Task<IGenericEntity> GetCampaigns(IGenericEntity network);
        Task<Uri> GetSuppresionLocationUrl(IGenericEntity network, string networkCampaignId);
    }

    public class HaltingException : Exception
    {
        public HaltingException(string message, Exception e) : base(message, e)
        {
        }
    }

    public static class Factory
    {
        public static INetworkProvider GetInstance(FrameworkWrapper fw, IGenericEntity network)
        {
            return network.GetS("Credentials/NetworkType") == "Cake" ? new Cake(fw) : (INetworkProvider)new Other(fw);
        }

        private class Cake : INetworkProvider
        {
            private readonly FrameworkWrapper _fw;
            private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(Cake)}";

            public Cake(FrameworkWrapper fw)
            {
                _fw = fw;
            }

            public Task<IGenericEntity> GetCampaigns(IGenericEntity network)
            {
                throw new NotImplementedException();
            }

            public Task<Uri> GetSuppresionLocationUrl(IGenericEntity network, string networkCampaignId)
            {
                throw new NotImplementedException();
            }
        }

        private class Other : INetworkProvider
        {
            private readonly FrameworkWrapper _fw;
            private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(Other)}";

            public Other(FrameworkWrapper fw)
            {
                _fw = fw;
            }

            public async Task<IGenericEntity> GetCampaigns(IGenericEntity network)
            {
                var networkName = network.GetS("Name");
                var apiKey = network.GetS($"Credentials/NetworkApiKey");
                var networkId = network.GetS("Id");
                var apiUrl = network.GetS($"Credentials/NetworkApiUrl");

                try
                {
                    IDictionary<string, string> parms = new Dictionary<string, string>
                    {
                        { "apikey", apiKey },
                        { "apiFunc", "getcampaigns" }
                    };
                    string campaignXml = null;

                    await _fw.Trace(_logMethod, $"Getting campaigns from {networkName}");
                    campaignXml = await ProtocolClient.HttpPostAsync(apiUrl, parms);
                    await _fw.Trace(_logMethod, $"Retrieved campaigns from {networkName}");

                    return await Sql.SqlToGenericEntity("Unsub", "MergeNetworkCampaignsXml", Jw.Json(new { NetworkId = networkId }), campaignXml);
                }
                catch (HttpRequestException e)
                {
                    throw new HaltingException($"Halting exception getting campaigns from {networkName}", e);
                }
                catch (Exception e)
                {
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{apiKey}::{apiUrl}::{e}");
                    throw new Exception($"Failed to get {networkName} campaigns");
                }
            }

            public async Task<Uri> GetSuppresionLocationUrl(IGenericEntity network, string networkCampaignId)
            {
                var networkName = network.GetS("Name");
                var apiKey = network.GetS($"Credentials/NetworkApiKey");
                var apiUrl = network.GetS($"Credentials/NetworkApiUrl");
                var parallelism = network.GetS("Credentials/Parallelism").ParseInt() ?? 5;

                IDictionary<string, string> parms = new Dictionary<string, string>()
                {
                    { "apikey", apiKey },
                    { "apiFunc", "getsuppression" },
                    { "campaignid", networkCampaignId }
                };

                string suppDetails = null;

                try
                {
                    suppDetails = await ProtocolClient.HttpPostAsync(apiUrl, parms, 60, "", parallelism);
                    var xml = new XmlDocument();

                    xml.LoadXml(suppDetails);
                    var xn = xml.SelectSingleNode("/dataset/data/suppurl");

                    return new Uri(xn.FirstChild.Value);
                }
                catch (HttpRequestException e)
                {
                    throw new HaltingException($"Halting exception getting suppression from {networkName} {networkCampaignId}", e);
                }
                catch (Exception findUnsubException)
                {
                    await _fw.Error(_logMethod, $"Exception finding unsub file source fro {networkName} {networkCampaignId}: {suppDetails ?? "null"}::{findUnsubException}");
                    throw new Exception("Exception finding unsub file source.");
                }
            }
        }
    }



}
