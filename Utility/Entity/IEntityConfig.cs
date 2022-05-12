using Utility.Evaluatable;

namespace Utility.Entity
{
    public interface IEntityConfig
    {
        Evaluator Evaluator { get; }
        FunctionHandler FunctionHandler { get; }
        MissingPropertyHandler MissingPropertyHandler { get; }
        EntityParser Parser { get; }
        EntityRetriever Retriever { get; }
    }
}