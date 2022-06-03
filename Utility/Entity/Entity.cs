using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Utility.Entity.Implementations;
using Utility.Entity.QueryLanguage;
using Utility.Evaluatable;

namespace Utility.Entity
{
    #region Delegates
    public delegate Task<EntityDocument> EntityParser(Entity baseEntity, string contentType, string content);

    public delegate Task<(IEnumerable<Entity> entities, string query)> EntityRetriever(Entity baseEntity, Uri uri);

    public delegate IAsyncEnumerable<Entity> FunctionHandler(IAsyncEnumerable<Entity> entities, string functionName, IReadOnlyList<Entity> functionArguments, string query, Entity evaluationParameters);

    public delegate Task<EntityDocument> MissingPropertyHandler(Entity entity, string propertyName);

    public delegate bool TryParser<T>(string input, out T result) where T : struct;
    #endregion

    [JsonConverter(typeof(EntityConverter))]
    public class Entity : IEquatable<Entity>, IReadOnlyEntity
    {
        #region Fields
        private readonly IEntityConfig _config;
        #endregion

        #region Constructors
        private Entity(IEntityConfig config) => _config = config ?? throw new ArgumentNullException(nameof(config));

        protected Entity(EntityDocument value, Entity root, IEntityConfig config, string query)
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

        public static Entity Unhandled { get; } = new Entity(EntityDocumentConstant.Unhandled, null, new EntityConfig(null), null);

        public bool IsArray => Document?.IsArray ?? false;

        public bool IsObject => Document?.IsObject ?? false;

        public string Query { get; internal set; }

        public Entity Root { get; init; }

        public EntityValueType ValueType => Document?.ValueType ?? EntityValueType.Undefined;

        internal EntityDocument Document { get; }

        internal Evaluator Evaluator => _config?.Evaluator;

        internal FunctionHandler FunctionHandler => _config?.FunctionHandler;

        internal MissingPropertyHandler MissingPropertyHandler => _config?.MissingPropertyHandler;

        internal EntityRetriever Retriever => _config?.Retriever;
        #endregion

        #region Methods
        public static Entity Initialize(IEntityConfig config) => new(config);

        public IReadOnlyEntity AsReadOnly() => this;

        public Entity Clone(string query) => Create(Document, query, Root);

        public Entity Create<T>(T value, string query = "$") => new(EntityDocument.MapValue(value), null, _config, query);

        internal Entity Create<T>(T value, string query, Entity root) => new(EntityDocument.MapValue(value), root, _config, query);

        public bool Equals(Entity other) => Document?.Equals(other?.Document) ?? false;

        public override bool Equals(object obj) => Equals(obj as Entity);

        public async Task<T> Eval<T>(string query, Entity evaluationParameters = null) => (await EvalE(query, evaluationParameters)).Value<T>();

        public IAsyncEnumerable<Entity> Eval(string query, Entity evaluationParameters = null) => Evaluate(query, evaluationParameters);

        public async Task EvalVoid(string query, Entity evaluationParameters = null)
        {
            await foreach (var _ in Evaluate(query, evaluationParameters))
            {
            }
        }

        public Task<T> Eval<T>(string query, T defaultValue, Entity evaluationParameters = null) => GetWithDefault(query, evaluationParameters, defaultValue);

        public async Task<string> EvalAsS(string query, string defaultValue = null, Entity evaluationParameters = null)
        {
            var result = await EvalE(query, evaluationParameters, null);
            return result?.ValueType == EntityValueType.String ? result.Value<string>() : result?.ToString() ?? defaultValue;
        }

        public Task<bool> EvalB(string query, bool defaultValue, Entity evaluationParameters = null) => GetWithDefault(query, evaluationParameters, defaultValue);

        public Task<bool> EvalB(string query, Entity evaluationParameters = null) => Eval<bool>(query, evaluationParameters);

        public Task<Dictionary<string, Entity>> EvalD(string query, Entity evaluationParameters = null, bool throwIfMissing = true) => EvalD<Entity>(query, evaluationParameters, throwIfMissing);

        public async Task<Dictionary<string, TValue>> EvalD<TValue>(string query, Entity evaluationParameters = null, bool throwIfMissing = true)
        {
            var entity = await Eval(query, evaluationParameters).SingleOrDefault();

            if (entity == null && !throwIfMissing)
            {
                return new Dictionary<string, TValue>();
            }

            return new Dictionary<string, TValue>(await entity.Document.EnumerateObject().Select(item => new KeyValuePair<string, TValue>(item.name, item.value.Value<TValue>())).ToList());
        }

        public Task<DateTime?> EvalDateTime(string query, DateTime? defaultValue, Entity evaluationParameters = null) => ParseWithDefault(query, evaluationParameters, DateTime.TryParse, defaultValue);

        public async Task<DateTime> EvalDateTime(string query, Entity evaluationParameters = null) => DateTime.Parse(await Eval<string>(query, evaluationParameters));

        public Task<Entity> EvalE(string query, Entity defaultValue, Entity evaluationParameters = null) => Evaluate(query, evaluationParameters).FirstOrDefault(defaultValue);

        public Task<Entity> EvalE(string query, Entity evaluationParameters = null) => Evaluate(query, evaluationParameters).Single();

        public Task<float> EvalF(string query, Entity evaluationParameters = null) => Eval<float>(query, evaluationParameters);

        public Task<float> EvalF(string query, float defaultValue, Entity evaluationParameters = null) => GetWithDefault(query, evaluationParameters, defaultValue);

        public async Task<Guid> EvalGuid(string query, Entity evaluationParameters = null) => Guid.Parse(await Eval<string>(query, evaluationParameters));

        public Task<Guid?> EvalGuid(string query, Guid? defaultValue, Entity evaluationParameters = null) => ParseWithDefault(query, evaluationParameters, Guid.TryParse, defaultValue);

        public Task<int> EvalI(string query, Entity evaluationParameters = null) => Eval<int>(query, evaluationParameters);

        public Task<int> EvalI(string query, int defaultValue, Entity evaluationParameters = null) => GetWithDefault(query, evaluationParameters, defaultValue);

        public IAsyncEnumerable<Entity> EvalL(string query, Entity evaluationParameters = null) => Eval($"{query}.*", evaluationParameters);

        public IAsyncEnumerable<T> EvalL<T>(string query, Entity evaluationParameters = null) => EvalL(query, evaluationParameters).Select(child => child.Value<T>());

        public Task<long> EvalLong(string query, Entity evaluationParameters = null) => Eval<long>(query, evaluationParameters);

        public Task<long> EvalLong(string query, long defaultValue, Entity evaluationParameters = null) => GetWithDefault(query, evaluationParameters, defaultValue);

        public Task<string> EvalS(string query, Entity evaluationParameters = null) => Eval<string>(query, evaluationParameters);

        public Task<string> EvalS(string query, string defaultValue, Entity evaluationParameters = null) => GetWithDefault(query, evaluationParameters, defaultValue);

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

        public async Task<(bool found, string value)> TryEvalS(string query, Entity evaluationParameters = null)
        {
            var result = await Eval(query, evaluationParameters).FirstOrDefault();
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

        public Entity Wrap(IEntityConfig config) => new(new EntityConfigSchemeWrapper(_config, config));

        internal async IAsyncEnumerable<Entity> Evaluate(Query query, Entity parameters)
        {
            if (Evaluator is null && Document is EntityDocumentConstant)
            {
                if (query.IsLocal)
                {
                    yield return this;
                }

                yield break;
            }
            else
            {
                await foreach (var item in Evaluator.Evaluate(Create(query), Create(new { target = this, parameters }, "$", null)))
                {
                    yield return item;
                }
            }
        }

        private IAsyncEnumerable<Entity> Evaluate(string query, Entity parameters) => Evaluate(new Query(query), parameters);

        private async Task<T> GetWithDefault<T>(string query, Entity evaluationParameters, T defaultValue)
        {
            var result = await Eval(query, evaluationParameters).SingleOrDefault();

            return result == null ? defaultValue : result.Value<T>();
        }

        private async Task<T?> ParseWithDefault<T>(string query, Entity evaluationParameters, TryParser<T> parser, T? defaultValue) where T : struct
        {
            var value = await Eval<string>(query, null, evaluationParameters);

            if (value != null)
            {
                if (parser(value, out var result))
                {
                    return result;
                }
            }

            return defaultValue;
        }
        #endregion

        #region Operators
        public static implicit operator Entity(bool value) => new(EntityDocument.MapValue(value), null, null, null);
        public static implicit operator Entity(decimal value) => new(EntityDocument.MapValue(value), null, null, null);
        public static implicit operator Entity(float value) => new(EntityDocument.MapValue(value), null, null, null);
        public static implicit operator Entity(int value) => new(EntityDocument.MapValue(value), null, null, null);
        public static implicit operator Entity(long value) => new(EntityDocument.MapValue(value), null, null, null);
        public static implicit operator Entity(string value) => new(EntityDocument.MapValue(value), null, null, null);
        public static implicit operator Entity(Guid value) => new(EntityDocument.MapValue(value), null, null, null);
        public static implicit operator Entity(EntityDocument value) => new(value, value?.Entity?.Root, value?.Entity?._config, value?.Entity.Query);
        #endregion
    }
}
