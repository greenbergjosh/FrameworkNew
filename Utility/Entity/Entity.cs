using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.Entity.Implementations;
using Utility.Entity.QueryLanguage;
using Utility.Entity.QueryLanguage.Selectors;

namespace Utility.Entity
{
    public delegate Task<EntityDocument> EntityParser(Entity baseEntity, string contentType, string content);
    public delegate Task<(Entity entity, string query)> EntityRetriever(Entity baseEntity, Uri uri);
    public delegate Task<EntityDocument> MissingPropertyHandler(Entity entity, string propertyName);
    public delegate IAsyncEnumerable<Entity> FunctionHandler(IEnumerable<Entity> entities, string functionName, IReadOnlyList<Entity> functionArguments, string query);

    public record EntityConfig(EntityParser Parser, EntityRetriever Retriever = null, MissingPropertyHandler MissingPropertyHandler = null, FunctionHandler FunctionHandler = null);

    public class Entity : IEquatable<Entity>
    {
        private readonly EntityConfig _config;
        private readonly EntityDocument _value;

        public string Query { get; internal set; }

        public Entity Root { get; init; }

        internal EntityDocument Document => _value;

        internal MissingPropertyHandler MissingPropertyHandler => _config.MissingPropertyHandler;

        internal FunctionHandler FunctionHandler => _config.FunctionHandler;

        public EntityValueType ValueType => _value?.ValueType ?? EntityValueType.Undefined;

        public static Entity Undefined { get; } = new Entity(EntityDocumentConstant.Undefined, null, new EntityConfig(null), null);

        private Entity(EntityConfig config) => _config = config ?? throw new ArgumentNullException(nameof(config));

        private Entity(EntityDocument value, Entity root, EntityConfig config, string query)
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

            _config = config;

            Root = root?.Root ?? this;
            Query = query;
        }

        public static Entity Initialize(EntityConfig config) => new(config);

        public Entity Create<T>(T value, string query = "$") => new(EntityDocument.MapValue(value), this, _config, query);

        public Entity Clone(string query) => Create(Document, query);

        public async Task<Entity> Parse(string contentType, string content)
        {
            var entityDocument = await _config.Parser(this, contentType, content);

            return new Entity(entityDocument, null, _config, "$");
        }

        internal Task<IEnumerable<Entity>> Evaluate(Query query) => Evaluate(this, query);

        public async Task<IEnumerable<Entity>> Evaluate(string query)
        {
            Entity entity;
            Query parsedQuery;

            if (Uri.TryCreate(query, UriKind.Absolute, out var uri))
            {
                if (_config.Retriever == null)
                {
                    throw new InvalidOperationException($"Absolute queries are not allowed unless a retriever has been provided.");
                }

                var result = await _config.Retriever(this, uri);
                entity = result.entity;

                if (entity == null)
                {
                    throw new InvalidOperationException("Absolute query did not return an entity");
                }

                parsedQuery = QueryLanguage.Query.Parse(this, string.IsNullOrWhiteSpace(result.query) ? "@" : result.query);
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

        public T Value<T>() => _value == null ? default : _value.Value<T>();

        public override string ToString() => $"Query: {Query} Data: {_value}";

        private static async Task<IEnumerable<Entity>> Evaluate(Entity rootEntity, Query query)
        {
            IEnumerable<Entity> current = new[] { rootEntity };

            for (var i = 0; i < query.Selectors.Count && current.Any(); i++)
            {
                var selector = query.Selectors[i];

                var next = new List<Entity>();
                await foreach (var child in selector.Process(current))
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

                current = next;
            }

            return current;
        }

        public bool Equals(Entity other) => _value?.Equals(other?.Document) ?? false;

        public override bool Equals(object obj) => Equals(obj as Entity);

        public override int GetHashCode() => _value?.GetHashCode() ?? base.GetHashCode();
    }
}
