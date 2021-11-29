using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Utility.Evaluatable;

namespace Utility.Entity.Implementations
{
    public class EntityDocumentEvaluatable : EntityDocument, IEvaluatable
    {
        private readonly IEvaluatable _evaluatable;

        public EntityDocumentEvaluatable(IEvaluatable evaluatable) => _evaluatable = evaluatable;

        public override EntityValueType ValueType => EntityValueType.Undefined;

        public override int Length => throw new NotImplementedException();

        public Task<Entity> Evaluate(Entity entity, Entity parameters) => _evaluatable.Evaluate(entity, parameters);

        public override void SerializeToJson(Utf8JsonWriter writer, JsonSerializerOptions options) => JsonSerializer.Serialize(_evaluatable);
        public override T Value<T>() => throw new NotImplementedException();
        protected internal override IEnumerable<EntityDocument> EnumerateArrayCore() => throw new NotImplementedException();
        protected internal override IEnumerable<(string name, EntityDocument value)> EnumerateObjectCore() => throw new NotImplementedException();
        protected internal override bool TryGetPropertyCore(string name, out EntityDocument propertyEntityDocument) => throw new NotImplementedException();
    }
}
