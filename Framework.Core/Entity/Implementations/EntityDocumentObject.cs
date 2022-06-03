using System.Reflection;
using System.Text.Json;

namespace Framework.Core.Entity.Implementations
{
    public abstract class EntityDocumentObject : EntityDocument
    {
        public override EntityValueType ValueType => EntityValueType.Object;

        public static EntityDocument Create(object value)
        {
            var valueType = value.GetType();

            var constructor = typeof(EntityDocumentObject<>).MakeGenericType(valueType).GetConstructor(new[] { valueType });

            return (EntityDocument)constructor!.Invoke(new object[] { value });
        }

        public static EntityDocumentObject Create<T>(T value) where T : notnull => new EntityDocumentObject<T>(value);
    }

    internal sealed class EntityDocumentObject<T> : EntityDocumentObject where T : notnull
    {
        private readonly T _value;
        private readonly Dictionary<string, PropertyInfo> _readableProperties;
        private readonly Dictionary<string, FieldInfo> _readableFields;
        private readonly int _length;

        public EntityDocumentObject(T value)
        {
            _value = value;
            _readableProperties = new Dictionary<string, PropertyInfo>(value.GetType().GetProperties().Where(p => p.CanRead && p.GetMethod is not null).Select(p => new KeyValuePair<string, PropertyInfo>(p.Name, p)));
            _readableFields = new Dictionary<string, FieldInfo>(value.GetType().GetFields().Select(f => new KeyValuePair<string, FieldInfo>(f.Name, f)));
            _length = _readableProperties.Count + _readableFields.Count;
        }

        public override int Length => _length;

        public override TOutput Value<TOutput>() => (TOutput)(object)_value;

        protected internal override IAsyncEnumerable<EntityDocument> EnumerateArrayCore() => throw new NotImplementedException();

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        protected internal override async IAsyncEnumerable<(string name, EntityDocument value)> EnumerateObjectCore()
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            foreach (var (name, propertyInfo) in _readableProperties)
            {
                var propertyValue = propertyInfo.GetMethod!.Invoke(_value, null);
                var propertyEntityDocument = MapValue(propertyValue);
                yield return (name, propertyEntityDocument);
            }

            foreach (var (name, fieldInfo) in _readableFields)
            {
                var fieldValue = fieldInfo.GetValue(_value);
                var fieldEntityDocument = MapValue(fieldValue);
                yield return (name, fieldEntityDocument);
            }
        }

        protected internal override Task<(bool found, EntityDocument propertyEntityDocument)> TryGetPropertyCore(string name)
        {
            if (_readableProperties.TryGetValue(name, out var propertyInfo))
            {
                var propertyValue = propertyInfo.GetMethod!.Invoke(_value, null);
                return Task.FromResult((true, MapValue(propertyValue)));
            }
            else if (_readableFields.TryGetValue(name, out var fieldInfo))
            {
                var fieldValue = fieldInfo.GetValue(_value);
                return Task.FromResult((true, MapValue(fieldValue)));
            }

            return Task.FromResult((false, EntityDocumentConstant.Null));
        }

        public override string? ToString() => _value.ToString();

        public override void SerializeToJson(Utf8JsonWriter writer, JsonSerializerOptions options) => JsonSerializer.Serialize(writer, _value, options);
    }
}
