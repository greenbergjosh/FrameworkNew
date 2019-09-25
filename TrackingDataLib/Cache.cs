using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.GenericEntity;

namespace TrackingDataLib
{
    internal static class Cache
    {
        // TODO: Replace this with database cache
        private static Dictionary<string, IGenericEntity> _cache = new Dictionary<string, IGenericEntity>();

        internal static Task<(bool found, IGenericEntity value)> TryGet(string key)
        {
            var found = _cache.TryGetValue(key, out var value);
            return Task.FromResult((found, value));
        }

        internal static Task<(bool found, IGenericEntity value)> TryGet(Dictionary<string, object> rsIds)
        {
            var key = string.Join(',', rsIds.Select(kvp => $"{kvp.Key}:{kvp.Value}"));
            return TryGet(key);
        }

        internal static Task<(bool found, IGenericEntity value)> TryGet(Guid guid)
        {
            var key = guid.ToString();
            return TryGet(key);
        }

        internal static Task Set(string key, IGenericEntity value)
        {
            _cache[key] = value;
            return Task.CompletedTask;
        }

        internal static Task Set(Dictionary<string, object> rsIds, IGenericEntity value)
        {
            var key = string.Join(',', rsIds.Select(kvp => $"{kvp.Key}:{kvp.Value}"));
            return Set(key, value);
        }

        internal static Task Set(Guid guid, IGenericEntity value)
        {
            var key = guid.ToString();
            return Set(key, value);
        }
    }
}
