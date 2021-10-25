using System.Threading.Tasks;
using Utility.Entity.Implementations;

namespace Utility.Entity.QueryLanguage.QueryExpressions.Operators
{
    internal sealed class NotEqualToOperator : IQueryExpressionOperator
    {
        public int OrderOfOperation => 4;

        public QueryExpressionType GetOutputType(QueryExpressionNode left, QueryExpressionNode right)
        {
            if (left.OutputType == QueryExpressionType.Invalid || right.OutputType == QueryExpressionType.Invalid)
            {
                return QueryExpressionType.Invalid;
            }

            return QueryExpressionType.Boolean;
        }

        public async Task<EntityDocument> Evaluate(QueryExpressionNode left, QueryExpressionNode right, Entity entity)
        {
            var leftEntity = await left.Evaluate(entity);
            var rightEntity = await right.Evaluate(entity);

            return new EntityDocumentConstant(!leftEntity.Equals(rightEntity), EntityValueType.Boolean);
        }

        public string ToString(QueryExpressionNode left, QueryExpressionNode right) => $"{left.MaybeAddParentheses(OrderOfOperation)}!={right.MaybeAddParentheses(OrderOfOperation)}";
    }
}