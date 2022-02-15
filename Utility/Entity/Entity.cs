using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Utility.Entity.Implementations;
using Utility.Entity.QueryLanguage;
using Utility.Entity.QueryLanguage.Selectors;

namespace Utility.Entity
{
    public delegate Task<EntityDocument> EntityParser(Entity baseEntity, string contentType, string content);
    public delegate Task<(IEnumerable<Entity> entities, string query)> EntityRetriever(Entity baseEntity, Uri uri);
    public delegate Task<EntityDocument> MissingPropertyHandler(Entity entity, string propertyName);
    public delegate IAsyncEnumerable<Entity> FunctionHandler(IEnumerable<Entity> entities, string functionName, IReadOnlyList<Entity> functionArguments, string query);
    public delegate bool TryParser<T>(string input, out T result) where T : struct;

    public record EntityConfig(EntityParser Parser, EntityRetriever Retriever = null, MissingPropertyHandler MissingPropertyHandler = null, FunctionHandler FunctionHandler = null);

    public class EntityConverter : JsonConverter<Entity>
    {
        public override Entity Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) => throw new NotImplementedException();
        public override void Write(Utf8JsonWriter writer, Entity value, JsonSerializerOptions options) => value.Document?.SerializeToJson(writer, options);
    }

    [JsonConverter(typeof(EntityConverter))]
    public class Entity : IEquatable<Entity>
    {
        private readonly EntityConfig _config;

        public string Query { get; internal set; }

        public Entity Root { get; init; }

        internal EntityDocument Document { get; }

        internal MissingPropertyHandler MissingPropertyHandler => _config.MissingPropertyHandler;

        internal FunctionHandler FunctionHandler => _config.FunctionHandler;

        public EntityValueType ValueType => Document?.ValueType ?? EntityValueType.Undefined;

        public bool IsArray => Document?.IsArray ?? false;

        public bool IsObject => Document?.IsObject ?? false;

        public static Entity Undefined { get; } = new Entity(EntityDocumentConstant.Undefined, null, new EntityConfig(null), null);

        private Entity(EntityConfig config) => _config = config ?? throw new ArgumentNullException(nameof(config));

        private Entity(EntityDocument value, Entity root, EntityConfig config, string query)
        {
            if (value != null)
            {
                Document = value;
                Document.Entity = this;
            }
            else
            {
                Document = EntityDocumentConstant.Null;
            }

            _config = config;

            Root = root?.Root ?? this;
            Query = query;
        }

        public static Entity Initialize(EntityConfig config) => new(config);

        public Entity Create<T>(T value, string query = "$") => new(EntityDocument.MapValue(value), this, _config, query);

        public Entity Clone(string query = "@") => Create(Document, query);

        public async Task<Entity> Parse(string contentType, string content)
        {
            var entityDocument = await _config.Parser(this, contentType, content);

            return new Entity(entityDocument, null, _config, "$");
        }

        public async Task<(bool success, Entity entity)> TryParse(string contentType, string content)
        {
            try
            {
                return (true, await Parse(contentType, content));
            }
            catch
            {
                return (false, null);
            }
        }

        internal Task<IEnumerable<Entity>> Get(Query query) => Evaluate(new[] { this }, query);

        public async Task<T> Get<T>(string query = "@") => (await Evaluate(query)).Single().Value<T>();

        public async Task<Entity> GetE(string query = "@") => (await Evaluate(query)).SingleOrDefault();

        public async Task<bool> GetB(string query = "@") => (await GetE(query)).Value<bool>();

        public Task<bool> GetB(string query = "@", bool defaultValue = false) => GetWithDefault(query, EntityValueType.Boolean, defaultValue);

        public Task<IEnumerable<Entity>> Get(string query = "@") => Evaluate(query);

        public async Task<string> GetS(string query = "@") => (await GetE(query)).Value<string>();

        public async Task<string> GetAsS(string query = "@", string defaultValue = null)
        {
            var result = await GetE(query);
            return result?.ValueType == EntityValueType.String ? result.Value<string>() : result?.ToString() ?? defaultValue;
        }

        public Task<string> GetS(string query = "@", string defaultValue = null) => GetWithDefault(query, EntityValueType.String, defaultValue);

        public async Task<(bool found, string value)> TryGetS(string query = "@")
        {
            var result = (await Get(query)).FirstOrDefault();
            return result != null && result.ValueType == EntityValueType.String ? (true, result.Value<string>()) : ((bool found, string value))(false, default);
        }

        public Task<IEnumerable<Entity>> GetL(string query = "@") => Get($"{query}.*");

        public async Task<IEnumerable<T>> GetL<T>(string query = "@") => (await Get($"{query}.*")).Select(entity => entity.Value<T>());

        public async Task<int> GetI(string query = "@") => (await GetE(query)).Value<int>();

        public async Task<float> GetF(string query = "@") => (await GetE(query)).Value<float>();

        public Task<int> GetI(string query = "@", int defaultValue = 0) => GetWithDefault(query, EntityValueType.Number, defaultValue);

        public async Task<Guid> GetGuid(string query) => Guid.Parse(await GetS(query));

        public Task<Guid?> GetGuid(string query, Guid? defaultValue) => ParseWithDefault(query, Guid.TryParse, defaultValue);

        public Task<Dictionary<string, Entity>> GetD(string query = "@", bool throwIfMissing = true) => GetD<Entity>(query, throwIfMissing);

        public async Task<Dictionary<string, TValue>> GetD<TValue>(string query = "@", bool throwIfMissing = true)
        {
            var entity = (await Get(query)).SingleOrDefault();

            if (entity == null && !throwIfMissing)
            {
                return new Dictionary<string, TValue>();
            }

            return new Dictionary<string, TValue>(entity.Document.EnumerateObject().Select(item => new KeyValuePair<string, TValue>(item.name, item.value.Value<TValue>())));
        }

        private async Task<T> GetWithDefault<T>(string query, EntityValueType expectedValueType, T defaultValue = default)
        {
            var result = (await Get(query)).ToList();
            return result.Count == 1 && result[0].ValueType == expectedValueType ? result[0].Value<T>() : defaultValue;
        }

        private async Task<T?> ParseWithDefault<T>(string query, TryParser<T> parser, T? defaultValue) where T : struct
        {
            var value = await GetS(query, null);

            if (value != null)
            {
                if (parser(value, out var result))
                {
                    return result;
                }
            }

            return defaultValue;
        }

        public T Value<T>() => Document is null ? default : typeof(T) == typeof(Entity) ? (T)(object)Create(Document) : Document.Value<T>();

        public bool TryGetValue<T>(out T value)
        {
            if (Document is null)
            {
                value = default;
                return false;
            }

            try
            {
                value = Document.Value<T>();
                return true;
            }
            catch (InvalidCastException)
            {
                value = default;
                return false;
            }
        }

        public override string ToString() => Document?.ToString();

        private async Task<IEnumerable<Entity>> Evaluate(string query)
        {
            IEnumerable<Entity> entities;
            Query parsedQuery;

            if (string.IsNullOrWhiteSpace(query))
            {
                query = "@";
            }

            if (Uri.TryCreate(query, UriKind.Absolute, out var uri))
            {
                if (_config.Retriever is null)
                {
                    throw new InvalidOperationException($"Absolute queries are not allowed unless a retriever has been provided.");
                }

                var result = await _config.Retriever(this, uri);
                entities = result.entities;

                if (entities is null || !entities.Any())
                {
                    throw new InvalidOperationException("Absolute query did not return an entity");
                }

                parsedQuery = QueryLanguage.Query.Parse(this, string.IsNullOrWhiteSpace(result.query) ? "@" : result.query);
            }
            else
            {
                if (Document is null)
                {
                    throw new InvalidOperationException("Cannot run a relative query on a null entity");
                }

                entities = new[] { this };
                parsedQuery = QueryLanguage.Query.Parse(this, query);
            }

            return await Evaluate(entities, parsedQuery);
        }

        private static async Task<IEnumerable<Entity>> Evaluate(IEnumerable<Entity> rootEntities, Query query)
        {
            var current = rootEntities;

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

                    var hadEvaluatable = false;
                    await foreach (var evaluatableChild in child.Document.ProcessEvaluatable())
                    {
                        evaluatableChild.Query = evaluatableChild.Query.Replace("$", child.Query);
                        next.Add(evaluatableChild);
                        hadEvaluatable = true;
                    }

                    if (!hadReference && !hadEvaluatable)
                    {
                        next.Add(child);
                    }
                }

                current = next;
            }

            return current;
        }

        public bool Equals(Entity other) => Document?.Equals(other?.Document) ?? false;

        public override bool Equals(object obj) => Equals(obj as Entity);

        public override int GetHashCode() => Document?.GetHashCode() ?? base.GetHashCode();
    }
}
