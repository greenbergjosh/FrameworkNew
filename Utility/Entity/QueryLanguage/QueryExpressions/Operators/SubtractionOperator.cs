using System.Threading.Tasks;
using Utility.Entity.Implementations;

namespace Utility.Entity.QueryLanguage.QueryExpressions.Operators
{
    internal sealed class SubtractionOperator : IQueryExpressionOperator
    {
        public int OrderOfOperation => 3;

        public QueryExpressionType GetOutputType(QueryExpressionNode left, QueryExpressionNode right) => left.OutputType != right.OutputType
                ? QueryExpressionType.Invalid
                : left.OutputType == QueryExpressionType.Number ? QueryExpressionType.Number : QueryExpressionType.Invalid;

        public async Task<EntityDocument> Evaluate(QueryExpressionNode left, QueryExpressionNode right, Entity entity, Entity evaluationParameters)
        {
            var leftEntity = await left.Evaluate(entity, evaluationParameters);
            if (leftEntity.ValueType != EntityValueType.Number)
            {
                return default;
            }

            var rightEntity = await right.Evaluate(entity, evaluationParameters);
            return rightEntity.ValueType != EntityValueType.Number
                ? default
                : (EntityDocument)new EntityDocumentConstant(leftEntity.Value<decimal>() - rightEntity.Value<decimal>(), EntityValueType.Number);
        }

        public string ToString(QueryExpressionNode left, QueryExpressionNode right) => $"{left.MaybeAddParentheses(OrderOfOperation)}-{right.MaybeAddParentheses(OrderOfOperation)}";
    }
}