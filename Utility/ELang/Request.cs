using System.Collections;
using System.Collections.Generic;

namespace Framework.Core
{
    public sealed class Request : IReadOnlyDictionary<string, object>
    {
        private readonly IDictionary<string, object> _parameters;

        public Request(IDictionary<string, object> parameters) => _parameters = parameters;

        #region IReadOnlyDictionary Implementation
        public bool ContainsKey(string key) => _parameters.ContainsKey(key);

        public IEnumerable<string> Keys => _parameters.Keys;

        public bool TryGetValue(string key, out object value) => _parameters.TryGetValue(key, out value);

        public IEnumerable<object> Values => _parameters.Values;

        public object this[string key] => _parameters[key];

        public int Count => _parameters.Count;

        public IEnumerator<KeyValuePair<string, object>> GetEnumerator() => _parameters.GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator() => _parameters.GetEnumerator();
        #endregion
    }
}
