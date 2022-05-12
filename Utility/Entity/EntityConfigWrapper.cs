using System;
using System.Linq;
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
                return async (Entity baseEntity, Uri uri) =>
                {
                    if (_wrapper.Retriever != null)
                    {
                        var retrieved = await _wrapper.Retriever(baseEntity, uri);
                        if (retrieved.entities?.SingleOrDefault()?.ValueType == EntityValueType.Unhandled)
                        {
                            return await _wrappedConfig.Retriever(baseEntity, uri);
                        }

                        return retrieved;
                    }

                    return await _wrappedConfig.Retriever(baseEntity, uri);
                };
            }
        }
    }
}
