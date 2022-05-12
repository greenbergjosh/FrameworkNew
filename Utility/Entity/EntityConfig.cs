using Utility.Evaluatable;

namespace Utility.Entity
{
    public record EntityConfig(EntityParser Parser = null, EntityRetriever Retriever = null, Evaluator Evaluator = null, MissingPropertyHandler MissingPropertyHandler = null, FunctionHandler FunctionHandler = null) : IEntityConfig;
}
