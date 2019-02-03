using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

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

        public async Task<string> GetEntity(Guid id, DataLayerClient client)
        {
            return await _entities.GetOrAdd(id, async _ =>
            {
                return await SqlWrapper.SqlServerProviderEntry(this.ConName,
                                "SelectConfig",
                                JsonWrapper.Json(new { InstanceId = id }),
                                "");
            });
        }

        public async Task<IGenericEntity> GetEntityGe(Guid id, DataLayerClient client)
        {
            IGenericEntity gp = new GenericEntityJson();
            var gpstate = JsonConvert.DeserializeObject(JsonWrapper.Json(new { Config = await GetEntity(id, client) },
                new bool[] { false }));
            gp.InitializeEntity(null, null, gpstate);
            return gp;
        }
    }
}
