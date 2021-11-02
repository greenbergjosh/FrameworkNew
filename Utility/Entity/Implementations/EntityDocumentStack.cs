using System;
using System.Collections.Generic;
using System.Linq;

namespace Utility.Entity.Implementations
{
    public class EntityDocumentStack : EntityDocument
    {
        private readonly Stack<Entity> _entities = new();

        public void Push(Entity entity) => _entities.Push(entity);

        public Entity Pop() => _entities.Pop();

        public override EntityValueType ValueType => _entities.FirstOrDefault()?.ValueType ?? EntityValueType.Undefined;

        public override int Length => _entities.FirstOrDefault()?.Document.Length ?? throw new InvalidOperationException();

        public override T Value<T>() => _entities.Any() ? _entities.First().Document.Value<T>() : throw new InvalidOperationException();

        protected internal override IEnumerable<EntityDocument> EnumerateArrayCore() => _entities.FirstOrDefault()?.Document.EnumerateArrayCore() ?? throw new InvalidOperationException();

        protected internal override IEnumerable<(string name, EntityDocument value)> EnumerateObjectCore() => _entities.FirstOrDefault()?.Document.EnumerateObjectCore() ?? throw new InvalidOperationException();

        protected internal override bool TryGetPropertyCore(string name, out EntityDocument propertyEntityDocument) => _entities.Any() ? _entities.First().Document.TryGetPropertyCore(name, out propertyEntityDocument) : throw new InvalidOperationException();
    }
}
