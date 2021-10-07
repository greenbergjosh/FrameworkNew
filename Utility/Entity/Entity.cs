using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.Entity.QueryLanguage;

namespace Utility.Entity
{
    public delegate Task<EntityDocument> EntityParser(string content);
    public delegate Task<Entity> EntityRetriever(Uri uri);

    public class Entity
    {
        private readonly ConcurrentDictionary<string, EntityParser> _parsers;
        private readonly ConcurrentDictionary<string, EntityRetriever> _retrievers;
        private readonly EntityDocument _root;

        public string Query => _root?.Query;

        public T Value<T>() => _root.Value<T>();

        private Entity()
        {
            _retrievers = new();
            _parsers = new();
        }

        private Entity(EntityDocument root, ConcurrentDictionary<string, EntityParser> parsers, ConcurrentDictionary<string, EntityRetriever> retrievers)
        {
            _root = root;
            _parsers = parsers;
            _retrievers = retrievers;
        }

        public static Entity Initialize(IDictionary<string, EntityParser> parsers, IDictionary<string, EntityRetriever> retrievers)
        {
            var entity = new Entity();

            if (retrievers != null)
            {
                foreach (var (scheme, retriever) in retrievers)
                {
                    entity._retrievers.TryAdd(scheme, retriever);
                }
            }

            if (parsers != null)
            {
                foreach (var (contentType, parser) in parsers)
                {
                    entity._parsers.TryAdd(contentType, parser);
                }
            }

            return entity;
        }

        public async Task<Entity> Parse(string contentType, string content)
        {
            if (!_parsers.TryGetValue(contentType, out var parser))
            {
                throw new ArgumentException($"ContentType {contentType} is not supported", nameof(contentType));
            }

            var entityDocument = await parser(content);

            return new Entity(entityDocument, _parsers, _retrievers);
        }

        public async Task<IEnumerable<Entity>> Evaluate(string query)
        {
            IEnumerable<EntityDocument> root;
            Query parsedQuery;

            if (Uri.TryCreate(query, UriKind.Absolute, out var uri))
            {
                if (!_retrievers.TryGetValue(uri.Scheme, out var retriever))
                {
                    throw new ArgumentException($"No retriever for scheme {uri.Scheme} in URI {query}");
                }

                root = new[] { (await retriever(uri))._root };

                if (root == null)
                {
                    throw new InvalidOperationException("Absolute query did not return an entity");
                }

                parsedQuery = QueryLanguage.Query.Parse(uri.Query ?? "$");
            }
            else
            {
                if (_root == null)
                {
                    throw new InvalidOperationException("Cannot run a relative query on a null entity");
                }

                root = new[] { _root };
                parsedQuery = QueryLanguage.Query.Parse(query);
            }

            var current = root;
            foreach (var token in parsedQuery.Tokens)
            {
                var next = new List<EntityDocument>();
                foreach (var document in current)
                {
                    var matches = document.Process(token);
                    next.AddRange(matches);
                }
                current = next;
            }

            return current.Select(entityDocument => new Entity(entityDocument, _parsers, _retrievers));
        }

        public async Task<Entity> Get(string query)
        {
            foreach (var entity in await Evaluate(query))
            {
                return entity;
            }

            return null;
        }

        public Task<IEnumerable<Entity>> GetL(string query) => Evaluate(query);

        public async Task<string> GetS(string query) => (await Get(query)).Value<string>();

        public async Task<int> GetI(string query) => (await Get(query)).Value<int>();

        public override string ToString() => $"Query: {Query} Data: {_root}";
    }
}
