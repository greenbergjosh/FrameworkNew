using System.Collections.Generic;
using System.Threading.Tasks;

namespace TrackingDataLib
{
    internal static class Cache
    {
        // TODO: Replace this with database cache
        private static Dictionary<string, object> _cache = new Dictionary<string, object>();

        internal static Task<(bool found, object value)> TryGet(string key)
        {
            var found = _cache.TryGetValue(key, out var value);
            return Task.FromResult((found, value));
        }

        internal static Task Set(string key, object value)
        {
            _cache[key] = value;
            return Task.CompletedTask;
        }
    }
}
