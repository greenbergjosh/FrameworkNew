using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Utility.Entity.Implementations;
using Utility.Entity.QueryLanguage;
using Utility.Entity.QueryLanguage.Selectors;
using Utility.Evaluatable;

namespace Utility.Entity
{
    #region Delegates

    public delegate Task<EntityDocument> EntityParser(Entity baseEntity, string contentType, string content);

    public delegate Task<(IEnumerable<Entity> entities, string query)> EntityRetriever(Entity baseEntity, Uri uri);

    public delegate IAsyncEnumerable<Entity> FunctionHandler(IEnumerable<Entity> entities, string functionName, IReadOnlyList<Entity> functionArguments, string query);

    public delegate Task<EntityDocument> MissingPropertyHandler(Entity entity, string propertyName);

    public delegate bool TryParser<T>(string input, out T result) where T : struct;

    #endregion

    [JsonConverter(typeof(EntityConverter))]
    public class Entity : IEquatable<Entity>
    {
        #region Fields

        private readonly EntityConfig _config;

        #endregion

        #region Constructors

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

        #endregion

        #region Properties

        public static Entity Undefined { get; } = new Entity(EntityDocumentConstant.Undefined, null, new EntityConfig(null), null);

        public bool IsEvaluatable => Document?.IsEvaluatable ?? false;

        public bool IsArray => Document?.IsArray ?? false;

        public bool IsObject => Document?.IsObject ?? false;

        public string Query { get; internal set; }

        public Entity Root { get; init; }

        public EntityValueType ValueType => Document?.ValueType ?? EntityValueType.Undefined;

        internal EntityDocument Document { get; }

        internal FunctionHandler FunctionHandler => _config.FunctionHandler;

        internal Evaluator Evaluator => _config.Evaluator;

        internal MissingPropertyHandler MissingPropertyHandler => _config.MissingPropertyHandler;

        #endregion

        #region Methods

        public static Entity Initialize(EntityConfig config) => new(config);

        public Entity Clone(string query = "@") => Create(Document, query);

        public Entity Create<T>(T value, string query = "$") => new(EntityDocument.MapValue(value), this, _config, query);

        public bool Equals(Entity other) => Document?.Equals(other?.Document) ?? false;

        public override bool Equals(object obj) => Equals(obj as Entity);

        public async Task<T> Eval<T>(string query = "@") => (await EvalE(query)).Value<T>();

        public Task<IEnumerable<Entity>> Eval(string query = "@") => Evaluate(query);

        public Task<T> Eval<T>(string query = "@", T defaultValue = default) => GetWithDefault(query, defaultValue);

        public async Task<string> EvalAsS(string query = "@", string defaultValue = null)
        {
            var result = await EvalE(query);
            return result?.ValueType == EntityValueType.String ? result.Value<string>() : result?.ToString() ?? defaultValue;
        }

        public Task<bool> EvalB(string query = "@") => Eval<bool>(query);

        public Task<bool> EvalB(string query = "@", bool defaultValue = false) => GetWithDefault(query, defaultValue);

        public Task<Dictionary<string, Entity>> EvalD(string query = "@") => EvalD<Entity>(query);

        public async Task<Dictionary<string, TValue>> EvalD<TValue>(string query = "@", bool throwIfMissing = true)
        {
            var entity = (await Evaluate(query)).SingleOrDefault();
            if (entity is null && !throwIfMissing)
            {
                return new Dictionary<string, TValue>();
            }

            return new Dictionary<string, TValue>(entity.Document.EnumerateObject().Select(item => new KeyValuePair<string, TValue>(item.name, item.value.Value<TValue>())));
        }

        public async Task<DateTime> EvalDateTime(string query = "@") => DateTime.Parse(await Eval<string>(query));

        public Task<DateTime?> EvalDateTime(string query = "@", DateTime? defaultValue = null) => ParseWithDefault(query, DateTime.TryParse, defaultValue);

        public async Task<Entity> EvalE(string query = "@") => (await Evaluate(query)).Single();

        public async Task<Entity> EvalE(string query = "@", Entity defaultValue = null) => (await Evaluate(query)).FirstOrDefault() ?? defaultValue;

        public Task<float> EvalF(string query = "@") => Eval<float>(query);

        public Task<float> EvalF(string query = "@", float defaultValue = 0) => GetWithDefault(query, defaultValue);

        public async Task<Guid> EvalGuid(string query = "@") => Guid.Parse(await Eval<string>(query));

        public Task<Guid?> EvalGuid(string query = "@", Guid? defaultValue = null) => ParseWithDefault(query, Guid.TryParse, defaultValue);

        public Task<int> EvalI(string query = "@") => Eval<int>(query);

        public Task<int> EvalI(string query = "@", int defaultValue = 0) => GetWithDefault(query, defaultValue);

        public Task<long> EvalLong(string query = "@") => Eval<long>(query);

        public Task<long> EvalLong(string query = "@", long defaultValue = 0) => GetWithDefault(query, defaultValue);

        public Task<IEnumerable<Entity>> EvalL(string query = "@") => Eval($"{query}.*");

        public async Task<IEnumerable<T>> EvalL<T>(string query = "@") => (await EvalL(query)).Select(entity => entity.Value<T>());

        public Task<string> EvalS(string query = "@") => Eval<string>(query);

        public Task<string> EvalS(string query = "@", string defaultValue = null) => GetWithDefault(query, defaultValue);

        public override int GetHashCode() => Document?.GetHashCode() ?? base.GetHashCode();

        public async Task<Entity> Parse(string contentType, string content)
        {
            if (_config.Parser == null)
            {
                throw new InvalidOperationException("No parser was provided when initializing Entity");
            }

            var entityDocument = await _config.Parser(this, contentType, content);

            return new Entity(entityDocument, null, _config, "$");
        }

        public override string ToString() => Document?.ToString();

        public async Task<(bool found, string value)> TryEvalS(string query = "@")
        {
            var result = (await Eval(query)).FirstOrDefault();
            return result != null && result.ValueType == EntityValueType.String ? (true, result.Value<string>()) : (false, default);
        }

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

        public T Value<T>() => Document is null ? default : typeof(T) == typeof(Entity) ? (T)(object)Create(Document) : Document.Value<T>();

        internal Task<IEnumerable<Entity>> Eval(Query query) => Evaluate(new[] { this }, query);

        private static async Task<IEnumerable<Entity>> Evaluate(IEnumerable<Entity> rootEntities, Query query)
        {
            var current = rootEntities;

            for (var i = 0; i < query.Selectors.Count && current.Any(); i++)
            {
                var selector = query.Selectors[i];

                var next = new List<Entity>();
                await foreach (var child in selector.Process(current))
                {
                    var processReference = i == query.Selectors.Count - 1 || query.Selectors[i + 1] is not RefSelector;

                    await foreach (var handledChild in HandleChild(child, processReference))
                    {
                        next.Add(handledChild);
                    }
                }

                current = next;
            }

            return current;

            static async IAsyncEnumerable<Entity> HandleChild(Entity child, bool processReference)
            {
                var hadReference = false;
                if (processReference)
                {
                    await foreach (var referenceChild in child.Document.ProcessReference())
                    {
                        hadReference = true;
                        referenceChild.Query = referenceChild.Query.Replace("$", child.Query);
                        await foreach (var handledChild in HandleChild(referenceChild, processReference))
                        {
                            yield return handledChild;
                        }
                    }

                    if (hadReference)
                    {
                        yield break;
                    }
                }

                var wasEvaluatable = false;
                await foreach (var evaluatableChild in child.Document.ProcessEvaluatable())
                {
                    wasEvaluatable = true;
                    evaluatableChild.Query = evaluatableChild.Query.Replace("$", child.Query);
                    await foreach (var handledChild in HandleChild(evaluatableChild, processReference))
                    {
                        yield return handledChild;
                    }
                }

                if (wasEvaluatable)
                {
                    yield break;
                }

                yield return child;
            }
        }

        private async Task<IEnumerable<Entity>> Evaluate(string query)
        {
            IEnumerable<Entity> entities;
            Query parsedQuery;

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

        private async Task<T> GetWithDefault<T>(string query, T defaultValue = default)
        {
            var result = (await Eval(query)).ToList();
            return result.Count == 1 ? result[0].Value<T>() : defaultValue;
        }

        private async Task<T?> ParseWithDefault<T>(string query, TryParser<T> parser, T? defaultValue) where T : struct
        {
            var value = await Eval<string>(query, null);
            if (value != null)
            {
                if (parser(value, out var result))
                {
                    return result;
                }
            }

            return defaultValue;
        }

        internal Task<Entity> Evaluate() => Document?.Evaluate();

        #endregion
    }

    public class EntityConverter : JsonConverter<Entity>
    {
        #region Methods

        public override Entity Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) => throw new NotImplementedException();

        public override void Write(Utf8JsonWriter writer, Entity value, JsonSerializerOptions options) => value.Document?.SerializeToJson(writer, options);

        #endregion
    }

    public record EntityConfig(EntityParser Parser = null, EntityRetriever Retriever = null, Evaluator Evaluator = null, MissingPropertyHandler MissingPropertyHandler = null, FunctionHandler FunctionHandler = null);
}
