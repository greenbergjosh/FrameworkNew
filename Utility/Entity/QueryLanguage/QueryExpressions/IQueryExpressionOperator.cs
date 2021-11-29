using System.Threading.Tasks;

namespace Utility.Entity.QueryLanguage.QueryExpressions
{
    internal interface IQueryExpressionOperator
    {
        int OrderOfOperation { get; }

        QueryExpressionType GetOutputType(QueryExpressionNode left, QueryExpressionNode right);

        Task<EntityDocument> Evaluate(QueryExpressionNode left, QueryExpressionNode right, Entity entity, Entity evaluationParameters);

        string ToString(QueryExpressionNode left, QueryExpressionNode right);
    }
}