using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    public static class CreativeEvaluatable
    {
        public static async Task<object> Evaluate(IGenericEntity s)
        {
            var content = s.GetS(Keywords.Content);

            await s.Run(Keywords.IO, content);

            var result = new Dictionary<string, object>()
            {
                { Keywords.Result, content }
            };

            return result;
        }
    }
}
