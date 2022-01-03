using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

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
            EntityValueType.UUID,
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

        protected internal override IAsyncEnumerable<EntityDocument> EnumerateArrayCore() => throw new NotImplementedException();

        protected internal override IAsyncEnumerable<(string name, EntityDocument value)> EnumerateObjectCore() => throw new NotImplementedException();

        protected internal override Task<(bool found, EntityDocument propertyEntityDocument)> TryGetPropertyCore(string name) => throw new NotImplementedException();

        public override T Value<T>() => (T)_value;

        public override bool Equals(EntityDocument other)
        {
            if (other is EntityDocumentConstant otherConstant)
            {
                return ValueType != EntityValueType.Undefined && otherConstant.ValueType != EntityValueType.Undefined 
                    && (
                            (ValueType == EntityValueType.Null && _value is null && otherConstant.ValueType == EntityValueType.Null && otherConstant._value is null) 
                            || _value.Equals(otherConstant._value)
                       );
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
