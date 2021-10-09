using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.Entity.QueryLanguage;

namespace Utility.Entity
{
    public delegate Task<EntityDocument> EntityParser(Entity entity, string content);
    public delegate Task<Entity> EntityRetriever(Uri uri);

    public class Entity : IEquatable<Entity>
    {
        private readonly ConcurrentDictionary<string, EntityParser> _parsers;
        private readonly ConcurrentDictionary<string, EntityRetriever> _retrievers;
        private readonly EntityDocument _root;

        public string Query
        {
            get { return _root?.Query; }
            internal set { _root.Query = value; }
        }

        internal EntityDocument Document => _root;

        public EntityValueType ValueType => _root?.ValueType ?? EntityValueType.Undefined;

        public static Entity Undefined { get; } = new Entity(EntityDocumentConstant.Undefined, null, null);

        public T Value<T>() => _root == null ? default : _root.Value<T>();

        private Entity()
        {
            _retrievers = new();
            _parsers = new();
        }

        private Entity(EntityDocument root, ConcurrentDictionary<string, EntityParser> parsers, ConcurrentDictionary<string, EntityRetriever> retrievers)
        {
            if (root != null)
            {
                _root = root;
                _root.Entity = this;
            }
            else
            {
                _root = EntityDocumentConstant.Null;
            }

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

        public static Entity Create(Entity baseEntity, EntityDocument entityDocument) => new(entityDocument, baseEntity._parsers, baseEntity._retrievers);

        public async Task<Entity> Parse(string contentType, string content)
        {
            if (!_parsers.TryGetValue(contentType, out var parser))
            {
                throw new ArgumentException($"ContentType {contentType} is not supported", nameof(contentType));
            }

            var entityDocument = await parser(this, content);

            return new Entity(entityDocument, _parsers, _retrievers);
        }

        public Task<IEnumerable<Entity>> Evaluate(Query query) => Evaluate(new[] { this }, query);

        public async Task<IEnumerable<Entity>> Evaluate(string query)
        {
            IEnumerable<Entity> root;
            Query parsedQuery;

            if (Uri.TryCreate(query, UriKind.Absolute, out var uri))
            {
                if (!_retrievers.TryGetValue(uri.Scheme, out var retriever))
                {
                    throw new ArgumentException($"No retriever for scheme {uri.Scheme} in URI {query}");
                }

                root = new[] { (await retriever(uri)) };

                if (root == null)
                {
                    throw new InvalidOperationException("Absolute query did not return an entity");
                }

                parsedQuery = QueryLanguage.Query.Parse(this, uri.Query ?? "$");
            }
            else
            {
                if (_root == null)
                {
                    throw new InvalidOperationException("Cannot run a relative query on a null entity");
                }

                root = new[] { this };
                parsedQuery = QueryLanguage.Query.Parse(this, query);
            }

            return await Evaluate(root, parsedQuery);
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

        private static async Task<IEnumerable<Entity>> Evaluate(IEnumerable<Entity> root, Query query)
        {
            var current = root;
            foreach (var selector in query.Selectors)
            {
                var next = new List<Entity>();
                foreach (var document in current)
                {
                    await foreach (var match in selector.Process(document))
                    {
                        next.Add(match);
                    }
                }
                current = next;
            }

            return current;
        }

        public bool Equals(Entity other) => _root?.Equals(other?.Document) ?? false;

        public override bool Equals(object obj) => Equals(obj as Entity);

        public override int GetHashCode() => _root?.GetHashCode() ?? base.GetHashCode();
    }
}
