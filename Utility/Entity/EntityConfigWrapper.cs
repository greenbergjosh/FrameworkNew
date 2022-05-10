using System;
using Utility.Evaluatable;

namespace Utility.Entity
{
    public class EntityConfigSchemeWrapper : IEntityConfig
    {
        private readonly IEntityConfig _wrappedConfig;
        private readonly IEntityConfig _wrapper;

        public EntityConfigSchemeWrapper(IEntityConfig wrappedConfig, IEntityConfig wrapper)
        {
            _wrappedConfig = wrappedConfig;
            _wrapper = wrapper;

            Evaluator = wrappedConfig.Evaluator;
            FunctionHandler = wrappedConfig.FunctionHandler;
            MissingPropertyHandler = wrappedConfig.MissingPropertyHandler;
            Parser = wrappedConfig.Parser;
        }

        public Evaluator Evaluator { get; init; }

        public FunctionHandler FunctionHandler { get; init; }

        public MissingPropertyHandler MissingPropertyHandler { get; init; }

        public EntityParser Parser { get; init; }

        public EntityRetriever Retriever
        {
            get
            {
                return (Entity baseEntity, Uri uri) =>
                {
                    var retrieved = _wrapper.Retriever?.Invoke(baseEntity, uri);
                    if (retrieved == null)
                    {
                        retrieved = _wrappedConfig.Retriever?.Invoke(baseEntity, uri);
                    }

                    return retrieved;
                };
            }
        }
    }
}
