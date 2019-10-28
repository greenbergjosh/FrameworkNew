using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Utility.DataLayer;
using Utility.GenericEntity;

namespace Utility
{
    public static class AppCache
    {
        private const string Conn = "AppCache";

        public static async Task<Guid> GetOrCreateCacheScope(string name)
        {
            var args = JsonWrapper.Serialize(new { name });
            var dataCacheKeys = await Data.CallFn(Conn, "getOrCreateCacheScope", args);
            return Guid.Parse(dataCacheKeys.GetE("result").Get("id").ToString());
        }

        public static async Task<IEnumerable<IGenericEntity>> GetCacheKeys(Guid cacheScopeId)
        {
            var args = JsonWrapper.Serialize(new {cacheScopeId});
            var dataCacheKeys = await Data.CallFn(Conn, "listDataCacheKeys", args);
            var results = dataCacheKeys.GetL("result");
            return results?.ToList() ?? Enumerable.Empty<IGenericEntity>();
        }

        public static async Task AddDataCache(Guid cacheScopeId, string json, DateTime? expires, params string[] keys)
        {
            var rawArgs = new Dictionary<string, object>
            {
                ["cacheScopeId"] = cacheScopeId
            };

            if (expires.HasValue)
                rawArgs["expires"] = expires.Value.ToString("yyyy-MM-dd");

            for (var i = 0; i < keys.Length; i++)
                rawArgs["x" + (i + 1)] = keys[i];

            var args = JsonWrapper.Serialize(rawArgs);

            var res = await Data.CallFn(Conn, "addDataCache", args, json);
        }

        public static bool IsInCacheKeys(IEnumerable<IGenericEntity> cacheKeys, params string[] keys)
        {
            return cacheKeys.Any(c =>
            {
                return keys
                    .Where((k, i) => string.CompareOrdinal(c.Get("x" + (i + 1))?.ToString(), k) == 0)
                    .Count() == keys.Length;
            });
        }
    }
}