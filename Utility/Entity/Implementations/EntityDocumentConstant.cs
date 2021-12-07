using System;
using System.Collections.Generic;
using System.Text.Json;

namespace Utility.Entity.Implementations
{
    public sealed class EntityDocumentConstant : EntityDocument
    {
        private readonly object _value;
        private readonly EntityValueType _valueType;

        private static readonly HashSet<EntityValueType> _allowedTypes = new()
        {
            EntityValueType.Boolean,
            EntityValueType.Null,
            EntityValueType.Number,
            EntityValueType.String,
            EntityValueType.Undefined
        };

        public static EntityDocument Null { get; } = new EntityDocumentConstant(null, EntityValueType.Null);

        public static EntityDocument Undefined { get; } = new EntityDocumentConstant(null, EntityValueType.Undefined);

        public override EntityValueType ValueType => _valueType;

        public override int Length => throw new NotImplementedException();

        public EntityDocumentConstant(object value, EntityValueType valueType)
        {
            if (!_allowedTypes.Contains(valueType))
            {
                throw new ArgumentException($"EntityValueType {valueType} is not supported by this class.", nameof(valueType));
            }

            _value = value;
            _valueType = valueType;
        }

        protected internal override IEnumerable<EntityDocument> EnumerateArrayCore() => throw new NotImplementedException();

        protected internal override IEnumerable<(string name, EntityDocument value)> EnumerateObjectCore() => throw new NotImplementedException();

        protected internal override bool TryGetPropertyCore(string name, out EntityDocument propertyEntityDocument) => throw new NotImplementedException();

        public override T Value<T>() => (T)_value;

        public override bool Equals(EntityDocument other)
        {
            if (other is EntityDocumentConstant otherConstant)
            {
                return _value.Equals(otherConstant._value);
            }
            else
            {
                return base.Equals(other);
            }
        }

        public override string ToString() => _value?.ToString() ?? "null";

        public override int GetHashCode() => _value?.GetHashCode() ?? base.GetHashCode();

        public override void SerializeToJson(Utf8JsonWriter writer, JsonSerializerOptions options) => JsonSerializer.Serialize(writer, _value, options);
    }
}
