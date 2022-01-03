using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

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

        public int StackCount => _entities.Count;

        #region EntityDocument Implementation
        public override EntityValueType ValueType => _entities.FirstOrDefault()?.ValueType ?? EntityValueType.Null;

        public override int Length => _entities.FirstOrDefault()?.Document.Length ?? throw new InvalidOperationException();

        public override T Value<T>() => _entities.Any() ? _entities.First().Document.Value<T>() : throw new InvalidOperationException();

        protected internal override IAsyncEnumerable<EntityDocument> EnumerateArrayCore() => _entities.FirstOrDefault()?.Document.EnumerateArrayCore() ?? throw new InvalidOperationException();

        protected internal override async IAsyncEnumerable<(string name, EntityDocument value)> EnumerateObjectCore()
        {
            var properties = new Dictionary<string, List<Entity>>();

            foreach (var entity in _entities)
            {
                await foreach (var property in entity.Document.EnumerateObject())
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
                if (values.Count == 1)
                {
                    yield return (property, values[0].Document);
                }
                else
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
        }

        protected internal override async Task<(bool found, EntityDocument propertyEntityDocument)> TryGetPropertyCore(string name)
        {
            var child = new EntityDocumentStack();
            var found = false;

            foreach (var entity in _entities.Reverse())
            {
                var result = await entity.Document.TryGetPropertyCore(name);
                if (result.found)
                {
                    found = true;
                    child.Push(Entity.Create(result.propertyEntityDocument, $"{Entity.Query}.{name}", Entity));
                }
            }

            var propertyEntityDocument = child.StackCount == 1 ? child.Pop().Document : child;
            return (found, propertyEntityDocument);
        }

        public override async void SerializeToJson(Utf8JsonWriter writer, JsonSerializerOptions options)
        {
            var first = _entities.FirstOrDefault();
            if (first?.ValueType == EntityValueType.Object)
            {
                writer.WriteStartObject();
                await foreach (var (name, value) in EnumerateObjectCore())
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

        public override string ToString() => JsonSerializer.Serialize(_entities);

        public override bool Equals(EntityDocument other) => ReferenceEquals(this, other) || base.Equals(other);
        #endregion
    }
}
