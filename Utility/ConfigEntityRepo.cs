using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Utility.DataLayer;
using Utility.GenericEntity;

namespace Utility
{
    public class ConfigEntityRepo
    {
        public string ConName;
        public ConcurrentDictionary<Guid, Task<string>> _entities = new ConcurrentDictionary<Guid, Task<string>>();

        public ConfigEntityRepo(string conName) => ConName = conName;

        public Task<string> GetEntity(Guid id) => _entities.GetOrAdd(id, async _ => await Data.CallFnString(ConName, Data.ConfigFunctionName, JsonWrapper.Json(new { InstanceId = id }), ""));

        public async Task<IGenericEntity> GetEntityGe(Guid id)
        {
            IGenericEntity gp = new GenericEntityJson();
            var conf = await GetEntity(id);

            if (conf.IsNullOrWhitespace()) return null;

            var jo = JsonWrapper.TryParseObject(conf);

            if (jo == null) throw new Exception($"Invalid Json for Config {id}");

            gp.InitializeEntity(null, null, jo);

            return gp;
        }
    }
}
