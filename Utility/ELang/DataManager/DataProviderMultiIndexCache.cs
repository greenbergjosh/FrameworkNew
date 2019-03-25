using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.Collections.Concurrent;
using System.Runtime.Caching;

namespace DataManager
{
    public class MultiIndexCacheIndex<TKey, TValue, TObject>
    {
        string _indexName;
        private ConcurrentDictionary<TKey, TValue> _indexCache;
        Func<TObject, TKey> _getKey;

        public MultiIndexCacheIndex(string indexName, Func<TObject, TKey> getKey)
        {
            _indexName = indexName;
            _indexCache = new ConcurrentDictionary<TKey, TValue>();
            _getKey = getKey;
        }

        public bool TryRemove(TObject item, out TValue pKey)
        {
            return _indexCache.TryRemove(_getKey(item), out pKey);
        }

        public void Add(TObject item, TValue pKey)
        {
            _indexCache[_getKey(item)] = pKey;
        }

        public bool TryGetPrimaryKey(TKey secondaryKey, out TValue pKey)
        {
            return _indexCache.TryGetValue(secondaryKey, out pKey);
        }
    }

    public class DataProviderMultiIndexCache<TObject>
    {
        public delegate bool GetItem(ref string pKey, string index, string sKey, out TObject item);

        private string _cacheName;
        private MemoryCache _cache;
        private Dictionary<string, MultiIndexCacheIndex<string, string, TObject>> _indexes;
        private GetItem _getItem;
        private CacheItemPolicy _cacheItemPolicy;
        private readonly object cacheLock = new object();

        public DataProviderMultiIndexCache(string cacheName, GetItem getItem,
            Dictionary<string, MultiIndexCacheIndex<string, string, TObject>> indexes,
            CacheItemPolicy cacheItemPolicy)
        {
            _cacheName = cacheName;
            _indexes = indexes;
            _cache = new MemoryCache(cacheName);
            _getItem = getItem;
            _cacheItemPolicy = cacheItemPolicy;
            _cacheItemPolicy.UpdateCallback += CacheEntryUpdateCallback_Handler;
            _cacheItemPolicy.AbsoluteExpiration = new DateTimeOffset(DateTime.Now.AddSeconds(2));
        }

        public void CacheEntryUpdateCallback_Handler(CacheEntryUpdateArguments args)
        {
            // Called prior to cache entry being removed
            string pKey;
            lock (cacheLock)
            {
                foreach (var index in _indexes)
                {
                    index.Value.TryRemove((TObject)_cache[args.Key], out pKey);
                }
            }
        }

        private bool LookUpItem(ref string pKey, string index, string sKey, out TObject item)
        {
            bool usePKey = (pKey != null && pKey != "");
            bool useSKey = (index != null && index != "") && (sKey != null && sKey != "");

            if (!usePKey && !useSKey) throw new Exception("No key supplied");

            if (usePKey)
            {
                item = (TObject)_cache.Get(pKey, null);
                if (item != null) return true;
            }
            else
            {
                bool foundPKey = _indexes[index].TryGetPrimaryKey(sKey, out pKey);
                if (foundPKey)
                {
                    item = (TObject)_cache.Get(pKey, null);
                    if (item != null) return true;
                }
            }
            item = default(TObject);
            return false;
        }

        public bool TryGetItem(ref string pKey, string index, string sKey, out TObject item)
        {
            if (LookUpItem(ref pKey, index, sKey, out item)) return true;

            lock (cacheLock)
            {
                if (LookUpItem(ref pKey, index, sKey, out item)) return true;

                //The value still did not exist so we now write it in to the cache.
                bool found = _getItem(ref pKey, index, sKey, out item);
                if (found)
                {
                    var cacheItemPolicy = new CacheItemPolicy();
                    cacheItemPolicy.UpdateCallback += CacheEntryUpdateCallback_Handler;
                    cacheItemPolicy.AbsoluteExpiration = new DateTimeOffset(DateTime.Now.AddSeconds(2));
                    _cache.Set(pKey, item, cacheItemPolicy);

                    foreach (var ix in _indexes)
                    {
                        ix.Value.Add(item, pKey);
                    }

                    return true;
                }
            }
            item = default(TObject);
            return false;
        }
    }
}
