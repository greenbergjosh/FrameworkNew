using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;
using Jw = Utility.JsonWrapper;

namespace TheGreatWallOfDataLib.Scopes
{
    public static class Edw
    {
        public static async Task<IGenericEntity> DefaultFunc(string scope, string funcName, string payload, string identity)
        {
            var pl = Jw.TryParseObject(payload);
            var parms = pl.Properties().ToDictionary(p => p.Name, p =>
            {
                object r = null;

                if (p.Value is JArray ja) r = ja.Select(v => v.Value<string>()).Join(",");
                else r = p.Value.ToString();

                return r;
            });

            var res = await Data.CallFn(scope, funcName, parms);

            return Jw.ToGenericEntity(res);
        }

        public static async Task<IGenericEntity> GetReportMetadata(string scope, string funcName, string payload, string identity)
        {
            var pl = Jw.JsonToGenericEntity(payload);
            var results = new Dictionary<string, IGenericEntity>();
            var sets = pl.GetL("")
                .Select(s =>
                    {
                        var set = s.GetS("");
                        var spl = set.Split(':', StringSplitOptions.RemoveEmptyEntries);

                        if (spl.Length != 2) return null;

                        return new { set, schema = spl[0], table = spl[1] };
                    })
                .Where(s => s != null);

            foreach (var set in sets)
            {
                results.Add(set.set, await Data.CallFn(scope, "_meta", Jw.Serialize(set)));
            }

            var errors = results.Select(r => r.Value.GetS("err")).Where(r => !r.IsNullOrWhitespace());

            if (errors.Any()) await DataService.Fw.Error(nameof(GetReportMetadata), Jw.Serialize(errors));

            return Jw.ToGenericEntity(results.Aggregate(new JObject(), (o, pair) =>
            {
                o.Add(pair.Key, Jw.TryParse(pair.Value.GetS("")));

                return o;
            }));
        }

    }
}
