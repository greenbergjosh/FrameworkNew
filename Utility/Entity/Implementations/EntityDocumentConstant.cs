using System;
using System.Collections.Generic;

namespace Utility.Entity.Implementations
{
    public class EntityDocumentConstant : EntityDocument
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

        public static EntityDocument Null { get; } = new EntityDocumentConstant(null, EntityValueType.Null, "");

        public static EntityDocument Undefined { get; } = new EntityDocumentConstant(null, EntityValueType.Undefined, "");

        public override EntityValueType ValueType => _valueType;

        public override int Length => throw new NotImplementedException();

        public EntityDocumentConstant(object value, EntityValueType valueType, string query)
        {
            if (!_allowedTypes.Contains(valueType))
            {
                throw new ArgumentException($"EntityValueType {valueType} is not supported by this class.", nameof(valueType));
            }

            _value = value;
            _valueType = valueType;
            Query = query;
        }

        public override EntityDocument Clone(string query) => new EntityDocumentConstant(_value, _valueType, query);

        protected override IEnumerable<EntityDocument> EnumerateArrayCore() => throw new NotImplementedException();

        protected override IEnumerable<(string name, EntityDocument value)> EnumerateObjectCore() => throw new NotImplementedException();

        protected override bool TryGetPropertyCore(string name, out EntityDocument propertyEntityDocument) => throw new NotImplementedException();

        public override T Value<T>() => (T)_value;

        public override string ToString() => _value?.ToString();
    }
}
