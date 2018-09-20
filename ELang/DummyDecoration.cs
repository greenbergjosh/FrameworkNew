using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    // This will get moved to dynamic code once it is available
    internal static class DummyDecoration
    {
        private static async Task<IDictionary<string, object>> Evaluate(Request request, DictionaryStack parameters)
        {
            var calls = parameters.Get<dynamic>("Calls");
            await calls.IO("Dummy Decoration");

            return null;
        }
    }
}
