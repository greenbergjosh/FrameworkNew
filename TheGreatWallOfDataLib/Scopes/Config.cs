﻿using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Utility;
using Utility.DataLayer;
using Jw = Utility.JsonWrapper;

namespace TheGreatWallOfDataLib.Scopes
{
    public static class Config
    {
        public static async Task<IGenericEntity> Merge(FrameworkWrapper fw, string connName, string payload, string identity)
        {
            var ids = JsonConvert.DeserializeObject<string[]>(payload);

            return Jw.JsonToGenericEntity(await Data.GetConfigs(ids, null, connName, "_selectConf"));
        }
    }
}
