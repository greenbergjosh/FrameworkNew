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

        public bool IsArray => _value?.IsArray ?? false;

        public bool IsObject => _value?.IsObject ?? false;

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
                if (_config.Retriever is null)
                {
                    throw new InvalidOperationException($"Absolute queries are not allowed unless a retriever has been provided.");
                }

                var result = await _config.Retriever(this, uri);
                entity = result.entity;

                if (entity is null)
                {
                    throw new InvalidOperationException("Absolute query did not return an entity");
                }

                parsedQuery = QueryLanguage.Query.Parse(this, string.IsNullOrWhiteSpace(result.query) ? "@" : result.query);
            }
            else
            {
                if (_value is null)
                {
                    throw new InvalidOperationException("Cannot run a relative query on a null entity");
                }

                entity = this;
                parsedQuery = QueryLanguage.Query.Parse(this, query);
            }

            return await Evaluate(entity, parsedQuery);
        }

        public async Task<Entity> GetE(string query) => (await Evaluate(query)).SingleOrDefault();

        public async Task<bool> GetB(string query) => (await GetE(query)).Value<bool>();

        public Task<bool> GetB(string query, bool defaultValue) => GetWithDefault(query, defaultValue);

        public Task<IEnumerable<Entity>> Get(string query) => Evaluate(query);

        public async Task<string> GetS(string query) => (await GetE(query)).Value<string>();

        public Task<string> GetS(string query, string defaultValue) => GetWithDefault(query, defaultValue);

        public async Task<(bool found, string value)> TryGetS(string query)
        {
            var result = (await Get(query)).FirstOrDefault();
            if (result != null && result.ValueType == EntityValueType.String)
            {
                return (true, result.Value<string>());
            }

            return (false, default);
        }

        public Task<IEnumerable<Entity>> GetL(string query) => Get($"{query}.*");

        public async Task<IEnumerable<T>> GetL<T>(string query) => (await Get($"{query}.*")).Select(entity => entity.Value<T>());

        public async Task<int> GetI(string query) => (await GetE(query)).Value<int>();

        public Task<int> GetI(string query, int defaultValue) => GetWithDefault(query, defaultValue);

        public Task<Dictionary<string, Entity>> GetD(string query) => GetD<Entity>(query);

        public async Task<Dictionary<string, TValue>> GetD<TValue>(string query)
        {
            var entity = await GetE(query);

            return new Dictionary<string, TValue>(entity.Document.EnumerateObject().Select(item => new KeyValuePair<string, TValue>(item.name, item.value.Value<TValue>())));
        }

        private async Task<T> GetWithDefault<T>(string query, T defaultValue)
        {
            var result = (await Get(query)).ToList();
            if (result.Count == 1)
            {
                return result[0].Value<T>();
            }
            else
            {
                return defaultValue;
            }
        }

        public T Value<T>() => _value is null ? default : typeof(T) == typeof(Entity) ? (T)(object)Create(_value) : _value.Value<T>();

        public bool TryGetValue<T>(out T value)
        {
            if (_value is null)
            {
                value = default;
                return false;
            }

            try
            {
                value = _value.Value<T>();
                return true;
            }
            catch (InvalidCastException)
            {
                value = default;
                return false;
            }
        }

        public override string ToString() => _value?.ToString();

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
