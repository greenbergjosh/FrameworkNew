using System.Collections;
using System.Collections.Generic;

namespace Framework.Core
{
    public sealed class Request : IReadOnlyDictionary<string, object>
    {
        private IDictionary<string, object> _parameters;

        public Request(IDictionary<string, object> parameters)
        {
            _parameters = parameters;
        }

        #region IReadOnlyDictionary Implementation
        public bool ContainsKey(string key)
        {
            return _parameters.ContainsKey(key);
        }

        public IEnumerable<string> Keys
        {
            get { return _parameters.Keys; }
        }

        public bool TryGetValue(string key, out object value)
        {
            return _parameters.TryGetValue(key, out value);
        }

        public IEnumerable<object> Values
        {
            get { return _parameters.Values; }
        }

        public object this[string key]
        {
            get { return _parameters[key]; }
        }

        public int Count
        {
            get { return _parameters.Count; }
        }

        public IEnumerator<KeyValuePair<string, object>> GetEnumerator()
        {
            return _parameters.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return _parameters.GetEnumerator();
        }
        #endregion
    }
}
