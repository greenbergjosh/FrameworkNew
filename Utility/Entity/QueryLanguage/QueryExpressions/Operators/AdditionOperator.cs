using System.Threading.Tasks;

namespace Utility.Entity.QueryLanguage.QueryExpressions.Operators
{
    internal class AdditionOperator : IQueryExpressionOperator
    {
        public int OrderOfOperation => 3;

        public QueryExpressionType GetOutputType(QueryExpressionNode left, QueryExpressionNode right)
        {
            if (left.OutputType != right.OutputType)
            {
                return QueryExpressionType.Invalid;
            }

            return left.OutputType switch
            {
                QueryExpressionType.Number => QueryExpressionType.Number,
                QueryExpressionType.String => QueryExpressionType.String,
                _ => QueryExpressionType.Invalid
            };
        }

        public async Task<EntityDocument> Evaluate(QueryExpressionNode left, QueryExpressionNode right, Entity entity)
        {
            var leftEntity = await left.Evaluate(entity);
            var rightEntity = await right.Evaluate(entity);

            switch (left.OutputType)
            {
                case QueryExpressionType.Number:
                    if (leftEntity.ValueType != EntityValueType.Number || rightEntity.ValueType != EntityValueType.Number)
                    {
                        return default;
                    }
                    return new EntityDocumentConstant(leftEntity.Value<decimal>() + rightEntity.Value<decimal>(), EntityValueType.Number, ToString());
                case QueryExpressionType.String:
                    if (leftEntity.ValueType != EntityValueType.String || rightEntity.ValueType != EntityValueType.String)
                    {
                        return default;
                    }
                    return new EntityDocumentConstant(string.Concat(leftEntity.Value<string>(), rightEntity.Value<string>()), EntityValueType.Number, ToString());
                default:
                    return default;
            }
        }

        public string ToString(QueryExpressionNode left, QueryExpressionNode right)
        {
            var lString = left.MaybeAddParentheses(OrderOfOperation);
            var rString = right.MaybeAddParentheses(OrderOfOperation);

            return $"{lString}+{rString}";
        }
    }
}