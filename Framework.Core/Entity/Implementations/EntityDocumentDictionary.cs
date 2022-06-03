using System.Collections;
using System.Text.Json;

namespace Framework.Core.Entity.Implementations
{
    public sealed class EntityDocumentDictionary : EntityDocument
    {
        private readonly IDictionary _dictionary;

        public override int Length => _dictionary.Count;

        public override EntityValueType ValueType => EntityValueType.Object;

        public EntityDocumentDictionary(IDictionary dictionary) => _dictionary = dictionary;

        protected internal override IAsyncEnumerable<EntityDocument> EnumerateArrayCore() => throw new NotImplementedException();

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        protected internal override async IAsyncEnumerable<(string name, EntityDocument value)> EnumerateObjectCore()
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            foreach (var key in _dictionary.Keys)
            {
                var value = _dictionary[key];
                var entityDocument = MapValue(value);
                yield return (key.ToString()!, entityDocument);
            }
        }

        protected internal override Task<(bool found, EntityDocument propertyEntityDocument)> TryGetPropertyCore(string name)
        {
            if (_dictionary.Contains(name))
            {
                var value = _dictionary[name];
                return Task.FromResult((true, MapValue(value)));
            }

            return Task.FromResult((false, EntityDocumentConstant.Null));
        }

        public override T Value<T>() => (T)_dictionary;

        public override string ToString() => JsonSerializer.Serialize(_dictionary);

        public override int GetHashCode() => _dictionary?.GetHashCode() ?? base.GetHashCode();

        public override void SerializeToJson(Utf8JsonWriter writer, JsonSerializerOptions options) => JsonSerializer.Serialize(writer, _dictionary, options);
    }
}
