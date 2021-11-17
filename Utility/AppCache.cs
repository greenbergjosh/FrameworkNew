using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Utility.DataLayer;

namespace Utility
{
    public static class AppCache
    {
        private const string Conn = "AppCache";

        public static async Task<Guid> GetOrCreateCacheScope(string name)
        {
            var args = JsonSerializer.Serialize(new { name });
            var dataCacheKeys = await Data.CallFn(Conn, "getOrCreateCacheScope", args);
            return Guid.Parse(await dataCacheKeys.EvalS("result.id"));
        }

        public static async Task<IReadOnlyList<Entity.Entity>> GetCacheKeys(Guid cacheScopeId, params string[] keys)
        {
            var rawArgs = new Dictionary<string, object>
            {
                ["cacheScopeId"] = cacheScopeId
            };

            for (var i = 0; i < keys.Length; i++)
            {
                rawArgs["x" + (i + 1)] = keys[i];
            }

            var args = JsonSerializer.Serialize(rawArgs);

            var dataCacheKeys = await Data.CallFn(Conn, "getDataCaches", args);
            var results = await dataCacheKeys.EvalL("result");
            return results?.ToList() ?? Enumerable.Empty<Entity.Entity>().ToList();
        }

        public static async Task AddDataCache(Guid cacheScopeId, DateTime? expires, params string[] keys)
        {
            var rawArgs = new Dictionary<string, object>
            {
                ["cacheScopeId"] = cacheScopeId
            };

            if (expires.HasValue)
            {
                rawArgs["expires"] = expires.Value.ToString("yyyy-MM-dd");
            }

            for (var i = 0; i < keys.Length; i++)
            {
                rawArgs["x" + (i + 1)] = keys[i];
            }

            var args = JsonSerializer.Serialize(rawArgs);

            _ = await Data.CallFn(Conn, "addDataCache", args);
        }

        public static async Task<bool> IsInCacheKeys(IEnumerable<Entity.Entity> cacheKeys, params string[] keys)
        { 
            foreach(var cacheKey in cacheKeys)
            {
                var allMatched = true;

                for(var i = 0; i < keys.Length; i++)
                {
                    var key = keys[i];
                    if (string.CompareOrdinal(await cacheKey.EvalS($"x{i+1}"), key) == 0)
                    {
                        allMatched = false;
                        break;
                    }
                }

                if (allMatched)
                {
                    return true;
                }
            }

            return false;
        }
    }
}