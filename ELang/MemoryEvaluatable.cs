using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    // This will get moved to dynamic code once it is available
    internal static class MemoryEvaluatable
    {
        private static IDictionary<Tuple<Guid, string>, IDictionary<string, object>> _memory = new Dictionary<Tuple<Guid, string>, IDictionary<string, object>>();

        private static async Task<IDictionary<string, object>> Evaluate(Request request, DictionaryStack parameters)
        {
            var method = parameters.Get<string>("Method");

            var location = parameters.Get<Guid>("Location");
            var partition = parameters.Get("Partition", "__DefaultPartition__");
            var memoryLocation = Tuple.Create(location, partition);
            var key = parameters.Get<string>("Key");

            var result = new Dictionary<string, object>();

            IDictionary<string, object> data = null;
            object value = null;

            switch (method)
            {
                case "Get":
                    if (location != Guid.Empty)
                    {
                        _memory.TryGetValue(memoryLocation, out data);
                    }
                    if (data != null)
                    {
                        if (!data.TryGetValue(key, out value))
                        {
                            value = GetDefaultValue(parameters);
                        }
                    }
                    else
                    {
                        value = GetDefaultValue(parameters);
                    }
                    result["Result"] = value;
                    break;
                case "Set":
                    if (location != Guid.Empty)
                    {
                        if (!_memory.TryGetValue(memoryLocation, out data))
                        {
                            data = new Dictionary<string, object>();
                            _memory[memoryLocation] = data;
                        }
                        value = parameters["Value"];
                        data[key] = value;
                    }
                    break;
                default:
                    throw new ArgumentException("Unknown method: " + method);
            }

            return await Task.FromResult(result);
        }

        private static object GetDefaultValue(DictionaryStack parameters)
        {
            if (parameters.ContainsKey("DefaultValue"))
            {
                return parameters["DefaultValue"];
            }
            else if (parameters.ContainsKey("DefaultValueCreator"))
            {
                var creator = parameters.Get<Func<object>>("DefaultValueCreator");
                return creator();
            }

            return null;
        }
    }
}
