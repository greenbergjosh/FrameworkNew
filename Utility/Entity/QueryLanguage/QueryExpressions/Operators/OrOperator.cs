using System.Threading.Tasks;
using Utility.Entity.Implementations;

namespace Utility.Entity.QueryLanguage.QueryExpressions.Operators
{
    internal sealed class OrOperator : IQueryExpressionOperator
    {
        public int OrderOfOperation => 5;

        public QueryExpressionType GetOutputType(QueryExpressionNode left, QueryExpressionNode right)
        {
            if (left.OutputType != right.OutputType)
            {
                return QueryExpressionType.Invalid;
            }

            if (left.OutputType == QueryExpressionType.Boolean)
            {
                return QueryExpressionType.Boolean;
            }

            return QueryExpressionType.Invalid;
        }

        public async Task<EntityDocument> Evaluate(QueryExpressionNode left, QueryExpressionNode right, Entity entity)
        {
            var leftEntity = await left.Evaluate(entity);
            if (leftEntity.ValueType != EntityValueType.Boolean)
            {
                return default;
            }

            var rightEntity = await right.Evaluate(entity);
            if (rightEntity.ValueType != EntityValueType.Boolean)
            {
                return default;
            }

            return new EntityDocumentConstant(leftEntity.Value<bool>() || rightEntity.Value<bool>(), EntityValueType.Boolean);
        }

        public string ToString(QueryExpressionNode left, QueryExpressionNode right) => $"{left.MaybeAddParentheses(OrderOfOperation)}||{right.MaybeAddParentheses(OrderOfOperation)}";
    }
}