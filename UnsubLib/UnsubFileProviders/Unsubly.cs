using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using HtmlAgilityPack;
using Utility;
using Utility.GenericEntity;

namespace UnsubLib.UnsubFileProviders
{
    public class Unsubly : IUnsubLocationProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(UnsubFileProviders)}.{nameof(Unsubly)}";

        public Unsubly(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public bool CanHandle(IGenericEntity network, string unsubRelationshipId, Uri uri) => uri.ToString().Contains("unsubly.com");

        public Task<string> GetFileUrl(IGenericEntity network, string unsubRelationshipId, Uri uri)
        {
            var web = new HtmlWeb();
            var doc = web.Load(uri);
            var form = doc.DocumentNode.Descendants("form").Single();
            var action = form.GetAttributeValue("action", string.Empty);
            //https://app.unsubly.com/download/suppression/md5/?nid=63&aid=298173&fid=59fb46a21586d.csv
            var queryString = new Uri(action).Query;
            var queryDictionary = HttpUtility.ParseQueryString(queryString);

            const string downloadUrl = "https://app.unsubly.com/optimiser/download/save/";
            var headers = new Dictionary<string, string>()
            {
                ["nid"] = queryDictionary["nid"],
                ["aid"] = queryDictionary["aid"],
                ["fid"] = queryDictionary["fid"]
            };
            var newUri = $"{downloadUrl}|{JsonWrapper.Serialize(headers)}";
            return Task.FromResult(newUri);
        }
    }
}
