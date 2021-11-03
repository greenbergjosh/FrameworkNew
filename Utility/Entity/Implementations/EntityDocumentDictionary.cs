using System;
using System.Collections;
using System.Collections.Generic;
using System.Text.Json;

namespace Utility.Entity.Implementations
{
    public sealed class EntityDocumentDictionary : EntityDocument
    {
        private readonly IDictionary _dictionary;

        public override int Length => _dictionary.Count;

        public override EntityValueType ValueType => EntityValueType.Object;

        public EntityDocumentDictionary(IDictionary dictionary) => _dictionary = dictionary;

        protected internal override IEnumerable<EntityDocument> EnumerateArrayCore() => throw new NotImplementedException();

        protected internal override IEnumerable<(string name, EntityDocument value)> EnumerateObjectCore()
        {
            foreach (var key in _dictionary.Keys)
            {
                var value = _dictionary[key];
                var entityDocument = MapValue(value);
                yield return (key.ToString(), entityDocument);
            }
        }

        protected internal override bool TryGetPropertyCore(string name, out EntityDocument propertyEntityDocument)
        {
            if (_dictionary.Contains(name))
            {
                var value = _dictionary[name];
                propertyEntityDocument = MapValue(value);
                return true;
            }

            propertyEntityDocument = default;
            return false;
        }

        public override T Value<T>() => (T)_dictionary;

        public override string ToString() => JsonSerializer.Serialize(_dictionary);

        public override int GetHashCode() => _dictionary?.GetHashCode() ?? base.GetHashCode();
    }
}
