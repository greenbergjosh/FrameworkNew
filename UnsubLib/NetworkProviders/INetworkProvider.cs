using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility;
using Utility.Entity;

namespace UnsubLib.NetworkProviders
{
    public interface INetworkProvider
    {
        Task<Entity> GetCampaigns(Entity network);
        Task<Uri> GetSuppressionLocationUrl(Entity network, string unsubRelationshipId);

        protected static string BuildUrl(string baseUrl, string path, Dictionary<string, string> qs = null)
        {
            var url = $"{baseUrl}";

            if (!baseUrl.EndsWith("/") && !path.StartsWith("/")) url += "/";

            url += path;

            if (!url.Contains("?")) url += "?";
            else url += "&";

            if (qs?.Any() == true)
            {
                url += qs.Select(p => $"&{p.Key}={p.Value}").Join("&");
            }

            return url;
        }
    }

    public static class Factory
    {
        public static async Task<INetworkProvider> GetInstance(FrameworkWrapper fw, Entity network) => await network.GetS("Credentials.NetworkType") switch
        {
            "Affise" => new Affise(fw),
            "Amobee" => new Amobee(fw),
            "Everflow" => new Everflow(fw),
            "Cake" => new Cake(fw),
            "SiteMath" => new SiteMath(fw),
            "Tune" => new Tune(fw),
            "W4" => new W4(fw),
            _ => new Other(fw),
        };
    }
}
