using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Utility.Entity.Implementations
{
    public sealed class EntityDocumentJson : EntityDocument
    {
        private readonly JsonElement _value;
        private readonly int _length;
        private readonly EntityValueType _valueType;

        private static readonly Dictionary<Type, Func<JsonElement, object>> _valueMap = new()
        {
            [typeof(bool)] = element => element.GetBoolean(),
            [typeof(decimal)] = element => element.GetDecimal(),
            [typeof(double)] = element => element.GetDouble(),
            [typeof(float)] = element => element.GetSingle(),
            [typeof(int)] = element => element.GetInt32(),
            [typeof(long)] = element => element.GetInt64(),
            [typeof(string)] = element => element.GetString(),
        };

        public override EntityValueType ValueType => _valueType;

        public override int Length => _length == -1 ? throw new InvalidOperationException($"ValueKind {_value.ValueKind} does not have a length") : _length;

        public EntityDocumentJson(JsonElement root)
        {
            _value = root;

            _length = _value.ValueKind switch
            {
                JsonValueKind.Array => _value.GetArrayLength(),
                JsonValueKind.Object => _value.EnumerateObject().Count(),
                JsonValueKind.String => _value.GetString().Length,
                _ => -1
            };

            _valueType = _value.ValueKind switch
            {
                JsonValueKind.Array => EntityValueType.Array,
                JsonValueKind.False => EntityValueType.Boolean,
                JsonValueKind.Null => EntityValueType.Null,
                JsonValueKind.Number => EntityValueType.Number,
                JsonValueKind.Object => EntityValueType.Object,
                JsonValueKind.String => EntityValueType.String,
                JsonValueKind.True => EntityValueType.Boolean,
                JsonValueKind.Undefined => EntityValueType.Undefined,
                _ => throw new InvalidOperationException($"{nameof(JsonValueKind)} {_value.ValueKind} does not map to a known {nameof(ValueType)}")
            };
        }

        public static Task<EntityDocument> Parse(string json) => Task.FromResult<EntityDocument>(new EntityDocumentJson(JsonDocument.Parse(json).RootElement));

        #region EntityDocument Implementation
#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        protected internal override async IAsyncEnumerable<EntityDocument> EnumerateArrayCore()
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            foreach (var item in _value.EnumerateArray().Select(item => new EntityDocumentJson(item)))
            {
                yield return item;
            }
        }

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        protected internal override async IAsyncEnumerable<(string name, EntityDocument value)> EnumerateObjectCore()
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            foreach (var item in _value.EnumerateObject().Select(property => (property.Name, (EntityDocument)new EntityDocumentJson(property.Value))))
            {
                yield return item;
            }
        }

        public override async IAsyncEnumerable<Entity> ProcessReference()
        {
            if (_value.ValueKind == JsonValueKind.Object && _value.TryGetProperty("$ref", out var refProperty))
            {
                await foreach (var entity in Entity.Eval(refProperty.GetString()))
                {
                    yield return entity;
                }
            }
        }

        protected internal override Task<(bool found, EntityDocument propertyEntityDocument)> TryGetPropertyCore(string name)
        {
            if (_value.TryGetProperty(name, out var value))
            {
                return Task.FromResult((true, (EntityDocument)new EntityDocumentJson(value)));
            }

            return Task.FromResult((false, (EntityDocument)default));
        }

        public override T Value<T>()
        {
            var targetType = typeof(T);

            return !_valueMap.TryGetValue(targetType, out var getter)
                ? throw new Exception($"Unable to convert value to type {targetType}")
                : (T)getter(_value);
        }

        public override void SerializeToJson(Utf8JsonWriter writer, JsonSerializerOptions options) => JsonSerializer.Serialize(writer, _value, options);
        #endregion

        public override string ToString() => _value.ValueKind == JsonValueKind.String ? _value.GetRawText() : _value.ToString();
    }
}
