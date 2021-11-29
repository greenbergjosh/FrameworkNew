using System.Threading.Tasks;
using Utility.Entity.Implementations;

namespace Utility.Entity.QueryLanguage.QueryExpressions.Operators
{
    internal sealed class EqualToOperator : IQueryExpressionOperator
    {
        public int OrderOfOperation => 4;

        public QueryExpressionType GetOutputType(QueryExpressionNode left, QueryExpressionNode right) => left.OutputType == QueryExpressionType.Invalid || right.OutputType == QueryExpressionType.Invalid
                ? QueryExpressionType.Invalid
                : QueryExpressionType.Boolean;

        public async Task<EntityDocument> Evaluate(QueryExpressionNode left, QueryExpressionNode right, Entity entity, Entity evaluationParameters)
        {
            var leftEntity = await left.Evaluate(entity, evaluationParameters);
            var rightEntity = await right.Evaluate(entity, evaluationParameters);

            return new EntityDocumentConstant(leftEntity.Equals(rightEntity), EntityValueType.Boolean);
        }

        public string ToString(QueryExpressionNode left, QueryExpressionNode right) => $"{left.MaybeAddParentheses(OrderOfOperation)}=={right.MaybeAddParentheses(OrderOfOperation)}";
    }
}