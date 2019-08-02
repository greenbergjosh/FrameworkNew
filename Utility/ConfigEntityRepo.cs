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
        private readonly ConcurrentDictionary<Guid, IGenericEntity> _entities = new ConcurrentDictionary<Guid, IGenericEntity>();
        private readonly ConcurrentDictionary<string, Guid> _entityIds = new ConcurrentDictionary<string, Guid>();

        public ConfigEntityRepo(string conName) => ConName = conName;

        public async Task<IGenericEntity> GetEntity(Guid id)
        {
            if (!_entities.TryGetValue(id, out var result))
            {
                result = await AddEntity(id, null, null);
            }

            return result;
        }

        public async Task<IGenericEntity> GetEntity(string type, string name)
        {
            if (type.IsNullOrWhitespace() || name.IsNullOrWhitespace()) return null;

            if (!_entityIds.TryGetValue($"{type}:{name}", out var id) || _entities.TryGetValue(id, out var result))
            {
                result = await AddEntity(null, type, name);
            }

            return result;
        }

        private async Task<IGenericEntity> AddEntity(Guid? id, string type, string name)
        {
            var result = await Data.CallFnString(ConName, Data.ConfigFunctionName, JsonWrapper.Json(new { InstanceId = id, ConfigType = type, ConfigName = name }), null);

            if (result.IsNullOrWhitespace()) return null;

            var entity = JsonWrapper.JsonToGenericEntity(result);
            var configJs = JsonWrapper.TryParse(entity.GetS("Config"));

            if (configJs != null) entity.Set("Config", configJs);

            id = entity.GetS("Id").ParseGuid();
            type = entity.GetS("Type");
            name = entity.GetS("Name");

            if (!id.HasValue || type.IsNullOrWhitespace() || name.IsNullOrWhitespace()) return null;

            _entities.AddOrUpdate(id.Value, entity, (_, __) => entity);
            _entityIds.AddOrUpdate($"{type}:{name}", id.Value, (_, __) => id.Value);

            return entity;
        }

    }
}
