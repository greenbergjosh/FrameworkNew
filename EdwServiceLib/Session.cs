using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Threading;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;

namespace EdwServiceLib
{
    public class Session
    {
        private readonly IMemoryCache _cache;
        public Guid Id { get; }
        public CancellationToken CancellationToken { get; }

        public Session(IMemoryCache cache, Guid id, CancellationToken cancellationToken)
        {
            _cache = cache;
            Id = id;
            CancellationToken = cancellationToken;
        }

        public TResult Get<TResult>(string key)
        {
            return _cache.Get<TResult>(key);
        }

        public TResult GetOrCreate<TResult>(string key, Func<TResult> factory)
        {
            return _cache.GetOrCreate(key, e =>
            {
                e.AddExpirationToken(new CancellationChangeToken(CancellationToken));
                e.RegisterPostEvictionCallback((k, v, reason, state) => {
                    if (reason != EvictionReason.Replaced)
                        Debug.WriteLine(key);
                });
                return factory();
            });
        }

        public void Set<TValue>(string key, TValue value)
        {
            _cache.Set(key, value, new MemoryCacheEntryOptions()
                .AddExpirationToken(new CancellationChangeToken(CancellationToken))
                .RegisterPostEvictionCallback((k, v, reason, state) => {
                    if (reason != EvictionReason.Replaced)
                        Debug.WriteLine(k);
                }));
        }
    }
}