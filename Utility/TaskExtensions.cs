using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Utility
{
    public static class TaskExtensions
    {
        public static async Task<TSource[]> ToArray<TSource>(this Task<IEnumerable<TSource>> source) => (await source).ToArray();
    }
}
