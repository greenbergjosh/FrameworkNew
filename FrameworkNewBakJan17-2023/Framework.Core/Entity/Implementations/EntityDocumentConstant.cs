using System.Text.Json;

namespace Framework.Core.Entity.Implementations
{
    public sealed class EntityDocumentConstant : EntityDocument
    {
        private static readonly HashSet<EntityValueType> _allowedTypes = new()
        {
            EntityValueType.Boolean,
            EntityValueType.Null,
            EntityValueType.Number,
            EntityValueType.String,
            EntityValueType.UUID,
            EntityValueType.Undefined,
            EntityValueType.Unhandled
        };

        public static EntityDocument Null { get; } = new EntityDocumentConstant(null, EntityValueType.Null);
        public static EntityDocument Undefined { get; } = new EntityDocumentConstant(null, EntityValueType.Undefined);
        public static EntityDocument Unhandled { get; } = new EntityDocumentConstant(null, EntityValueType.Unhandled);

        private readonly object? _value;
        public override T? Value<T>() where T : default => (T?)_value;

        private readonly EntityValueType _valueType;
        public override EntityValueType ValueType => _valueType;

        public EntityDocumentConstant(object? value, EntityValueType valueType)
        {
            if (!_allowedTypes.Contains(valueType))
            {
                throw new ArgumentException($"EntityValueType {valueType} is not supported by this class.", nameof(valueType));
            }

            _value = value;
            _valueType = valueType;
        }

        // Maybe length should be one and enumerables should enumerate their one thing and then be completed
        // Length could be zero for Null, Undefined, or Unhandled
        public override int Length => throw new NotImplementedException(); 

        protected internal override IAsyncEnumerable<EntityDocument> EnumerateArrayCore() => throw new NotImplementedException();

        protected internal override IAsyncEnumerable<(string name, EntityDocument value)> EnumerateObjectCore() => throw new NotImplementedException();

        protected internal override Task<(bool found, EntityDocument propertyEntityDocument)> TryGetPropertyCore(string name) => throw new NotImplementedException();

        public override bool Equals(EntityDocument? other)
        {
            if (other is EntityDocumentConstant otherConstant)
            {
                return ValueType != EntityValueType.Undefined && otherConstant.ValueType != EntityValueType.Undefined
                    && (
                            (ValueType == EntityValueType.Null && _value is null && otherConstant.ValueType == EntityValueType.Null && otherConstant._value is null)
                            || (_value != null && _value.Equals(otherConstant._value))
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
