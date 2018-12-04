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
        public string ConnectionString;
        public ConcurrentDictionary<Guid, Task<string>> _entities = new ConcurrentDictionary<Guid, Task<string>>();

        public ConfigEntityRepo(string connectionString)
        {
            ConnectionString = connectionString;
        }

        public async Task<string> GetEntity(Guid id)
        {
            return await _entities.GetOrAdd(id, async _ =>
            {
                return await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                                "SelectConfig",
                                JsonWrapper.Json(new { InstanceId = id }),
                                "");
            });
        }

        public async Task<IGenericEntity> GetEntityGe(Guid id)
        {
            IGenericEntity gp = new GenericEntityJson();
            var gpstate = JsonConvert.DeserializeObject(await GetEntity(id));
            gp.InitializeEntity(null, null, gpstate);
            return gp;
        }
    }
}
