using System;
using System.Collections.Generic;

namespace Utility.Entity
{
    public class EntityDocumentConstant : EntityDocument
    {
        private readonly object _value;
        private readonly EntityValueType _valueType;

        public static EntityDocument Null { get; } = new EntityDocumentConstant(null, EntityValueType.Null, "");

        public override EntityValueType ValueType => _valueType;

        public override int Length => throw new NotImplementedException();

        public EntityDocumentConstant(object value, EntityValueType valueType, string query)
        {
            _value = value;
            _valueType = valueType;
            Query = query;
        }

        protected override IEnumerable<EntityDocument> EnumerateArrayCore() => throw new NotImplementedException();

        protected override IEnumerable<(string name, EntityDocument value)> EnumerateObjectCore() => throw new NotImplementedException();

        protected override bool TryGetPropertyCore(string name, out EntityDocument propertyEntityDocument) => throw new NotImplementedException();

        public override T Value<T>() => (T)_value;

        public override string ToString() => _value?.ToString();
    }
}
