using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    // This will get moved to dynamic code once it is available
    internal static class CreativeEvaluatable
    {
        private static async Task<IDictionary<string, object>> Evaluate(Request request, DictionaryStack parameters)
        {
            var calls = parameters.Get<dynamic>("Calls");
            var content = parameters.Get<string>("Content");

            await calls.IO(content);

            var result = new Dictionary<string, object>()
            {
                { "Completed", true },
                { "Result", content }
            };

            return result;
        }
    }
}
