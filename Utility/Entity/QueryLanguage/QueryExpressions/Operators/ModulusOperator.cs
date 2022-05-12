using System.Threading.Tasks;
using Utility.Entity.Implementations;

namespace Utility.Entity.QueryLanguage.QueryExpressions.Operators
{
    internal sealed class ModulusOperator : IQueryExpressionOperator
    {
        public int OrderOfOperation => 2;

        public QueryExpressionType GetOutputType(QueryExpressionNode left, QueryExpressionNode right) => left.OutputType != right.OutputType
                ? QueryExpressionType.Invalid
                : left.OutputType == QueryExpressionType.Number ? QueryExpressionType.Number : QueryExpressionType.Invalid;

        public async Task<EntityDocument> Evaluate(QueryExpressionNode left, QueryExpressionNode right, Entity entity, Entity evaluationParameters)
        {
            var rightEntity = await right.Evaluate(entity, evaluationParameters);
            if (rightEntity.ValueType != EntityValueType.Number)
            {
                return default;
            }

            var rightValue = rightEntity.Value<decimal>();
            if (rightValue == 0)
            {
                return default;
            }

            var leftEntity = await left.Evaluate(entity, evaluationParameters);
            return leftEntity.ValueType != EntityValueType.Number
                ? default
                : (EntityDocument)new EntityDocumentConstant(leftEntity.Value<decimal>() % rightValue, EntityValueType.Number);
        }

        public string ToString(QueryExpressionNode left, QueryExpressionNode right) => $"{left.MaybeAddParentheses(OrderOfOperation)}%{right.MaybeAddParentheses(OrderOfOperation, true)}";
    }
}