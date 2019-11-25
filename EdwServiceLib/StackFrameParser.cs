using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using Utility;

namespace EdwServiceLib
{
    public class StackFrameParser
    {
        private readonly IDictionary<string, JToken> _values = new Dictionary<string, JToken>();

        public StackFrameParser(string serializedStackFrame)
        {
            var token = JsonWrapper.TryParse(serializedStackFrame);
            if (token.Type != JTokenType.Object)
                return;

            var obj = (JObject)token;
            foreach (var (key, value) in obj)
                _values[key] = value;
        }

        public IDictionary<string, JToken> ToDictionary()
        {
            return _values;
        }

        public JToken Json()
        {
            return JObject.FromObject(_values);
        }

        public void Apply(IDictionary<string, JToken> data)
        {
            foreach (var (key, value) in data)
                _values[key] = value;
        }
    }
}
