using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Utility.DataLayer;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace TheGreatWallOfDataLib.Routing
{
    public static class Config
    {
        public static async Task<IGenericEntity> Merge(string connName, string payload, string identity, HttpContext ctx)
        {
            await Authentication.CheckPermissions("config", "merge", identity, ctx);

            var ids = JsonConvert.DeserializeObject<string[]>(payload);
            var res = await Data.GetConfigs(ids, null, connName, "_selectConf");

            return Jw.ToGenericEntity(new { r = 0, result = Jw.TryParseObject(res) });
        }
    }
}
