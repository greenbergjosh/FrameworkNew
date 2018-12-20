using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace Utility
{
    public static class Extensions
    {
        public static int? ParseInt(this string str) => int.TryParse(str, out var i) ? i : (int?)null;

        public static bool IsNullOrWhitespace(this string str) => string.IsNullOrEmpty(str?.Trim());

        public static string IfNullOrWhitespace(this string source, string ifEmpty) => source.IsNullOrWhitespace() ? ifEmpty : source;

        public static bool Contains(this string source, string value, StringComparison comparisonType) => source.IndexOf(value, comparisonType) > -1;

        public static string Join(this IEnumerable<string> coll, string separator) => string.Join(separator, coll.ToArray());

        public static void AddRange<TK, TV>(this Dictionary<TK, TV> dic, IEnumerable<(TK key, TV value)> collection)
        {
            foreach (var i in collection)
            {
                dic.Add(i.key, i.value);
            }
        }

        public static async Task<TAccumulate> AggregateAsync<TSource, TAccumulate>(this IEnumerable<TSource> source, TAccumulate seed, Func<TAccumulate, TSource, Task<TAccumulate>> func)
        {
            return await source.Aggregate(new Task<TAccumulate>(() => seed), async (a, s) => await func(a.Result, s));
        }
    }
}
