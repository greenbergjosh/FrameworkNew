using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Jw = Utility.JsonWrapper;

namespace Utility
{
    public static class QueryStringUtil
    {
        public static (Dictionary<string, List<string>> keyList, Dictionary<string, string> keyVal) ParseQueryStringToDicts(string query)
        {
            var keyList = new Dictionary<string, List<string>>();
            var keyVal = new Dictionary<string, string>();
            var dict = HttpUtility.ParseQueryString(query);
            foreach (var key in dict.AllKeys)
            {
                if (key == null) continue; // possible in a query string e.g. &=foo&bar=baz
                if (  dict[key].Contains(",")) keyList.Add(key, dict[key].Split(",").ToList());
                if (! dict[key].Contains(",")) keyVal.Add(key, dict[key]);
            }
            return (keyList, keyVal);
        }

        public static string ParseQueryStringToJson(string query)
        {
            var keysCollections = ParseQueryStringToDicts(query);
            JObject keyValObjMerged = JObject.FromObject(keysCollections.keyList);
            keyValObjMerged.Merge(JObject.FromObject(keysCollections.keyVal));
            return JsonConvert.SerializeObject(keyValObjMerged);
        }

        public static string ParseQueryStringToJsonOrLog(string query, Action<string, string> parseErrAction )
        {
            var outputJson = Jw.Empty;
            try
            {
                outputJson = ParseQueryStringToJson(query);
            }
            catch (Exception e)
            {
                parseErrAction(nameof(ParseQueryStringToJsonOrLog), $"Error parsing query string: '{query??""}' : {e.UnwrapForLog()}");
            }
            return outputJson;
        }
    }
}
