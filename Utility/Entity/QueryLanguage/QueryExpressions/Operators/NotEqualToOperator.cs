using System.Threading.Tasks;

namespace Utility.Entity.QueryLanguage.QueryExpressions.Operators
{
    internal class NotEqualToOperator : IQueryExpressionOperator
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

            return new EntityDocumentConstant(!leftEntity.Equals(rightEntity), EntityValueType.Boolean, ToString());
        }

        public string ToString(QueryExpressionNode left, QueryExpressionNode right)
        {
            var lString = left.MaybeAddParentheses(OrderOfOperation);
            var rString = right.MaybeAddParentheses(OrderOfOperation);

            return $"{lString}!={rString}";
        }
    }
}