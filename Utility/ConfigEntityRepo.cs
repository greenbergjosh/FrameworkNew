using System;
using System.Collections.Concurrent;
using System.Text.Json;
using System.Threading.Tasks;
using Utility.DataLayer;

namespace Utility
{
    public class ConfigEntityRepo
    {
        public string ConName { get; init; }

        private readonly ConcurrentDictionary<Guid, Entity.Entity> _entities = new();
        private readonly ConcurrentDictionary<string, Guid> _entityIds = new();
        private readonly Entity.Entity _entity;

        public ConfigEntityRepo(Entity.Entity entity, string conName)
        {
            _entity = entity;
            ConName = conName;
        }

        public async Task<Entity.Entity> GetEntity(Guid id)
        {
            if (!_entities.TryGetValue(id, out var result))
            {
                result = await GetEntityFromDatabase(id, null, null);
            }

            return result;
        }

        public async Task<Entity.Entity> GetEntity(string type, string name)
        {
            if (type.IsNullOrWhitespace() || name.IsNullOrWhitespace())
            {
                return null;
            }

            if (!_entityIds.TryGetValue($"{type}:{name}", out var id) || _entities.TryGetValue(id, out var result))
            {
                result = await GetEntityFromDatabase(null, type, name);
            }

            return result;
        }

        private async Task<Entity.Entity> GetEntityFromDatabase(Guid? id, string type, string name)
        {
            var result = await Data.CallFnString(ConName, Data.ConfigFunctionName, JsonSerializer.Serialize(new { InstanceId = id, ConfigType = type, ConfigName = name }), null);

            if (result.IsNullOrWhitespace())
            {
                return null;
            }

            var entity = await _entity.Parse("application/json", result);

            id = await entity.GetGuid("$meta.id");
            type = await entity.GetS("$meta.type");
            name = await entity.GetS("$meta.name");

            if (!id.HasValue || type.IsNullOrWhitespace() || name.IsNullOrWhitespace())
            {
                return null;
            }

#if !DEBUG
            _ = _entities.AddOrUpdate(id.Value, entity, (_, __) => entity);
            _ = _entityIds.AddOrUpdate($"{type}:{name}", id.Value, (_, __) => id.Value);
#endif
            return entity;
        }
    }
}
