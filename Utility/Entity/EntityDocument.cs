using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Utility.Entity.Implementations;
using Utility.Evaluatable;

namespace Utility.Entity
{
    public class EntityDocumentConverter : JsonConverter<EntityDocument>
    {
        public override EntityDocument Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) => throw new NotImplementedException();
        public override void Write(Utf8JsonWriter writer, EntityDocument value, JsonSerializerOptions options) => value.SerializeToJson(writer, options);
    }

    [JsonConverter(typeof(EntityDocumentConverter))]
    public abstract class EntityDocument : IEquatable<EntityDocument>
    {
        public Entity Entity { get; internal set; }

        public abstract EntityValueType ValueType { get; }

        public bool IsArray => ValueType == EntityValueType.Array;

        public bool IsObject => ValueType == EntityValueType.Object;

        public abstract int Length { get; }

        public IEnumerable<Entity> EnumerateArray()
        {
            if (!IsArray)
            {
                throw new InvalidOperationException($"Entity of type {ValueType} is not an array");
            }

            foreach (var (item, index) in EnumerateArrayCore().Select((item, index) => (item, index)))
            {
                if (item.Entity != null)
                {
                    yield return item.Entity;
                }
                else
                {
                    yield return Entity.Create(item, $"{Entity.Query}[{index}]", Entity);
                }
            }
        }

        protected internal abstract IEnumerable<EntityDocument> EnumerateArrayCore();

        public IEnumerable<(string name, Entity value)> EnumerateObject()
        {
            if (!IsObject)
            {
                throw new InvalidOperationException($"Entity of type {ValueType} is not an object");
            }

            foreach (var (name, value) in EnumerateObjectCore())
            {
                yield return (name, Entity.Create(value, $"{Entity.Query}.{name}", Entity));
            }
        }

        public abstract void SerializeToJson(Utf8JsonWriter writer, JsonSerializerOptions options);

        protected internal abstract IEnumerable<(string name, EntityDocument value)> EnumerateObjectCore();

        public static EntityDocument MapValue(object value) => value switch
        {
            null => new EntityDocumentConstant(null, EntityValueType.Null),
            bool => new EntityDocumentConstant(value, EntityValueType.Boolean),
            decimal => new EntityDocumentConstant(value, EntityValueType.Number),
            float => new EntityDocumentConstant(value, EntityValueType.Number),
            int => new EntityDocumentConstant(value, EntityValueType.Number),
            long => new EntityDocumentConstant(value, EntityValueType.Number),
            string => new EntityDocumentConstant(value, EntityValueType.String),
            IDictionary dictionary => new EntityDocumentDictionary(dictionary),
            IEnumerable array => EntityDocumentArray.Create(array),
            IEvaluatable evaluatable => new EntityDocumentEvaluatable(evaluatable),
            Utility.Entity.Entity => ((Entity)value).Document,
            EntityDocument entityDocument => entityDocument,
            _ => EntityDocumentObject.Create(value),
        };

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public virtual async IAsyncEnumerable<Entity> ProcessReference()
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            yield break;
        }

        public async Task<(bool found, Entity propertyEntity)> TryGetProperty(string name, bool updateQueryAndRoot = true)
        {
            if (TryGetPropertyCore(name, out var document))
            {
                return (true, Entity.Create(document, updateQueryAndRoot ? $"{Entity.Query}.{name}" : Entity.Query, updateQueryAndRoot ? Entity : document?.Entity?.Root ?? null));
            }
            else if (Entity.MissingPropertyHandler != null)
            {
                var foundEntityDocument = await Entity.MissingPropertyHandler(Entity, name);
                if (foundEntityDocument != null)
                {
                    return (true, Entity.Create(foundEntityDocument, updateQueryAndRoot ? $"{Entity.Query}.{name}" : document?.Entity?.Query ?? "$", updateQueryAndRoot ? Entity : document?.Entity.Root ?? null));
                }
            }

            return (false, default);
        }

        protected internal abstract bool TryGetPropertyCore(string name, out EntityDocument propertyEntityDocument);

        public abstract T Value<T>();

        public virtual bool Equals(EntityDocument other) => ValueType != EntityValueType.Undefined && other?.ValueType != EntityValueType.Undefined
            && (ReferenceEquals(this, other)
                || (other is not null && ValueType == other.ValueType && ValueType switch
                {
                    EntityValueType.Array => Length == other.Length && EnumerateArrayCore().SequenceEqual(other.EnumerateArrayCore()),
                    EntityValueType.Boolean => Value<bool>() == other.Value<bool>(),
                    EntityValueType.Null => true,
                    EntityValueType.Number => Value<decimal>() == other.Value<decimal>(),
                    EntityValueType.Object => Length == other.Length && EnumerateObjectCore().OrderBy(p => p.name).SequenceEqual(other.EnumerateObjectCore().OrderBy(p => p.name)),
                    EntityValueType.String => Value<string>() == other.Value<string>(),
                    EntityValueType.Undefined => false,
                    _ => throw new InvalidOperationException($"Unknown {nameof(EntityValueType)} {ValueType}")
                })
        );

        public override bool Equals(object obj) => Equals(obj as EntityDocument);

        public override int GetHashCode() => base.GetHashCode();
    }
}
