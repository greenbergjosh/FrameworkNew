using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.Entity.QueryLanguage;

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

        public async Task<IEnumerable<EntityDocument>> Evaluate(Query query) => (await Entity.Evaluate(query)).Select(entity => entity.Document);

        public bool TryGetProperty(string name, out Entity propertyEntity)
        {
            if (TryGetPropertyCore(name, out var document))
            {
                propertyEntity = Entity.Create(Entity, document);
                return true;
            }

            propertyEntity = null;
            return false;
        }

        protected abstract bool TryGetPropertyCore(string name, out EntityDocument propertyEntityDocument);

        public abstract T Value<T>();

        public bool Equals(EntityDocument other)
        {
            if (object.ReferenceEquals(this, other))
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
