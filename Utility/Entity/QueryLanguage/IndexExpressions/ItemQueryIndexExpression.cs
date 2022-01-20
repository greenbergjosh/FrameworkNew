using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.Entity.QueryLanguage.QueryExpressions;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    internal sealed class ItemQueryIndexExpression : QueryIndexExpression, IArrayIndexExpression, IObjectIndexExpression
    {
        private readonly QueryExpressionNode _expression;

        private ItemQueryIndexExpression(QueryExpressionNode expression) => _expression = expression;

        public async IAsyncEnumerable<int> GetIndexes(Entity entity, Entity evaluationParameters)
        {
            await foreach (var (child, index) in entity.Document.EnumerateArray().Select((item, index) => (item, index)))
            {
                if (await Evaluate(child, evaluationParameters))
                {
                    yield return index;
                }
            }
        }

        public async IAsyncEnumerable<string> GetProperties(Entity entity, Entity evaluationParameters)
        {
            await foreach (var (name, value) in entity.Document.EnumerateObject())
            {
                if (await Evaluate(value, evaluationParameters))
                {
                    yield return name;
                }
            }
        }

        public async Task<bool> Evaluate(Entity entity, Entity evaluationParameters)
        {
            if (_expression.OutputType is not QueryExpressionType.Boolean and not QueryExpressionType.InstanceDependent)
            {
                return false;
            }

            var result = await _expression.Evaluate(entity, evaluationParameters);
            return result.ValueType == EntityValueType.Boolean && result.Value<bool>();
        }

        internal static bool TryParse(Entity entity, ReadOnlySpan<char> query, ref int i, out IIndexExpression index)
        {
            if (query[i] != '?' || query[i + 1] != '(')
            {
                i = -1;
                index = null;
                return false;
            }

            var localIndex = i + 1;
            if (!TryParseExpression(entity, query, ref localIndex, out var expression) ||
                !(expression.OutputType == QueryExpressionType.Boolean ||
                  expression.OutputType == QueryExpressionType.InstanceDependent))
            {
                i = localIndex;
                index = null;
                return false;
            }

            i = localIndex;
            if (i >= query.Length)
            {
                index = null;
                return false;
            }

            index = new ItemQueryIndexExpression(expression);
            return true;
        }

        public override string ToString() => $"?({_expression})";
    }
}
