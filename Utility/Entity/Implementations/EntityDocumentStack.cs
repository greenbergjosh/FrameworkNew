using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace Utility.Entity.Implementations
{
    public class EntityDocumentStack : EntityDocument
    {
        private readonly Stack<Entity> _entities = new();

        public void Push(Entity entity)
        {
            if (_entities.Any() && _entities.First().ValueType != entity.ValueType)
            {
                throw new ArgumentException($"Cannot push entity of type {entity.ValueType} because the stack already has type {_entities.First().ValueType}");
            }

            _entities.Push(entity);
        }

        public Entity Pop() => _entities.Pop();

        public override EntityValueType ValueType => _entities.FirstOrDefault()?.ValueType ?? EntityValueType.Undefined;

        public override int Length => _entities.FirstOrDefault()?.Document.Length ?? throw new InvalidOperationException();

        public override T Value<T>() => _entities.Any() ? _entities.First().Document.Value<T>() : throw new InvalidOperationException();

        protected internal override IEnumerable<EntityDocument> EnumerateArrayCore() => _entities.FirstOrDefault()?.Document.EnumerateArrayCore() ?? throw new InvalidOperationException();

        protected internal override IEnumerable<(string name, EntityDocument value)> EnumerateObjectCore()
        {
            var properties = new Dictionary<string, List<Entity>>();

            foreach (var entity in _entities)
            {
                foreach (var property in entity.Document.EnumerateObject())
                {
                    if (!properties.TryGetValue(property.name, out var values))
                    {
                        values = new List<Entity>();
                        properties[property.name] = values;
                    }

                    values.Add(property.value);
                }
            }

            foreach (var (property, values) in properties.OrderBy(kvp => kvp.Key))
            {
                values.Reverse();

                var valueStack = new EntityDocumentStack();
                foreach (var value in values)
                {
                    valueStack.Push(value);
                }

                yield return (property, valueStack);
            }
        }

        protected internal override bool TryGetPropertyCore(string name, out EntityDocument propertyEntityDocument)
        {
            var child = new EntityDocumentStack();
            var found = false;

            foreach (var entity in _entities.Reverse())
            {
                if (entity.Document.TryGetPropertyCore(name, out var childEntityDocument))
                {
                    found = true;
                    child.Push(Entity.Create(childEntityDocument, $"{Entity.Query}.{name}"));
                }
            }

            propertyEntityDocument = child;
            return found;
        }

        public override void SerializeToJson(Utf8JsonWriter writer, JsonSerializerOptions options)
        {
            var first = _entities.FirstOrDefault();
            if (first?.ValueType == EntityValueType.Object)
            {
                writer.WriteStartObject();
                foreach (var (name, value) in EnumerateObjectCore())
                {
                    writer.WritePropertyName(name);
                    JsonSerializer.Serialize(writer, value, options);
                }

                writer.WriteEndObject();
            }
            else
            {
                JsonSerializer.Serialize(writer, first, options);
            }
        }
    }
}
