using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Utility.Entity
{
    public class EntityDocumentJson : EntityDocument
    {
        private readonly JsonElement _value;
        private readonly int _length;

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

        public override EntityValueType ValueType => _value.ValueKind switch
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
        }

        public static Task<EntityDocument> Parse(string json) => Task.FromResult<EntityDocument>(new EntityDocumentJson(JsonDocument.Parse(json).RootElement));

        #region EntityDocument Implementation
        protected override IEnumerable<EntityDocument> EnumerateArrayCore() => _value.EnumerateArray().Select(item => new EntityDocumentJson(item));

        protected override IEnumerable<(string name, EntityDocument value)> EnumerateObjectCore() => _value.EnumerateObject().Select(property => (property.Name, (EntityDocument)new EntityDocumentJson(property.Value)));

        public override async IAsyncEnumerable<Entity> ProcessReference()
        {
            if (_value.ValueKind == JsonValueKind.Object && _value.TryGetProperty("$ref", out var refProperty))
            {
                foreach (var entity in await Entity.Evaluate(refProperty.GetString()))
                {
                    yield return entity;
                }
            }
        }

        protected override bool TryGetPropertyCore(string name, out EntityDocument propertyEntityDocument)
        {
            if (_value.TryGetProperty(name, out var value))
            {
                propertyEntityDocument = new EntityDocumentJson(value);
                return true;
            }

            propertyEntityDocument = null;
            return false;
        }

        public override T Value<T>()
        {
            var targetType = typeof(T);

            if (!_valueMap.TryGetValue(targetType, out var getter))
            {
                throw new Exception($"Unable to convert value to type {targetType}");
            }

            return (T)getter(_value);
        }
        #endregion

        public override string ToString() => _value.ToString();
    }
}
