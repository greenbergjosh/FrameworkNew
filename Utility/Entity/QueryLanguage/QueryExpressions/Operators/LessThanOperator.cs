using System;
using System.Threading.Tasks;
using Utility.Entity.Implementations;

namespace Utility.Entity.QueryLanguage.QueryExpressions.Operators
{
    internal class LessThanOperator : IQueryExpressionOperator
    {
        public int OrderOfOperation => 4;

        public QueryExpressionType GetOutputType(QueryExpressionNode left, QueryExpressionNode right)
        {
            if (left.OutputType != right.OutputType)
            {
                return QueryExpressionType.Invalid;
            }

            return left.OutputType switch
            {
                QueryExpressionType.Number => QueryExpressionType.Boolean,
                QueryExpressionType.String => QueryExpressionType.Boolean,
                _ => QueryExpressionType.Invalid
            };
        }

        public async Task<EntityDocument> Evaluate(QueryExpressionNode left, QueryExpressionNode right, Entity entity)
        {
            var leftEntity = await left.Evaluate(entity);
            var rightEntity = await right.Evaluate(entity);

            switch (leftEntity.ValueType)
            {
                case EntityValueType.Number:
                    if (leftEntity.ValueType != EntityValueType.Number || rightEntity.ValueType != EntityValueType.Number)
                    {
                        return default;
                    }

                    return new EntityDocumentConstant(leftEntity.Value<decimal>() < rightEntity.Value<decimal>(), EntityValueType.Boolean);
                case EntityValueType.String:
                    if (leftEntity.ValueType != EntityValueType.String || rightEntity.ValueType != EntityValueType.String)
                    {
                        return default;
                    }

                    return new EntityDocumentConstant(string.Compare(leftEntity.Value<string>(), rightEntity.Value<string>(), StringComparison.Ordinal) < 0, EntityValueType.Boolean);
                default:
                    return default;
            }
        }

        public string ToString(QueryExpressionNode left, QueryExpressionNode right) => $"{left.MaybeAddParentheses(OrderOfOperation)}<{right.MaybeAddParentheses(OrderOfOperation)}";
    }
}