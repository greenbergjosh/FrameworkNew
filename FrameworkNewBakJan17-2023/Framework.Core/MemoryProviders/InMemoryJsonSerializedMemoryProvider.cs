﻿using Framework.Core.Entity.Implementations;
using System.Text.Json;

namespace Framework.Core.Evaluatable.MemoryProviders
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

            IDictionary<string, Entity.Entity> memory = new Dictionary<string, Entity.Entity>();
            _storage[g] = memory;

            return Task.FromResult(memory);
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

        public async Task<(bool found, IDictionary<string, Entity.Entity>? memory)> TryDeserialize(Entity.Entity baseEntity, Guid g)
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
                var document = new EntityDocumentJson(deserialized, baseEntity.Document.EvalHandler);
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
