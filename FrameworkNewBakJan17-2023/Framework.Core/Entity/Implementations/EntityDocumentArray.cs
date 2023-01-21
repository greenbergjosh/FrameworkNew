using System.Collections;
using System.Text.Json;

namespace Framework.Core.Entity.Implementations
{
    public abstract class EntityDocumentArray : EntityDocument
    {
        public override EntityValueType ValueType => EntityValueType.Array;

        public static EntityDocumentArray Create(IEnumerable array, IEntityEvalHandler? evalHandler)
        {
            var enumerableType = array.GetType().GetInterfaces().First(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IEnumerable<>));

            var genericType = enumerableType.GetGenericArguments().Single();

            var constructor = typeof(EntityDocumentArray<>).MakeGenericType(genericType).GetConstructor(new[] { enumerableType, typeof(IEntityEvalHandler) });

            return (EntityDocumentArray)constructor!.Invoke(new object?[] { array, evalHandler });
        }
    }

    internal sealed class EntityDocumentArray<T> : EntityDocumentArray
    {
        private readonly IEnumerable<T> _array;

        public override int Length => _array.Count();

        public EntityDocumentArray(IEnumerable<T> array, IEntityEvalHandler? evalHandler)
        {
            _array = array;
            EvalHandler = evalHandler;
        }

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        protected internal override async IAsyncEnumerable<EntityDocument> EnumerateArrayCore()
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            foreach (var item in _array.Select(item => MapValue(item)))
            {
                yield return item;
            }
        }

        protected internal override IAsyncEnumerable<(string name, EntityDocument value)> EnumerateObjectCore() => throw new NotImplementedException();

        protected internal override Task<(bool found, EntityDocument propertyEntityDocument)> TryGetPropertyCore(string name) => throw new NotImplementedException();

        public override TOut Value<TOut>() => (TOut)_array;

        public override string ToString() => JsonSerializer.Serialize(_array);

        public override int GetHashCode() => _array?.GetHashCode() ?? base.GetHashCode();

        public override void SerializeToJson(Utf8JsonWriter writer, JsonSerializerOptions options)
        {
            writer.WriteStartArray();

            foreach (var item in _array)
            {
                JsonSerializer.Serialize(writer, item, options);
            }

            writer.WriteEndArray();
        }
    }
}
