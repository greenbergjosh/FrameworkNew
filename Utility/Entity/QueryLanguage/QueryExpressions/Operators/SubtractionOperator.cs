using System.Threading.Tasks;

namespace Utility.Entity.QueryLanguage.QueryExpressions.Operators
{
    internal class SubtractionOperator : IQueryExpressionOperator
    {
        public int OrderOfOperation => 3;

        public QueryExpressionType GetOutputType(QueryExpressionNode left, QueryExpressionNode right)
        {
            if (left.OutputType != right.OutputType)
            {
                return QueryExpressionType.Invalid;
            }

            if (left.OutputType == QueryExpressionType.Number)
            {
                return QueryExpressionType.Number;
            }

            return QueryExpressionType.Invalid;
        }

        public async Task<EntityDocument> Evaluate(QueryExpressionNode left, QueryExpressionNode right, Entity entity)
        {
            var leftEntity = await left.Evaluate(entity);
            if (leftEntity.ValueType != EntityValueType.Number)
            {
                return default;
            }
            var rightEntity = await right.Evaluate(entity);
            if (rightEntity.ValueType != EntityValueType.Number)
            {
                return default;
            }

            return new EntityDocumentConstant(leftEntity.Value<decimal>() - rightEntity.Value<decimal>(), EntityValueType.Number, ToString());
        }

        public string ToString(QueryExpressionNode left, QueryExpressionNode right) => $"{left.MaybeAddParentheses(OrderOfOperation)}-{right.MaybeAddParentheses(OrderOfOperation)}";
    }
}