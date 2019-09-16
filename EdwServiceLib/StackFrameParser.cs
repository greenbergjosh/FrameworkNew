using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;
using Utility;

namespace EdwServiceLib
{
    public class StackFrameParser
    {
        private readonly Stack<IDictionary<string, string>> _scopes = new Stack<IDictionary<string, string>>();

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
                        var scope = new Dictionary<string, string>();
                        foreach (var kv in obj)
                            scope[kv.Key] = kv.Value.ToString();
                        _scopes.Push(scope);
                    }
                }
            }
        }

        public IDictionary<string, string> ToDictionary()
        {
            var result = new Dictionary<string, string>();
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

        public void Apply(IDictionary<string, string> data)
        {
            // Q: For multivalue scopes, should they all be null to pop?
            var nullValue = data.FirstOrDefault(t => string.IsNullOrEmpty(t.Value));
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
                            
                    else
                    {
                        _scopes.Push(data);
                    }
                }
                else
                {
                    _scopes.Push(data);
                }
            }
            
        }
    }
}
