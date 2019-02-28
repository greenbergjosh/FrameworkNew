using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Utility.DataLayer;

namespace Utility
{
    public class ConfigEntityRepo
    {
        public string ConName;
        public ConcurrentDictionary<Guid, Task<string>> _entities = new ConcurrentDictionary<Guid, Task<string>>();

        public ConfigEntityRepo(string conName)
        {
            ConName = conName;
        }

        public async Task<string> GetEntity(Guid id)
        {
            return await _entities.GetOrAdd(id, async _ => await Data.CallFnString(ConName, Data.ConfigFunctionName, JsonWrapper.Json(new { InstanceId = id }), ""));
        }

        public async Task<IGenericEntity> GetEntityGe(Guid id)
        {
            IGenericEntity gp = new GenericEntityJson();
            var gpstate = JsonConvert.DeserializeObject(JsonWrapper.Json(new { Config = await GetEntity(id) }, new [] { false }));
            gp.InitializeEntity(null, null, gpstate);

            return gp;
        }
    }
}
