using System.Threading.Tasks;

namespace System.Collections.Generic
{
    public static class IAsyncEnumerableExtensions
    {
        public static async Task<bool> Any<TSource>(this IAsyncEnumerable<TSource> source)
        {
            await foreach (var _ in source)
            {
                return true;
            }

            return false;
        }

        public static async Task<bool> Any<TSource>(this IAsyncEnumerable<TSource> source, Func<TSource, bool> predicate)
        {
            await foreach (var item in source)
            {
                if (predicate(item))
                {
                    return true;
                }
            }

            return false;
        }

        public static async Task<bool> Any<TSource>(this IAsyncEnumerable<TSource> source, Func<TSource, Task<bool>> predicate)
        {
            await foreach (var item in source)
            {
                if (await predicate(item))
                {
                    return true;
                }
            }

            return false;
        }

        public static async Task<int> Count<TSource>(this IAsyncEnumerable<TSource> source)
        {
            var count = 0;
            await foreach (var _ in source)
            {
                count++;
            }

            return count;
        }

        public static async Task<IEnumerable<TSource>> Distinct<TSource>(this IAsyncEnumerable<TSource> source)
        {
            var distinct = new HashSet<TSource>();
            await foreach (var item in source)
            {
                _ = distinct.Add(item);
            }

            return distinct;
        }

        public static async Task<TSource> FirstOrDefault<TSource>(this IAsyncEnumerable<TSource> source)
        {
            await foreach (var item in source)
            {
                return item;
            }

            return default;
        }

        public static async Task<TSource> FirstOrDefault<TSource>(this IAsyncEnumerable<TSource> source, TSource defaultValue)
        {
            await foreach (var item in source)
            {
                return item;
            }

            return defaultValue;
        }

        public static async Task<IEnumerator<TSource>> GetEnumerator<TSource>(this IAsyncEnumerable<TSource> source) => (await source.ToList()).GetEnumerator();

        public static async Task<string> Join(this IAsyncEnumerable<string> source, string separator) => string.Join(separator, await source.ToList());

        public static async IAsyncEnumerable<TResult> Select<TSource, TResult>(this IAsyncEnumerable<TSource> source, Func<TSource, TResult> selector)
        {
            await foreach (var item in source)
            {
                yield return selector(item);
            }
        }

        public static async IAsyncEnumerable<TResult> Select<TSource, TResult>(this IAsyncEnumerable<TSource> source, Func<TSource, Task<TResult>> selector)
        {
            await foreach (var item in source)
            {
                yield return await selector(item);
            }
        }

        public static async Task<TSource> Single<TSource>(this IAsyncEnumerable<TSource> source)
        {
            var count = 0;
            TSource single = default;

            await foreach (var item in source)
            {
                if (count++ != 0)
                {
                    throw new InvalidOperationException("Sequence contains more than one element");
                }

                single = item;
            }

            if (count == 0)
            {
                throw new InvalidOperationException("Sequence contains no elements");
            }

            return single;
        }

        public static async Task<TSource> SingleOrDefault<TSource>(this IAsyncEnumerable<TSource> source) where TSource : class
        {
            TSource single = default;
            await foreach (var item in source)
            {
                if (single != default)
                {
                    return default;
                }

                single = item;
            }

            return single;
        }

        public static async Task<TSource[]> ToArray<TSource>(this IAsyncEnumerable<TSource> source) => (await source.ToList()).ToArray();

        public static Task<Dictionary<TKey, TSource>> ToDictionary<TSource, TKey>(this IAsyncEnumerable<TSource> source, Func<TSource, Task<TKey>> keySelector) where TKey : notnull => ToDictionary(source, keySelector, null);

        public static Task<Dictionary<TKey, TSource>> ToDictionary<TSource, TKey>(this IAsyncEnumerable<TSource> source, Func<TSource, Task<TKey>> keySelector, IEqualityComparer<TKey> comparer) where TKey : notnull => ToDictionary(source, keySelector, x => Task.FromResult(x), comparer);

        public static Task<Dictionary<TKey, TElement>> ToDictionary<TSource, TKey, TElement>(this IAsyncEnumerable<TSource> source, Func<TSource, Task<TKey>> keySelector, Func<TSource, Task<TElement>> elementSelector) where TKey : notnull => ToDictionary(source, keySelector, elementSelector, null);

        public static async Task<Dictionary<TKey, TElement>> ToDictionary<TSource, TKey, TElement>(this IAsyncEnumerable<TSource> source, Func<TSource, Task<TKey>> keySelector, Func<TSource, Task<TElement>> elementSelector, IEqualityComparer<TKey> comparer) where TKey : notnull
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

            await foreach (var element in source)
            {
                d.Add(await keySelector(element), await elementSelector(element));
            }

            return d;
        }

        public static async Task<List<TSource>> ToList<TSource>(this IAsyncEnumerable<TSource> source)
        {
            var list = new List<TSource>();

            await foreach (var item in source)
            {
                list.Add(item);
            }

            return list;
        }

        public static async IAsyncEnumerable<TSource> Where<TSource>(this IAsyncEnumerable<TSource> source, Func<TSource, bool> predicate)
        {
            await foreach (var item in source)
            {
                if (predicate(item))
                {
                    yield return item;
                }
            }
        }

        public static async IAsyncEnumerable<TSource> Where<TSource>(this IAsyncEnumerable<TSource> source, Func<TSource, Task<bool>> predicate)
        {
            await foreach (var item in source)
            {
                if (await predicate(item))
                {
                    yield return item;
                }
            }
        }
    }
}
