using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;
using Jw = Utility.JsonWrapper;

namespace TheGreatWallOfDataLib.Scopes
{
    public static class Config
    {
        public static async Task<IGenericEntity> Merge(string connName, string payload, string identity)
        {
            var ids = JsonConvert.DeserializeObject<string[]>(payload);
            var res = await Data.GetConfigs(ids, null, connName, "_selectConf");

            return Jw.ToGenericEntity(new { r = 0, result = Jw.TryParseObject(res) });
        }
    }
}
