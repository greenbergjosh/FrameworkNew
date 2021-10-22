using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.Entity.Implementations;

namespace Utility.Entity
{
    public abstract class EntityDocument : IEquatable<EntityDocument>
    {
        public Entity Entity { get; internal set; }

        public string Query { get; internal set; } = "$";

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

            foreach (var item in EnumerateArrayCore())
            {
                yield return Entity.Create(Entity, item);
            }
        }

        protected abstract IEnumerable<EntityDocument> EnumerateArrayCore();

        public IEnumerable<(string name, Entity value)> EnumerateObject()
        {
            if (!IsObject)
            {
                throw new InvalidOperationException($"Entity of type {ValueType} is not an object");
            }

            foreach (var (name, value) in EnumerateObjectCore())
            {
                yield return (name, Entity.Create(Entity, value));
            }
        }

        protected abstract IEnumerable<(string name, EntityDocument value)> EnumerateObjectCore();

        public static EntityDocument MapValue(object value, string query = null) => value switch
        {
            null => new EntityDocumentConstant(null, EntityValueType.Null, query),
            string => new EntityDocumentConstant(value, EntityValueType.String, query),
            int => new EntityDocumentConstant(value, EntityValueType.Number, query),
            float => new EntityDocumentConstant(value, EntityValueType.Number, query),
            decimal => new EntityDocumentConstant(value, EntityValueType.Number, query),
            IDictionary dictionary => new EntityDocumentObject(dictionary, query),
            IEnumerable array => EntityDocumentArray.Create(array, query),
            Utility.Entity.Entity => ((Entity)value).Document,
            _ => throw new Exception($"Type {value.GetType().Name} is not supported")
        };

        protected EntityDocument MapValue(object value) => MapValue(value, Query);

        public abstract EntityDocument Clone(string query);

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public virtual async IAsyncEnumerable<Entity> ProcessReference()
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            yield break;
        }

        public async Task<(bool found, Entity propertyEntity)> TryGetProperty(string name)
        {
            if (TryGetPropertyCore(name, out var document))
            {
                return (true, Entity.Create(Entity, document));
            }
            else if (Entity.MissingPropertyHandler != null)
            {
                var foundEntity = await Entity.MissingPropertyHandler(Entity, name);
                if (foundEntity != null)
                {
                    return (true, Entity.Create(Entity, foundEntity));
                }
            }

            return (false, default);
        }

        protected abstract bool TryGetPropertyCore(string name, out EntityDocument propertyEntityDocument);

        public abstract T Value<T>();

        public bool Equals(EntityDocument other)
        {
            if (ValueType == EntityValueType.Undefined || other?.ValueType == EntityValueType.Undefined)
            {
                return false;
            }

            if (ReferenceEquals(this, other))
            {
                return true;
            }

            if (other == null || ValueType != other.ValueType)
            {
                return false;
            }

            return ValueType switch
            {
                EntityValueType.Array => Length == other.Length && EnumerateArrayCore().SequenceEqual(other.EnumerateArrayCore()),
                EntityValueType.Boolean => Value<bool>() == other.Value<bool>(),
                EntityValueType.Null => true,
                EntityValueType.Number => Value<decimal>() == other.Value<decimal>(),
                EntityValueType.Object => Length == other.Length && EnumerateObjectCore().SequenceEqual(other.EnumerateObjectCore()),
                EntityValueType.String => Value<string>() == other.Value<string>(),
                EntityValueType.Undefined => false,
                _ => throw new InvalidOperationException($"Unknown {nameof(ValueType)} {ValueType}")
            };
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as EntityDocument);
        }

        public override int GetHashCode() => base.GetHashCode();
    }
}
