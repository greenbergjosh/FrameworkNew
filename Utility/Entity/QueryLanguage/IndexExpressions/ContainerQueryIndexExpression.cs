﻿using System;
using System.Collections.Generic;
using Utility.Entity.QueryLanguage.QueryExpressions;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    internal sealed class ContainerQueryIndexExpression : QueryIndexExpression, IArrayIndexExpression, IObjectIndexExpression
    {
        private readonly QueryExpressionNode _expression;

        private ContainerQueryIndexExpression(QueryExpressionNode expression) => _expression = expression;

        public async IAsyncEnumerable<int> GetIndexes(Entity entity, Entity evaluationParameters)
        {
            if (_expression.OutputType is not QueryExpressionType.Number and not QueryExpressionType.InstanceDependent)
            {
                yield break;
            }

            var result = await _expression.Evaluate(entity, evaluationParameters);
            if (result.ValueType != EntityValueType.Number)
            {
                yield break;
            }

            var index = result.Value<decimal>();
            if (Math.Truncate(index) != index)
            {
                yield break;
            }

            yield return (int)index;
        }

        public async IAsyncEnumerable<string> GetProperties(Entity entity, Entity evaluationParameters)
        {
            if (_expression.OutputType is not QueryExpressionType.String and not QueryExpressionType.InstanceDependent)
            {
                yield break;
            }

            var result = await _expression.Evaluate(entity, evaluationParameters);
            if (result.ValueType != EntityValueType.String)
            {
                yield break;
            }

            var property = result.Value<string>();
            yield return property;
        }

        internal static bool TryParse(Entity entity, ReadOnlySpan<char> query, ref int i, out IIndexExpression index)
        {
            if (query[i] != '(')
            {
                i = -1;
                index = null;
                return false;
            }

            var localIndex = i;
            if (!TryParseExpression(entity, query, ref localIndex, out var expression) ||
                !(expression.OutputType == QueryExpressionType.Number || expression.OutputType == QueryExpressionType.InstanceDependent))
            {
                index = null;
                return false;
            }

            i = localIndex;
            if (i >= query.Length)
            {
                index = null;
                return false;
            }

            index = new ContainerQueryIndexExpression(expression);
            return true;
        }

        public override string ToString() => $"({_expression})";
    }
}
