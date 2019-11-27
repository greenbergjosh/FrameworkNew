using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace UnsubLib.NetworkProviders
{
    public class W4 : INetworkProvider
        {
            private readonly FrameworkWrapper _fw;
            private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(W4)}";

            public W4(FrameworkWrapper fw)
            {
                _fw = fw;
            }

            public async Task<IGenericEntity> GetCampaigns(IGenericEntity network)
            {
                var networkId = network.GetS("Id");
                var networkName = network.GetS("Name");
                var apiKey = network.GetS($"Credentials/NetworkApiKey");
                var apiUrl = network.GetS($"Credentials/NetworkApiUrl");
                var limit = int.Parse(network.GetS("Credentials/RequestLimitCount"));
                var offset = 0;
                var url = $"{apiUrl}?key_id={apiKey}&limit={limit}&offset={offset}&status=approved";

                try
                {
                    await _fw.Log(_logMethod, $"Getting campaigns from {networkName}");
                    
                    var (_, body) = await ProtocolClient.HttpGetAsync(url);

                    // PLEASE WAIT A FEW MINUTES BEFORE NEXT API CALL

                    var allCampaigns = new List<object>();

                    try
                    {
                        do
                        {
                            var ge = Jw.JsonToGenericEntity(body);
                            var success = ge.GetB("success");
                            
                            if (!success)
                                throw new InvalidOperationException(ge.GetS("message"));

                            var data = ge.GetE("data");
                            var results = data.Get<IEnumerable<object>>("results").ToList();

                            if (!results.Any())
                                break;

                            allCampaigns.AddRange(results);
                            offset += results.Count;

                            if (results.Count < limit)
                                break;

                        } while (true);

                        await _fw.Log(_logMethod, $"Retrieved campaigns from {networkName}");
                    }
                    catch
                    {
                        await _fw.Error(_logMethod,
                            $"Campaign response from {networkName} was invalid xml.\r\nResponse:\r\n{body}");
                        return null;
                    }

                    var payload = Jw.Serialize(new Dictionary<string, object>
                    {
                        ["data"] = allCampaigns
                    });

                    var res = await Data.CallFn("Unsub", "MergeNetworkCampaigns",
                        Jw.Json(new
                        {
                            NetworkId = networkId,
                            PayloadType = "W4"
                        }), payload);

                    if (res == null || res.GetS("result") == "failed")
                    {
                        await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{apiKey}::{apiUrl}\r\nDB Response:\r\n{res.GetS("") ?? "[null]"}\r\nApi Response:\r\n{body ?? "null"}");
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
                    await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{apiKey}::{apiUrl}::{url}::{e}");
                    throw new Exception($"Failed to get {networkName} campaigns");
                }
            }

            public async Task<Uri> GetSuppressionLocationUrl(IGenericEntity network, string campaignId)
            {
                var networkName = network.GetS("Name");
                var apiKey = network.GetS("Credentials/NetworkApiKey");
                var apiUrl = network.GetS("Credentials/NetworkApiSuppressionUrl");
                var url = $"{apiUrl}?key_id={apiKey}&campaign_id={campaignId}";

                try
                {
                    var resp = await ProtocolClient.HttpGetAsync(url, new[] { (key: "Accept", value: "application/json") }, 300);
                    var ge = Jw.JsonToGenericEntity(resp.body);
                    var success = ge.GetB("success");

                    if (!success)
                        throw new InvalidOperationException(ge.GetS("message"));

                    var data = Jw.JsonToGenericEntity(ge.GetS("data"));
                    var suppressionUrl = data.GetS("download_link");

                    await _fw.Log(_logMethod, $"Got URL {networkName} {campaignId}:{url}:{suppressionUrl}:{resp.body}");

                    return new Uri(suppressionUrl);
                }
                catch (HttpRequestException e)
                {
                    throw new HaltingException($"Halting exception getting suppression from {networkName} {campaignId}", e);
                }
                catch (Exception findUnsubException)
                {
                    await _fw.Error(_logMethod, $"Exception finding unsub file source from {networkName} {campaignId}:{url}::{findUnsubException}");
                    return null;
                }
            }
        }



}
