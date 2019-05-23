using System;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace TheGreatWallOfDataLib.Routing
{
    public static class Edw
    {
        public static async Task<IGenericEntity> DefaultFunc(string scope, string funcName, string payload, string identity)
        {
            if (!await Authentication.HasPermissions(scope, funcName, identity)) throw new FunctionException(106, $"Permission denied: Identity: {identity} Scope: {scope} Func: {funcName}");

            if (funcName.StartsWith("meta."))
            {
                var spl = funcName.Split('.', StringSplitOptions.RemoveEmptyEntries);
                var schema = spl[1];
                var table = spl[2];

                return await GetReportMetadata(scope, schema, table, identity);
            }
            else
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

                return Jw.ToGenericEntity(new { r = 0, result = res });
            }
        }

        private static async Task<IGenericEntity> GetReportMetadata(string scope, string schema, string table, string identity)
        {
            var res = await Data.CallFn(scope, "_meta", Jw.Serialize(new { schema, table }));
            var err = res.GetS("err");

            if (err != null)
            {
                await DataService.Fw.Error(nameof(GetReportMetadata), $"Failed to get metadata from {scope} : {schema}.{table}");
                return Jw.ToGenericEntity(new { r = 100 });
            }

            return Jw.ToGenericEntity(new { r = 0, result = Jw.TryParseArray(res.GetS("")) });
        }

    }
}
