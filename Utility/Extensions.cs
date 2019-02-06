using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Utility
{
    public static class Extensions
    {
        #region string

        public static string Join(this IEnumerable<string> coll, string separator) => string.Join(separator, coll.ToArray());

        public static bool IsNullOrWhitespace(this string str) => string.IsNullOrEmpty(str?.Trim());

        public static string IfNullOrWhitespace(this string source, string ifEmpty) => source.IsNullOrWhitespace() ? ifEmpty : source;

        public static bool Contains(this string source, string value, StringComparison comparisonType) => source.IndexOf(value, comparisonType) > -1;

        public static DateTime? ParseDate(this string str) => DateTime.TryParse(str, out var i) ? i : (DateTime?)null;

        public static long? ParseLong(this string str) => long.TryParse(str, out var i) ? i : (long?)null;

        public static int? ParseInt(this string str) => int.TryParse(str, out var i) ? i : (int?)null;

        public static uint? ParseUInt(this string str) => uint.TryParse(str, out var i) ? i : (uint?)null;

        public static bool? ParseBool(this string str)
        {
            if (!bool.TryParse(str, out var i))
            {
                if (str == "1") return true;
                if (str == "0") return false;

                return null;
            }
            return i;
        }

        public static string Match(this string str, Regex rx)
        {
            var m = rx.Match(str);

            return m.Success ? m.Value : null;
        }

        public static string Match(this string str, Regex rx, string groupName)
        {
            var m = rx.Match(str);

            return m.Success ? m.Groups[groupName]?.Value : null;
        }

        public static IEnumerable<string> Matches(this string str, Regex rx) => rx.Matches(str).Cast<Match>().Select(m => m.Value);

        #endregion

        #region Exceptions

        public static string UnwrapForLog(this Exception ex, bool outputStack = true)
        {
            var result = new StringBuilder();
            var stack = ex.StackTrace;
            result.AppendLine(ex.Message);

            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                result.AppendLine("\t" + ex.Message);
                stack = ex.StackTrace;
            }

            if (outputStack)
            {
                result.AppendLine(stack.Replace("   ", "\t"));
            }

            return result.ToString();
        }

        public static string UnwrapForLog(this AggregateException aggEx, bool outputStack = true)
        {
            var result = new StringBuilder();

            for (var i = 0; i < aggEx.InnerExceptions.Count; i++)
            {
                var ex = aggEx.InnerExceptions[i];
                var stack = ex.StackTrace;

                result.AppendLine($"[{i}] : {ex.Message}");

                while (ex.InnerException != null)
                {
                    ex = ex.InnerException;
                    result.AppendLine("\t" + ex.Message);
                    stack = ex.StackTrace;
                }

                if (outputStack)
                {
                    result.AppendLine(stack.Replace("   ", "\t"));
                }
            }

            return result.ToString();
        }

        #endregion

        #region Collections

        public static void ForEach<T>(this IEnumerable<T> coll, Action<T> body)
        {
            if (coll != null) foreach (var i in coll) body.Invoke(i);
        }

        public static void AddRange<TK, TV>(this Dictionary<TK, TV> dic, IEnumerable<(TK key, TV value)> collection)
        {
            foreach (var i in collection)
            {
                dic.Add(i.key, i.value);
            }
        }

        public static TValue GetValueOrDefault<TKey, TValue>(this IDictionary<TKey, TValue> d, TKey? key) where TKey : struct
        {
            return key != null && d.ContainsKey(key.Value) ? d[key.Value] : default(TValue);
        }

        public static TValue GetValueOrDefault<TKey, TValue>(this IDictionary<TKey, TValue> d, TKey? key, TValue defaultValue) where TKey : struct
        {
            return key != null && d.ContainsKey(key.Value) ? d[key.Value] : defaultValue;
        }

        #endregion

        public static async Task<TAccumulate> AggregateAsync<TSource, TAccumulate>(this IEnumerable<TSource> source, TAccumulate seed, Func<TAccumulate, TSource, Task<TAccumulate>> func)
        {
            return await source.Aggregate(Task.FromResult(seed), async (a, s) => await func(a.Result, s));
        }

    }
}
