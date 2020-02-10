using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    public static class MemoryEvaluatable
    {
        private static readonly IDictionary<Tuple<Guid, string>, IDictionary<string, object>> _memory 
            = new Dictionary<Tuple<Guid, string>, IDictionary<string, object>>();

        public static async Task<object> Evaluate(IGenericEntity s)
        {
            var method = s.GetS(Keywords.Method);
            var location = s.Get(Keywords.Location, Guid.Empty);
            var partition = s.Get(Keywords.Partition, "__DefaultPartition__"); // Could null be passed here instead of "__DefaultPartition__"?
            var key = s.GetS(Keywords.Key);
            var memoryLocation = Tuple.Create(location, partition);
            var result = new Dictionary<string, object>();
            object value;

            IDictionary<string, object> data;
            switch (method)
            {
                case Keywords.Get:
                    // if (location != Guid.Empty)
                    _memory.TryGetValue(memoryLocation, out data);

                    if (data != null)
                    {
                        if (!data.TryGetValue(key, out value))
                            value = GetDefaultValue(s);
                    }
                    else
                    {
                        value = GetDefaultValue(s);
                    }
                    result[Keywords.Result] = value;
                    break;

                case Keywords.Set:
                    // if (location != Guid.Empty)
                    {
                        if (!_memory.TryGetValue(memoryLocation, out data))
                        {
                            data = new Dictionary<string, object>();
                            _memory[memoryLocation] = data;
                        }
                        value = s.Get(Keywords.Value);
                        data[key] = value;
                    }
                    break;

                default:
                    throw new ArgumentException("Unknown method: " + method);
            }

            return await Task.FromResult(result);
        }

        private static object GetDefaultValue(IGenericEntity s)
        {
            if (s.TryGetValue(Keywords.DefaultValue, out object defaultValue))
                return defaultValue;

            if (s.TryGetValue(Keywords.DefaultValueCreator, out object defaultValueCreator))
            {
                var creator = (Func<object>)defaultValueCreator;
                return creator();
            }

            return null;
        }
    }
}
