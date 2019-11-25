using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;

namespace EdwServiceLib
{
    public class Stack : List<KeyValuePair<string, IDictionary<string, JToken>>>
    {
        public void AddStackFrame(string key, IDictionary<string, JToken> value)
        {
            Add(new KeyValuePair<string, IDictionary<string, JToken>>(key, value));
        }

        public bool TryGetValue(string key, out IDictionary<string, JToken> value)
        {
            var match = this.FirstOrDefault(pair => pair.Key == key);
            if (string.IsNullOrEmpty(match.Key))
            {
                value = null;
                return false;
            }

            value = match.Value;
            return true;
        }
    }
}