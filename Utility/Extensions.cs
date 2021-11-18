using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Utility
{
    public static class Extensions
    {
        #region string

        // Split string into strings of a max size
        public static IEnumerable<string> Split(this string str, int size)
        {
            var skip = 0;
            var res = new List<string>();
            var cstr = str.Select(c => c.ToString()).ToArray();

            while (skip < str.Length)
            {
                res.Add(cstr.Skip(skip).Take(size).Join(""));
                skip += size;
            }

            return res;
        }

        public static void ForEach<T>(this IEnumerable<T> coll, Action<T> body)
        {
            if (coll != null)
            {
                foreach (var i in coll)
                {
                    body.Invoke(i);
                }
            }
        }

        public static string Join(this IEnumerable<string> coll, string separator) => string.Join(separator, coll.ToArray());

        public static bool IsNullOrWhitespace(this string str) => string.IsNullOrEmpty(str?.Trim());

        public static string IfNullOrWhitespace(this string source, string ifEmpty) => source.IsNullOrWhitespace() ? ifEmpty : source;

        public static DateTime? ParseDate(this string str) => DateTime.TryParse(str, out var i) ? i : null;

        public static int? ParseInt(this string str) => int.TryParse(str, out var i) ? i : null;

        public static Guid? ParseGuid(this string str) => Guid.TryParse(str, out var i) ? i : null;

        public static bool? ParseBool(this string str)
        {
            if (str.IsNullOrWhitespace())
            {
                return null;
            }

            if (!bool.TryParse(str, out var i))
            {
                str = str.ToLower();

                return str is "1" or "true" or "t" or "y" or "yes"
                    ? true
                    : str is "0" or "false" or "f" or "n" or "no" ? false : null;
            }

            return i;
        }

        public static bool IsMatch(this string str, Regex rx)
        {
            if (str.IsNullOrWhitespace())
            {
                return false;
            }

            var m = rx.Match(str);

            return m.Success;
        }
        #endregion

        #region Exceptions

        public static string UnwrapForLog(this Exception ex, bool outputStack = true)
        {
            var result = new StringBuilder();
            var stack = ex.StackTrace;
            _ = result.AppendLine(ex.Message);

            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                _ = result.AppendLine("\t" + ex.Message);
                stack = ex.StackTrace;
            }

            if (outputStack && stack != null)
            {
                _ = result.AppendLine(stack.Replace("   ", "\t"));
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

                _ = result.AppendLine($"[{i}] : {ex.Message}");

                while (ex.InnerException != null)
                {
                    ex = ex.InnerException;
                    _ = result.AppendLine("\t" + ex.Message);
                    stack = ex.StackTrace;
                }

                if (outputStack)
                {
                    _ = result.AppendLine(stack.Replace("   ", "\t"));
                }
            }

            return result.ToString();
        }

        #endregion

        #region Collections
        public static IEnumerable<T> DistinctBy<T, TKey>(this IEnumerable<T> col, Func<T, TKey> keySelector, bool takeLast = false)
        {
            var grp = col.GroupBy(keySelector);

            return takeLast ? grp.Select(g => g.Last()) : grp.Select(g => g.First());
        }

        #endregion

        #region IO

        public static string PathCombine(this DirectoryInfo di, params string[] parts) => Path.Combine(parts.Prepend(di.FullName).ToArray());

        public static async Task<string> ReadAllTextAsync(this FileInfo fi)
        {
            using var fr = fi.OpenText();
            return await fr.ReadToEndAsync();
        }

        #endregion

        public static Stopwatch Restart(this Stopwatch sw, Action first)
        {
            first?.Invoke();
            sw.Restart();
            return sw;
        }
    }
}
