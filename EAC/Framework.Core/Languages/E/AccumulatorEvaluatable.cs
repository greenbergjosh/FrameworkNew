using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    public static class AccumulatorEvaluatable
    {
        public static async Task<object> Evaluate(IGenericEntity s)
        {
            var currentValue = s.Get(Keywords.CurrentValue, 0);
            var inputValue = s.Get<int>(Keywords.Value);
            var newValue = currentValue + inputValue;
            s.Set(Keywords.CurrentValue, newValue);
            
            await s.Run(Keywords.IO, $"{currentValue} + {inputValue} = {newValue}");

            return new Dictionary<string, object>() {
                { Keywords.PreviousValue, currentValue },
                { Keywords.Value, inputValue },
                { Keywords.CurrentValue, newValue }
            };
        }
    }
}
