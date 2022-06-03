using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Utility.Entity.Implementations;

namespace Utility.Evaluatable.MemoryProviders
{
    public class InMemoryJsonSerializedMemoryProvider : IMemoryProvider
    {
        private readonly Dictionary<Guid, IDictionary<string, Entity.Entity>> _storage = new();

        public Task<IDictionary<string, Entity.Entity>> CreateNode(Guid g)
        {
            if (g == default)
            {
                throw new ArgumentException($"Cannot access memory at location {g}");
            }

            _storage[g] = new Dictionary<string, Entity.Entity>();
            return Task.FromResult(_storage[g]);
        }

        public Task Serialize(Guid g, IDictionary<string, Entity.Entity> memory)
        {
            if (g == default)
            {
                throw new ArgumentException($"Cannot access memory at location {g}");
            }

            _storage[g] = memory;
            return Task.CompletedTask;
        }

        public async Task<(bool found, IDictionary<string, Entity.Entity> memory)> TryDeserialize(Entity.Entity baseEntity, Guid g)
        {
            if (g == default)
            {
                throw new ArgumentException($"Cannot access memory at location {g}");
            }

            if (_storage.TryGetValue(g, out var memory))
            {
                var clone = new Dictionary<string, Entity.Entity>();

                var serialized = JsonSerializer.Serialize(memory);
                var deserialized = JsonDocument.Parse(serialized).RootElement;
                var document = new EntityDocumentJson(deserialized);
                var entity = baseEntity.Create(document);

                await foreach (var kvp in entity.Document.EnumerateObject())
                {
                    clone[kvp.name] = kvp.value;
                }

                return (true, clone);
            }

            return (false, default);
        }
    }
}
