using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    // This will get moved to dynamic code once it is available
    internal static class AccumulatorEvaluatable
    {
        private static async Task<IDictionary<string, object>> Evaluate(Request request, DictionaryStack parameters)
        {
            var readMemoryLocation = parameters.Get<Guid>("ReadLocation");
            var writeMemoryLocation = parameters.Get<Guid>("WriteLocation");

            var calls = parameters.Get<dynamic>("Calls");

            var currentValue = await calls.MemoryGet(readMemoryLocation, null, "CurrentValue", 0);
            var inputValue = parameters.Get<int>("value");

            var newValue = currentValue + inputValue;

            await calls.MemorySet(writeMemoryLocation, null, "CurrentValue", newValue);

            await calls.IO(string.Format("{0} + {1} = {2}", currentValue, inputValue, newValue));

            var result = new Dictionary<string, object>() {
                { "previousValue", currentValue },
                { "value", inputValue },
                { "currentValue", newValue }
            };

            return result;
        }
    }
}
