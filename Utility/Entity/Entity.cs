using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.Entity.QueryLanguage;
using Utility.Entity.QueryLanguage.Selectors;

namespace Utility.Entity
{
    public delegate Task<EntityDocument> EntityParser(Entity entity, string content);
    public delegate Task<Entity> EntityRetriever(Entity entity, Uri uri);

    public class Entity : IEquatable<Entity>
    {
        private readonly ConcurrentDictionary<string, EntityParser> _parsers;
        private readonly ConcurrentDictionary<string, EntityRetriever> _retrievers;
        private readonly EntityDocument _value;

        public string Query
        {
            get { return _value?.Query; }
            internal set { _value.Query = value; }
        }

        public Entity Root { get; init; }

        internal EntityDocument Document => _value;

        public EntityValueType ValueType => _value?.ValueType ?? EntityValueType.Undefined;

        public static Entity Undefined { get; } = new Entity(EntityDocumentConstant.Undefined, null, null, null);

        public T Value<T>() => _value == null ? default : _value.Value<T>();

        private Entity()
        {
            _retrievers = new(StringComparer.CurrentCultureIgnoreCase);
            _parsers = new(StringComparer.CurrentCultureIgnoreCase);
        }

        private Entity(EntityDocument value, Entity root, ConcurrentDictionary<string, EntityParser> parsers, ConcurrentDictionary<string, EntityRetriever> retrievers)
        {
            if (value != null)
            {
                _value = value;
                _value.Entity = this;
            }
            else
            {
                _value = EntityDocumentConstant.Null;
            }

            _parsers = parsers;
            _retrievers = retrievers;

            Root = root?.Root ?? this;
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

        public static Entity Create(Entity baseEntity, EntityDocument entityDocument) => new(entityDocument, baseEntity, baseEntity._parsers, baseEntity._retrievers);

        public async Task<Entity> Parse(string contentType, string content)
        {
            if (!_parsers.TryGetValue(contentType, out var parser))
            {
                throw new ArgumentException($"ContentType {contentType} is not supported", nameof(contentType));
            }

            var entityDocument = await parser(this, content);

            return new Entity(entityDocument, null, _parsers, _retrievers);
        }

        public Task<IEnumerable<Entity>> Evaluate(Query query) => Evaluate(this, query);

        public async Task<IEnumerable<Entity>> Evaluate(string query)
        {
            Entity entity;
            Query parsedQuery;

            if (Uri.TryCreate(query, UriKind.Absolute, out var uri))
            {
                if (!_retrievers.TryGetValue(uri.Scheme, out var retriever))
                {
                    throw new ArgumentException($"No retriever for scheme {uri.Scheme} in URI {query}");
                }

                entity = await retriever(this, uri);

                if (entity == null)
                {
                    throw new InvalidOperationException("Absolute query did not return an entity");
                }

                var queryString = Uri.UnescapeDataString(uri.Query.TrimStart('?'));
                if (string.IsNullOrWhiteSpace(queryString))
                {
                    queryString = "$";
                }
                parsedQuery = QueryLanguage.Query.Parse(this, queryString);
            }
            else
            {
                if (_value == null)
                {
                    throw new InvalidOperationException("Cannot run a relative query on a null entity");
                }

                entity = this;
                parsedQuery = QueryLanguage.Query.Parse(this, query);
            }

            return await Evaluate(entity, parsedQuery);
        }

        public async Task<Entity> GetE(string query) => (await Evaluate(query)).FirstOrDefault();

        public async Task<bool> GetB(string query) => (await GetE(query)).Value<bool>();

        public Task<IEnumerable<Entity>> Get(string query) => Evaluate(query);

        public async Task<string> GetS(string query) => (await GetE(query)).Value<string>();

        public async Task<int> GetI(string query) => (await GetE(query)).Value<int>();

        public override string ToString() => $"Query: {Query} Data: {_value}";

        private static async Task<IEnumerable<Entity>> Evaluate(Entity rootEntity, Query query)
        {
            IEnumerable<Entity> current = new[] { rootEntity };

            for (var i = 0; i < query.Selectors.Count; i++)
            {
                var selector = query.Selectors[i];

                var next = new List<Entity>();
                foreach (var entity in current)
                {
                    await foreach (var child in selector.Process(entity))
                    {
                        var hadReference = false;
                        if (i == query.Selectors.Count - 1 || query.Selectors[i + 1] is not RefSelector)
                        {
                            await foreach (var referenceChild in child.Document.ProcessReference())
                            {
                                referenceChild.Query = referenceChild.Query.Replace("$", child.Query);
                                next.Add(referenceChild);
                                hadReference = true;
                            }
                        }

                        if (!hadReference)
                        {
                            next.Add(child);
                        }
                    }
                }

                current = next;
            }

            return current;
        }

        public bool Equals(Entity other) => _value?.Equals(other?.Document) ?? false;

        public override bool Equals(object obj) => Equals(obj as Entity);

        public override int GetHashCode() => _value?.GetHashCode() ?? base.GetHashCode();
    }
}
