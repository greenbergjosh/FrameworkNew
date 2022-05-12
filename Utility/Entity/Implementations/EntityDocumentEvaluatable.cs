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
        public Task<EvaluateResponse> Evaluate(EvaluateRequest request) => _evaluatable.Evaluate(request);

        public override void SerializeToJson(Utf8JsonWriter writer, JsonSerializerOptions options) => JsonSerializer.Serialize(_evaluatable);

        public override string ToString() => _evaluatable?.ToString();

        public override T Value<T>() => (T)_evaluatable;

        protected internal override IAsyncEnumerable<EntityDocument> EnumerateArrayCore() => throw new NotImplementedException();

        protected internal override IAsyncEnumerable<(string name, EntityDocument value)> EnumerateObjectCore() => throw new NotImplementedException();

        protected internal override Task<(bool found, EntityDocument propertyEntityDocument)> TryGetPropertyCore(string name) => throw new NotImplementedException();
        #endregion
    }
}
