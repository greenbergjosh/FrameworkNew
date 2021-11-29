using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.Json;

namespace Utility.Entity.Implementations
{
    public abstract class EntityDocumentObject : EntityDocument
    {
        public override EntityValueType ValueType => EntityValueType.Object;

        public static EntityDocument Create(object value)
        {
            var valueType = value.GetType();

            var constructor = typeof(EntityDocumentObject<>).MakeGenericType(valueType).GetConstructor(new[] { valueType });

            return (EntityDocument)constructor.Invoke(new object[] { value });
        }

        public static EntityDocumentObject Create<T>(T value) => new EntityDocumentObject<T>(value);
    }

    internal sealed class EntityDocumentObject<T> : EntityDocumentObject
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

        protected internal override IEnumerable<EntityDocument> EnumerateArrayCore() => throw new NotImplementedException();

        protected internal override IEnumerable<(string name, EntityDocument value)> EnumerateObjectCore()
        {
            foreach (var (name, propertyInfo) in _readableProperties)
            {
                var propertyValue = propertyInfo.GetMethod.Invoke(_value, null);
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

        protected internal override bool TryGetPropertyCore(string name, out EntityDocument propertyEntityDocument)
        {
            if (_readableProperties.TryGetValue(name, out var propertyInfo))
            {
                var propertyValue = propertyInfo.GetMethod.Invoke(_value, null);
                propertyEntityDocument = MapValue(propertyValue);
                return true;
            }
            else if (_readableFields.TryGetValue(name, out var fieldInfo))
            {
                var fieldValue = fieldInfo.GetValue(_value);
                propertyEntityDocument = MapValue(fieldValue);
                return true;
            }

            propertyEntityDocument = default;
            return false;
        }

        public override string ToString() => _value?.ToString();

        public override void SerializeToJson(Utf8JsonWriter writer, JsonSerializerOptions options) => JsonSerializer.Serialize(writer, _value, options);
    }
}
