using System.Linq;
using System.Threading.Tasks;

namespace System.Collections.Generic
{
    public static class IEnumerableExtensions
    {
        public static Task<IOrderedEnumerable<TSource>> OrderBy<TSource, TKey>(this Task<IEnumerable<TSource>> source, Func<TSource, TKey> keySelector) => OrderBy(source, keySelector, Comparer<TKey>.Default);

        public static async Task<IOrderedEnumerable<TSource>> OrderBy<TSource, TKey>(this Task<IEnumerable<TSource>> source, Func<TSource, TKey> keySelector, IComparer<TKey> comparer)
        {
            var sequence = await source;

            if (sequence is null)
            {
                throw new ArgumentNullException(nameof(source));
            }

            if (keySelector is null)
            {
                throw new ArgumentNullException(nameof(keySelector));
            }

            return sequence.OrderBy(keySelector, comparer);
        }

        public static Task<IOrderedEnumerable<TSource>> OrderByDescending<TSource, TKey>(this IEnumerable<TSource> source, Func<TSource, Task<TKey>> keySelector) => OrderByDescending(source, keySelector, Comparer<TKey>.Default);

        public static async Task<IOrderedEnumerable<TSource>> OrderByDescending<TSource, TKey>(this IEnumerable<TSource> source, Func<TSource, Task<TKey>> keySelector, IComparer<TKey> comparer)
        {
            if (source is null)
            {
                throw new ArgumentNullException(nameof(source));
            }

            if (keySelector is null)
            {
                throw new ArgumentNullException(nameof(keySelector));
            }

            var keys = new Dictionary<TSource, TKey>();

            foreach (var item in source)
            {
                var key = await keySelector(item);
                keys.Add(item, key);
            }

            return source.OrderByDescending(item => keys[item], comparer);
        }

        public static async Task<IEnumerable<TResult>> Select<TSource, TResult>(this Task<IOrderedEnumerable<TSource>> source, Func<TSource, TResult> selector)
        {
            var sequence = await source;

            if (sequence is null)
            {
                throw new ArgumentNullException(nameof(source));
            }

            if (selector is null)
            {
                throw new ArgumentNullException(nameof(selector));
            }

            return sequence.Select(selector);
        }

        public static async Task<IEnumerable<TResult>> Select<TSource, TResult>(this IEnumerable<TSource> source, Func<TSource, Task<TResult>> selector)
        {
            var result = new List<TResult>();

            foreach (var entity in source)
            {
                result.Add(await selector(entity));
            }

            return result;
        }

        public static async Task<IEnumerable<TResult>> Select<TSource, TResult>(this Task<IEnumerable<TSource>> source, Func<TSource, Task<TResult>> selector)
        {
            var result = new List<TResult>();

            foreach (var entity in await source)
            {
                result.Add(await selector(entity));
            }

            return result;
        }

        public static async Task<TSource> SingleOrDefault<TSource>(this IEnumerable<TSource> source, Func<TSource, Task<bool>> predicate)
        {
            TSource found = default;
            var alreadyFound = false;

            foreach (var entity in source)
            {
                if (await predicate(entity))
                {
                    if (alreadyFound)
                    {
                        return default;
                    }

                    found = entity;
                }
            }

            return found;
        }

        public static Task<Dictionary<TKey, TSource>> ToDictionary<TSource, TKey>(this IEnumerable<TSource> source, Func<TSource, Task<TKey>> keySelector) where TKey : notnull => ToDictionary(source, keySelector, null);

        public static Task<Dictionary<TKey, TSource>> ToDictionary<TSource, TKey>(this IEnumerable<TSource> source, Func<TSource, Task<TKey>> keySelector, IEqualityComparer<TKey> comparer) where TKey : notnull => ToDictionary(source, keySelector, x => Task.FromResult(x), comparer);

        public static Task<Dictionary<TKey, TElement>> ToDictionary<TSource, TKey, TElement>(this IEnumerable<TSource> source, Func<TSource, Task<TKey>> keySelector, Func<TSource, Task<TElement>> elementSelector) where TKey : notnull => ToDictionary(source, keySelector, elementSelector, null);

        public static async Task<Dictionary<TKey, TElement>> ToDictionary<TSource, TKey, TElement>(this IEnumerable<TSource> source, Func<TSource, Task<TKey>> keySelector, Func<TSource, Task<TElement>> elementSelector, IEqualityComparer<TKey> comparer) where TKey : notnull
        {
            if (source == null)
            {
                throw new ArgumentNullException(nameof(source));
            }

            if (keySelector == null)
            {
                throw new ArgumentNullException(nameof(keySelector));
            }

            if (elementSelector == null)
            {
                throw new ArgumentNullException(nameof(elementSelector));
            }

            var d = new Dictionary<TKey, TElement>(comparer);
            foreach (var element in source)
            {
                d.Add(await keySelector(element), await elementSelector(element));
            }

            return d;
        }

        public static async Task<IEnumerable<TSource>> Where<TSource>(this IEnumerable<TSource> source, Func<TSource, Task<bool>> predicate)
        {
            var found = new List<TSource>();

            foreach (var entity in source)
            {
                if (await predicate(entity))
                {
                    found.Add(entity);
                }
            }

            return found;
        }
    }
}
