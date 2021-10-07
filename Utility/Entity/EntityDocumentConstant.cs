using System;
using System.Collections.Generic;
using Utility.Entity.QueryLanguage.Tokens;

namespace Utility.Entity
{
    public class EntityDocumentConstant : EntityDocument
    {
        private readonly object _value;

        public override string Query { get; init; }

        protected override int Length => throw new NotImplementedException();

        public EntityDocumentConstant(object value, string query)
        {
            _value = value;
            Query = query;
        }

        protected override EntityDocument GetArrayElement(Index index) => throw new NotImplementedException();
        protected override IEnumerable<EntityDocument> GetPropertyCore(PropertyToken token) => throw new NotImplementedException();
        protected override IEnumerable<EntityDocument> NestedDescent(NestedDescentToken token) => throw new NotImplementedException();

        public override string ToString() => _value?.ToString();

        public override T Value<T>() => (T)_value;
    }
}
