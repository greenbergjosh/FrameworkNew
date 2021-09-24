using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Utility;
using Utility.GenericEntity;

namespace UnsubLib.UnsubFileProviders
{
    public class CardsWise : IUnsubLocationProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(UnsubFileProviders)}.{nameof(CardsWise)}";

        public CardsWise(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public bool CanHandle(IGenericEntity network, string unsubRelationshipId, Uri uri) => uri.ToString().Contains("cardswise.com");

        public async Task<(string url, IDictionary<string, string> postData)> GetFileUrl(IGenericEntity network, string unsubRelationshipId, Uri uri)
        {
            var downloadPage = await ProtocolClient.HttpGetAsync(uri.ToString());

            if (!downloadPage.success)
            {
                await _fw.Error(_logMethod, $"Unable to get download page at: {uri}");
                return default;
            }

            var match = Regex.Match(downloadPage.body, "<a href=\\\"(?<url>/lists/downloadmail.php[^\\\"]+)\\\">");
            if (!match.Success)
            {
                await _fw.Error(_logMethod, $"Unable to find download url at: {uri}\r\nBody:\r\n{downloadPage.body}");
                return default;
            }

            var downloadUrl = new Uri(uri, match.Groups["url"].Value).ToString();

            return (downloadUrl, null);
        }
    }
}
