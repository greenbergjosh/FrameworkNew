using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;
using Utility;

namespace EdwServiceLib
{
    public class ScopeStack
    {
        private readonly Stack<Dictionary<string, string>> _scopes = new Stack<Dictionary<string, string>>();

        public ScopeStack(string serializedScopes)
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

        public void Execute(string instruction)
        {
            var push = instruction.EndsWith('+');
            var pop = instruction.EndsWith('-');
            var template = instruction
                .Replace("+", string.Empty)
                .Replace("-", string.Empty)
                .Replace(" ", string.Empty);

            if (pop && _scopes.Any())
            {
                _scopes.Pop();
            }
            else
            {
                var newScope = template.Split(",")
                    .Select(t => t.Split("="))
                    .ToDictionary(t => t[0], t => t[1]);

                // Q: For multivalue scopes, should they all be null to pop?
                var nullValue = newScope.FirstOrDefault(t => string.IsNullOrEmpty(t.Value));
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
                        var latest = _scopes.Peek();
                        if (latest.Keys.Any(t => newScope.ContainsKey(t)))
                        {
                            foreach (var kv in newScope)
                                latest[kv.Key] = kv.Value;
                        }
                        else
                        {
                            _scopes.Push(newScope);
                        }
                    }
                    else
                    {
                        _scopes.Push(newScope);
                    }
                }
            }
        }
    }
}
