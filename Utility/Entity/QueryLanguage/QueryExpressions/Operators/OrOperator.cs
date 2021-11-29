using System.Threading.Tasks;
using Utility.Entity.Implementations;

namespace Utility.Entity.QueryLanguage.QueryExpressions.Operators
{
    internal sealed class OrOperator : IQueryExpressionOperator
    {
        public int OrderOfOperation => 5;

        public QueryExpressionType GetOutputType(QueryExpressionNode left, QueryExpressionNode right) => left.OutputType != right.OutputType
                ? QueryExpressionType.Invalid
                : left.OutputType == QueryExpressionType.Boolean ? QueryExpressionType.Boolean : QueryExpressionType.Invalid;

        public async Task<EntityDocument> Evaluate(QueryExpressionNode left, QueryExpressionNode right, Entity entity, Entity evaluationParameters)
        {
            var leftEntity = await left.Evaluate(entity, evaluationParameters);
            if (leftEntity.ValueType != EntityValueType.Boolean)
            {
                return default;
            }

            var rightEntity = await right.Evaluate(entity, evaluationParameters);
            return rightEntity.ValueType != EntityValueType.Boolean
                ? default
                : (EntityDocument)new EntityDocumentConstant(leftEntity.Value<bool>() || rightEntity.Value<bool>(), EntityValueType.Boolean);
        }

        public string ToString(QueryExpressionNode left, QueryExpressionNode right) => $"{left.MaybeAddParentheses(OrderOfOperation)}||{right.MaybeAddParentheses(OrderOfOperation)}";
    }
}