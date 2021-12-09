using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Utility.Evaluatable;

namespace Utility.Entity.Implementations
{
    public class EntityDocumentEvaluatable : EntityDocument, IEvaluatable
    {
        #region Fields
        private readonly IEvaluatable _evaluatable;
        #endregion

        #region Constructors
        public EntityDocumentEvaluatable(IEvaluatable evaluatable) => _evaluatable = evaluatable;
        #endregion

        #region Properties
        public override int Length => throw new NotImplementedException();

        public override EntityValueType ValueType => EntityValueType.Undefined;
        #endregion

        #region Methods
        public Task<EvaluatableResponse> Evaluate(EvaluatableRequest request) => _evaluatable.Evaluate(request);

        public override void SerializeToJson(Utf8JsonWriter writer, JsonSerializerOptions options) => JsonSerializer.Serialize(_evaluatable);

        public override string ToString() => _evaluatable?.ToString();

        public override T Value<T>() => (T)_evaluatable;

        protected internal override IEnumerable<EntityDocument> EnumerateArrayCore() => throw new NotImplementedException();

        protected internal override IEnumerable<(string name, EntityDocument value)> EnumerateObjectCore() => throw new NotImplementedException();

        protected internal override bool TryGetPropertyCore(string name, out EntityDocument propertyEntityDocument) => throw new NotImplementedException();
        #endregion
    }
}
