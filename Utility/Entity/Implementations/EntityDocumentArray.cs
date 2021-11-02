using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Utility.Entity.Implementations
{
    public abstract class EntityDocumentArray : EntityDocument
    {
        public override EntityValueType ValueType => EntityValueType.Array;

        public static EntityDocumentArray Create(IEnumerable array)
        {
            var enumerableType = array.GetType().GetInterfaces().FirstOrDefault(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IEnumerable<>));

            var genericType = enumerableType.GetGenericArguments().Single();

            var constructor = typeof(EntityDocumentArray<>).MakeGenericType(genericType).GetConstructor(new[] { enumerableType });

            return (EntityDocumentArray)constructor.Invoke(new object[] { array });
        }
    }

    internal sealed class EntityDocumentArray<T> : EntityDocumentArray
    {
        private readonly IEnumerable<T> _array;

        public override int Length => _array.Count();

        public EntityDocumentArray(IEnumerable<T> array) => _array = array;

        protected internal override IEnumerable<EntityDocument> EnumerateArrayCore() => _array.Select(item => MapValue(item));

        protected internal override IEnumerable<(string name, EntityDocument value)> EnumerateObjectCore() => throw new NotImplementedException();

        protected internal override bool TryGetPropertyCore(string name, out EntityDocument propertyEntityDocument) => throw new NotImplementedException();

        public override TOut Value<TOut>() => (TOut)_array;

        public override string ToString() => _array?.ToString();

        public override int GetHashCode() => _array?.GetHashCode() ?? base.GetHashCode();
    }
}
