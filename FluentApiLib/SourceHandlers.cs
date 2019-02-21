using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Utility;

namespace FluentApiLib.SourceHandlers
{
    public class Fluent
    {
        private readonly FrameworkWrapper _fw;

        public Fluent(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public async Task<string> HandleRequest(string requestFromPost, HttpContext ctx)
        {
            var js = JsonConvert.DeserializeObject(requestFromPost);

            if (js is JObject) requestFromPost = $"[{requestFromPost}]";

            var res = await SqlWrapper.SqlToGenericEntity("Fluent", "SaveData", "", requestFromPost);

            if (res.GetS("Result") == "Success") return res.GetS("");

            await _fw.Error($"{nameof(Fluent)}", $"DB failure. Response: {res.GetS("")}" );

            return null;
        }

        //private string QueryStringToJson(IQueryCollection query)
        //{
        //    return JsonConvert.SerializeObject(query.Where(q => q.Key != "m").ToDictionary(q => q.Key, q => q.Value.LastOrDefault()));
        //}

    }
}
