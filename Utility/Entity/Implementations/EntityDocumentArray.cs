using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Utility.Entity.Implementations
{
    public abstract class EntityDocumentArray : EntityDocument
    {
        public override EntityValueType ValueType => EntityValueType.Array;

        public static EntityDocumentArray Create(IEnumerable array, string query = null)
        {
            var enumerableType = array.GetType().GetInterfaces().FirstOrDefault(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IEnumerable<>));

            var genericType = enumerableType.GetGenericArguments().Single();

            var constructor = typeof(EntityDocumentArray<>).MakeGenericType(genericType).GetConstructor(new[] { enumerableType, typeof(string) });

            return (EntityDocumentArray)constructor.Invoke(new object[] { array });
        }
    }

    public class EntityDocumentArray<T> : EntityDocumentArray
    {
        private readonly IEnumerable<T> _array;

        public override int Length => _array.Count();

        public EntityDocumentArray(IEnumerable<T> array, string query)
        {
            _array = array;
            Query = query;
        }

        public override EntityDocument Clone(string query) => new EntityDocumentArray<T>(_array, query);

        protected override IEnumerable<EntityDocument> EnumerateArrayCore() => _array.Select(item => MapValue(item));

        protected override IEnumerable<(string name, EntityDocument value)> EnumerateObjectCore() => throw new NotImplementedException();

        protected override bool TryGetPropertyCore(string name, out EntityDocument propertyEntityDocument) => throw new NotImplementedException();

        public override TOut Value<TOut>() => (TOut)_array;

        public override string ToString() => _array?.ToString();
    }
}
