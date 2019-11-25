using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;
using Utility;

namespace EdwServiceLib
{
    public class StackFrameParser
    {
        private readonly Stack<IDictionary<string, JToken>> _scopes = new Stack<IDictionary<string, JToken>>();

        public StackFrameParser(string serializedScopes)
        {
            var token = JsonWrapper.TryParse(serializedScopes);
            if (token.Type == JTokenType.Array)
            {
                var array = (JArray)token;
                foreach (var element in array)
                {
                    if (element.Type == JTokenType.Object)
                    {
                        var obj = (JObject)element;
                        var scope = new Dictionary<string, JToken>();
                        foreach (var kv in obj)
                            scope[kv.Key] = kv.Value;
                        _scopes.Push(scope);
                    }
                }
            }
        }

        public IDictionary<string, JToken> ToDictionary()
        {
            var result = new Dictionary<string, JToken>();
            foreach(var scope in _scopes)
            {
                foreach (var kv in scope)
                    result[kv.Key] = kv.Value;
            }
            return result;
        }

        public JToken Json()
        {
            var array = new JArray();
            foreach (var scope in _scopes.Reverse())
            {
                var obj = new JObject();
                foreach (var kv in scope)
                {
                    obj[kv.Key] = kv.Value;
                }
                array.Add(obj);
            }
            return array;
        }

        public void Apply(IDictionary<string, JToken> data)
        {
            // Q: For multivalue scopes, should they all be null to pop?
            var nullValue = data.FirstOrDefault(t => t.Value == null || t.Value.ToString() == string.Empty);
            if (!string.IsNullOrEmpty(nullValue.Key))
            {
                var toPop = 0;
                var found = false;
                foreach (var scope in _scopes)
                {
                    toPop++;
                    if (scope.Any(t => t.Key == nullValue.Key))
                    {
                        found = true;
                        break;
                    }
                }

                if (found)
                    while (toPop-- > 0) _scopes.Pop();
            }
            else
            {
                if (_scopes.Any())
                {
                    var toPop = 0;
                    var found = false;
                    foreach (var scope in _scopes)
                    {
                        toPop++;
                        if (scope.Any(t => data.ContainsKey(t.Key)))
                        {
                            found = true;
                            break;
                        }
                    }

                    if (found)
                    {
                        toPop--;
                        while (toPop-- > 0) _scopes.Pop();

                        var oldScope = _scopes.Peek();
                        foreach (var kv in data)
                            oldScope[kv.Key] = kv.Value;
                    }
                    else if (data.Count > 0)
                    {
                        _scopes.Push(data);
                    }
                }
                else if (data.Count > 0)
                {
                    _scopes.Push(data);
                }
            }
            
        }
    }
}
