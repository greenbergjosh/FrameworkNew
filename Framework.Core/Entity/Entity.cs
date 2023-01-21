using Framework.Core.Entity.Implementations;
using Framework.Core.Evaluatable;
using System.Text.Json.Serialization;
using System.Dynamic;

// Change 1
// Change 2

// Values seem to get lifted three times, first into Document, then Entity, then Evaluatable
//  All of the lifting is invisible to the user of an Entity (which appears to be evaluatable) (and contains a document)
// Notice there is no enumeration here
// GetProperty is a form of evaluation
// GetValue is extracting the value from the Entity
namespace Framework.Core.Entity
{
    #region Delegates
    public delegate Task<EntityDocument> EntityParser(Entity baseEntity, string contentType, string content);

    public delegate Task<(IEnumerable<Entity> entities, string query)> EntityRetriever(Entity baseEntity, Uri uri);

    public delegate IAsyncEnumerable<Entity> FunctionHandler(IAsyncEnumerable<Entity> entities, string functionName, IReadOnlyList<Entity> functionArguments, string query, Entity evaluationParameters);

    public delegate Task<EntityDocument> MissingPropertyHandler(Entity entity, string propertyName);

    public delegate bool TryParser<T>(string input, out T result) where T : struct;
    #endregion

    [JsonConverter(typeof(EntityConverter))]
    public class Entity : DynamicObject, IEquatable<Entity>, IReadOnlyEntity
    {
        #region Fields
        private readonly IEntityConfig _config;
        private static readonly IEntityConfig _emptyConfig = new EntityConfig(null, null);
        #endregion

        #region Constructors
        private Entity(IEntityConfig config)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
            Root = this;
            Document = EntityDocumentConstant.Null;
        }

        protected Entity(EntityDocument value, Entity? root, IEntityConfig config, string? query)
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
        public static Entity Undefined { get; } = new Entity(EntityDocumentConstant.Undefined, null, _emptyConfig, null);

        public static Entity Unhandled { get; } = new Entity(EntityDocumentConstant.Unhandled, null, _emptyConfig, null);

        public bool CanEvaluate => _config.Evaluator != null;

        public bool IsArray => Document?.IsArray ?? false;

        public bool IsObject => Document?.IsObject ?? false;

        public string? Query { get; internal set; }

        internal Entity Root { get; init; }

        public EntityValueType ValueType => Document?.ValueType ?? EntityValueType.Undefined;

        public EntityDocument Document { get; }
        #endregion

        #region Methods
        public static Entity Initialize(IEntityConfig config) => new(config);

        public IReadOnlyEntity AsReadOnly() => this;

        public Entity Clone(string query) => Create(Document, query, Root);

        public Entity Create<T>(T value, string query = "$") => new(EntityDocument.MapValue(value, Document?.EvalHandler), null, _config, query);

        internal Entity Create<T>(T value, string? query, Entity root) => new(EntityDocument.MapValue(value, Document?.EvalHandler), root, _config, query);

        public async Task<EvaluateResponse> Evaluate(Entity parameters)
        {
            if (_config.Evaluator == null)
            {
                throw new InvalidOperationException("This entity has no evaluator");
            }

            if (Document.EvalHandler == null)
            {
                return new EvaluateResponse(true, this);
            }

            var (providerName, providerParameters) = await Document.EvalHandler.HandleEntity(this);

            return await _config.Evaluator.Evaluate(providerName, providerParameters, parameters);
        }

#pragma warning disable CS8610 // Nullability of reference types in type of parameter doesn't match overridden member.
        public override bool TryInvoke(InvokeBinder binder, object[] args, out object result)
#pragma warning restore CS8610 // Nullability of reference types in type of parameter doesn't match overridden member.
        {
            result = Evaluate(Create(args[0]));
            return true;
        }

        // Need to parse scheme://entityid
        // This goes no further than that, no query language support, just resolution
        // We are not evaluating an entity, just getting one
        // Adding support for getting using integer and using property name (from objects such as parameters)
        public Task<Entity> this[string index]
        {
            //get { return ResolveEntity(new System.Uri(index)); }
            get { return index.Contains("://") ? ResolveEntity(new System.Uri(index)) : this.GetRequiredProperty(index); }
        }

        public Task<Entity> ResolveEntity(Uri uri)
        {
            if (_config.EntityResolver == null)
            {
                return Task.FromResult(Entity.Undefined);
            }

            return _config.EntityResolver(this, uri);
        }

        public bool Equals(Entity? other) => Document.Equals(other?.Document);

        public override bool Equals(object? obj) => Equals(obj as Entity);

        public override int GetHashCode() => Document?.GetHashCode() ?? base.GetHashCode();

        public override string? ToString() => Document.ToString();

        public T? Value<T>() => typeof(T) == typeof(Entity) ? (T)(object)Create(Document) : Document.Value<T>();
        public bool TryGetValue<T>(out T? value)
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

        public Task<T> GetPropertyValue<T>(string propertyName) => GetPropertyValue<T>(propertyName, Entity.Undefined);

        public async Task<T> GetPropertyValue<T>(string propertyName, Entity parameters)
        {
            var valueEntity = await GetRequiredProperty(propertyName, parameters);

            var value = valueEntity.Value<T>();
            if (value == null)
            {
                throw new InvalidOperationException($"{propertyName} can not be null");
            }

            return value;
        }

        public async Task<(bool found, Entity value)> TryGetProperty(string propertyName, Entity parameters)
        {
            var (found, value) = await Document.TryGetProperty(propertyName);
            if (!found)
            {
                return (found, value);
            }

            var evaluatedValue = await value.Evaluate(parameters);

            return (true, evaluatedValue.Entity);
        }

        public Task<Entity> GetRequiredProperty(string propertyName) => GetRequiredProperty(propertyName, Entity.Undefined);

        public async Task<Entity> GetRequiredProperty(string propertyName, Entity parameters)
        {
            var (found, value) = await TryGetProperty(propertyName, parameters);
            if (!found)
            {
                throw new InvalidOperationException($"Expected property {propertyName}");
            }

            return value;
        }
        #endregion

        #region Operators
        public static implicit operator Entity(bool value) => new(EntityDocument.MapValue(value), null, _emptyConfig, null);
        public static implicit operator Entity(decimal value) => new(EntityDocument.MapValue(value), null, _emptyConfig, null);
        public static implicit operator Entity(float value) => new(EntityDocument.MapValue(value), null, _emptyConfig, null);
        public static implicit operator Entity(int value) => new(EntityDocument.MapValue(value), null, _emptyConfig, null);
        public static implicit operator Entity(long value) => new(EntityDocument.MapValue(value), null, _emptyConfig, null);
        public static implicit operator Entity(string value) => new(EntityDocument.MapValue(value), null, _emptyConfig, null);
        public static implicit operator Entity(Guid value) => new(EntityDocument.MapValue(value), null, _emptyConfig, null);
        public static implicit operator Entity(EntityDocument value) => new(value, value.Entity?.Root, value.Entity?._config ?? _emptyConfig, value?.Entity?.Query);
        #endregion
    }
}
