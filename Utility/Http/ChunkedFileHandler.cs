using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;

namespace Utility.Http
{
    public interface IChunkStorageProvider
    {
        /// <summary>
        /// Stores a chunk of a file in the underlying datastore.
        /// </summary>
        /// <param name="key">The key identifying the file the chunk belongs to.</param>
        /// <param name="chunkIndex">The index of the chunk.</param>
        /// <param name="chunk">The chunk <see cref="Stream"/>.</param>
        /// <returns>The completed file as a <see cref="Stream"/> if the file is complete, otherwise null.</returns>
        Task<Stream> StoreChunk(string key, int chunkIndex, int totalChunks, Stream chunk);

        /// <summary>
        /// Cancels processing of a chunked file.
        /// </summary>
        /// <param name="key">The key by identifying the file.</param>
        Task Cancel(string key);
    }

    public class IDistributedCacheChunkStorageProvider : IChunkStorageProvider
    {
        private readonly IDistributedCache _cache;
        private const string _cacheKeyPrefix = "ChunkStorage-";

        public IDistributedCacheChunkStorageProvider(IDistributedCache cache) => _cache = cache;

        Task IChunkStorageProvider.Cancel(string key)
        {
            _cache.Remove(BuildKey(key));
            return Task.CompletedTask;
        }

        async Task<Stream> IChunkStorageProvider.StoreChunk(string key, int chunkIndex, int totalChunks, Stream chunk)
        {
            var cacheKey = BuildKey(key);

            var chunks = JsonConvert.DeserializeObject<Dictionary<int, byte[]>>(await _cache.GetStringAsync(cacheKey) ?? "{}");

            if (chunkIndex > 0 && chunks.Count == 0)
            {
                throw new TimeoutException();
            }

            var buffer = new byte[chunk.Length];

            _ = await chunk.ReadAsync(buffer);

            chunks[chunkIndex] = buffer;

            await _cache.SetStringAsync(cacheKey, JsonConvert.SerializeObject(chunks), new DistributedCacheEntryOptions() { SlidingExpiration = TimeSpan.FromMinutes(5) });

            if (chunks.Count == totalChunks)
            {
                await _cache.RemoveAsync(cacheKey);
                return Complete(chunks);
            }

            return null;
        }

        private static string BuildKey(string key) => $"{_cacheKeyPrefix}{key}";

        private static Stream Complete(IDictionary<int, byte[]> chunks)
        {
            var result = new byte[chunks.Sum(chunk => chunk.Value.Length)];

            var offset = 0;
            for (var i = 0; i < chunks.Count; i++)
            {
                var chunk = chunks[i];
                chunk.CopyTo(result, offset);
                offset += chunk.Length;
            }

            return new MemoryStream(result);
        }
    }

    public class ChunkedFileHandler
    {
        private readonly IChunkStorageProvider _storage;

        public ChunkedFileHandler(IChunkStorageProvider storageProvider) => _storage = storageProvider;

        /// <summary>
        /// Processes a single chunk of a file.
        /// </summary>
        /// <param name="key">The key identifying the file the chunk belongs to.</param>
        /// <param name="chunkIndex">The index of the chunk.</param>
        /// <param name="chunk">The chunk <see cref="Stream"/>.</param>
        /// <returns></returns>
        public Task<Stream> HandleChunk(string key, int chunkIndex, int totalChunks, Stream chunk) => _storage.StoreChunk(key, chunkIndex, totalChunks, chunk);
    }
}
