using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;
using Utility.Entity;

// Saving this here in case the google sheet goes away
/*
Partner 	Person 	    API Key
1P	        Aldo	    Wfo0zUBeSCe6fRxxIHavSA
2P	        Nadia	    JJZbQUGQMWGT7g3SWNlQ
2P-C	    Caleb	    fDexAoKKTdeRlAFzzxsmhA
3P	        Andy	    juMp3rkUSH6gS0LaoVEhoQ
3P-C	    Cathy	    mwW7RGstSjuMzh4nCGKXg
3P-R	    Roxy	    VigbsuQeC713gd1bgA
PUSH	    Victoria    kwWLIk3QgerUuY0s2nzgQ
SMS	        Chris	    FQZPfVXMQ7SPBFxkdJgKYw
*/
namespace UnsubLib.NetworkProviders
{
    internal class Everflow : INetworkProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(NetworkProviders)}.{nameof(Everflow)}";

        public Everflow(FrameworkWrapper fw) => _fw = fw;

        public async Task<Entity> GetCampaigns(Entity network)
        {
            var networkName = await network.GetS("Name");
            var networkId = await network.GetS("Id");
            var dataPath = await network.GetS("Credentials.CampaignDataPath");
            var relationshipPath = await network.GetS("Credentials.UnsubRelationshipPath");
            var campaignIdPath = await network.GetS("Credentials.CampaignIdPath");
            var campaignNamePath = await network.GetS("Credentials.CampaignNamePath");
            var apiKey = await network.GetS("Credentials.NetworkApiKey");

            const int PAGESIZE = 100;
            var currentPage = 1;

            var url = new Uri(new Uri(await network.GetS("Credentials.BaseUrl")), await network.GetS("Credentials.GetCampaignsPath")).ToString() + $"?page_size={PAGESIZE}&page={currentPage}";

            string respBody = null;

            try
            {

                while (true)
                {
                    await _fw.Trace(_logMethod, $"Getting campaigns from {networkName} page {currentPage}");

                    var resp = await ProtocolClient.HttpGetAsync(url, new[] { (key: "X-Eflow-API-Key", value: apiKey) });

                    if (resp.success == false)
                    {
                        throw new HaltingException($"Http request for campaigns failed for {networkName}: {url}", null);
                    }

                    Entity campaigns;

                    try
                    {
                        campaigns = await network.Parse("application/json", resp.body);
                    }
                    catch (Exception ex)
                    {
                        throw new HaltingException($"Http request for campaigns failed for {networkName}: {url} {resp.body}", ex);
                    }

                    await _fw.Trace(_logMethod, $"Retrieved campaigns from {networkName} page {currentPage}");

                    respBody = resp.body;

                    var res = await Data.CallFn("Unsub", "MergeNetworkCampaigns",
                        JsonSerializer.Serialize(new
                        {
                            NetworkId = networkId,
                            PayloadType = "json",
                            DataPath = dataPath,
                            CampaignIdPath = campaignIdPath,
                            NamePath = campaignNamePath,
                            RelationshipPath = relationshipPath
                        }), respBody);

                    if (res == null || await res.GetS("result") == "failed")
                    {
                        await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{url}::\r\nDB Response:\r\n{res}\r\nApi Response:\r\n{respBody ?? "[null]"}");
                        return null;
                    }

                    var paging = await campaigns.GetE("paging");
                    var page = await paging.GetI("page");
                    var pageSize = await paging.GetI("page_size");
                    var totalCount = await paging.GetI("total_count");

                    if (page * pageSize >= totalCount)
                    {
                        return res;
                    }
                    else
                    {
                        url = url.Replace($"page={currentPage}", $"page={currentPage + 1}");
                        currentPage++;
                    }
                }
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
                await _fw.Error(_logMethod, $"Failed to get {networkName} campaigns {networkId}::{url}::{respBody ?? "null"}::{e}");
                throw new Exception($"Failed to get {networkName} campaigns", e);
            }
        }

        public async Task<Uri> GetSuppressionLocationUrl(Entity network, string unsubRelationshipId)
        {
            var networkName = await network.GetS("Name");
            var apiKey = await network.GetS("Credentials.NetworkApiKey");

            var url = new Uri(new Uri(await network.GetS("Credentials.BaseUrl")), await network.GetS("Credentials.GetSuppressionPath")).ToString().Replace("{unsubRelationshipId}", unsubRelationshipId);

            string respBody = null;

            try
            {
                var resp = await ProtocolClient.HttpGetAsync(url, new[] { (key: "X-Eflow-API-Key", value: apiKey) });

                respBody = resp.body;
                var rb = await network.Parse("application/json", respBody);

                if ((await rb?.GetS("message"))?.Contains("Can't find entry in the database") == true)
                {
                    return null;
                }

                if (resp.success == false)
                {
                    throw new Exception($"Http request for suppression url failed for {networkName}: {url} {resp.body}", null);
                }

                var response = await network.Parse("application/json", respBody);
                foreach (var downloadUrlPath in await network.GetL<string>("Credentials.DownloadUrlPaths"))
                {
                    var (found, dlUrl) = await response.TryGetS(downloadUrlPath);

                    if (!found || dlUrl.IsNullOrWhitespace())
                    {
                        continue;
                    }

                    return new Uri(dlUrl);
                }

                await _fw.Error(_logMethod, $"Failed to get unsub for {networkName}: {url}::{respBody ?? "null"}");
                return null;
            }
            catch (HaltingException)
            {
                throw;
            }
            catch (HttpRequestException e)
            {
                throw new HaltingException($"Halting exception getting unsub from {networkName}: {url}", e);
            }
            catch (Exception e)
            {
                await _fw.Error(_logMethod, $"Failed to get unsub for {networkName}: {url}::{respBody ?? "null"}::{e}");
                return null;
            }
        }
    }
}
