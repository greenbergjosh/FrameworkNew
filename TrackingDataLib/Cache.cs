using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Caching.Redis;
using Microsoft.Extensions.Options;
using Utility;
using Utility.GenericEntity;

namespace TrackingDataLib
{
    internal static class Cache
    {
        private static IDistributedCache _cache;

        internal static void Config(FrameworkWrapper fw)
        {
            var cacheType = fw.StartupConfiguration.GetS("/cache/type").IfNullOrWhitespace("in-memory");

            switch (cacheType)
            {
                case "in-memory":
                    _cache = new MemoryDistributedCache(Options.Create(new MemoryDistributedCacheOptions()));
                    break;
                case "redis":
                    _cache = new RedisCache(Options.Create(new RedisCacheOptions()
                    {
                        Configuration = fw.StartupConfiguration.GetS("/cache/configuration"),
                        InstanceName = fw.StartupConfiguration.GetS("/cache/instanceName")
                    }));
                    break;
                default:
                    throw new ArgumentException($"Unknown cache type: [{cacheType}]", "cache/type");
            }
        }

        internal static async Task<(bool found, IGenericEntity value)> TryGet(string key)
        {
            var value = await _cache.GetStringAsync(key);
            if (value == null)
            {
                return (false, new GenericEntityJson());
            }

            return (true, JsonWrapper.JsonToGenericEntity(value));
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

        internal static Task Set(string key, IGenericEntity value, TimeSpan? slidingExpiration) => _cache.SetStringAsync(key, value.GetS(""), new DistributedCacheEntryOptions() { SlidingExpiration = slidingExpiration });

        internal static Task Set(Dictionary<string, object> rsIds, IGenericEntity value, TimeSpan? slidingExpiration)
        {
            var key = string.Join(',', rsIds.Select(kvp => $"{kvp.Key}:{kvp.Value}"));
            return Set(key, value, slidingExpiration);
        }

        internal static Task Set(Guid guid, IGenericEntity value, TimeSpan? slidingExpiration)
        {
            var key = guid.ToString();
            return Set(key, value, slidingExpiration);
        }
    }
}
