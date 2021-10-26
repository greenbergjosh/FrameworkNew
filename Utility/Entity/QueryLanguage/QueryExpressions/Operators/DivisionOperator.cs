﻿using System.Threading.Tasks;
using Utility.Entity.Implementations;

namespace Utility.Entity.QueryLanguage.QueryExpressions.Operators
{
    internal sealed class DivisionOperator : IQueryExpressionOperator
    {
        public int OrderOfOperation => 2;

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
            var rightEntity = await right.Evaluate(entity);
            if (rightEntity.ValueType != EntityValueType.Number)
            {
                return default;
            }

            var rightValue = rightEntity.Value<decimal>();
            if (rightValue == 0)
            {
                return default;
            }

            var leftEntity = await left.Evaluate(entity);
            if (leftEntity.ValueType != EntityValueType.Number)
            {
                return default;
            }

            return new EntityDocumentConstant(leftEntity.Value<decimal>() / rightValue, EntityValueType.Number);
        }

        public string ToString(QueryExpressionNode left, QueryExpressionNode right) => $"{left.MaybeAddParentheses(OrderOfOperation)}/{right.MaybeAddParentheses(OrderOfOperation, true)}";
    }
}