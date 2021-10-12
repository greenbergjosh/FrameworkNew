using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.Entity.QueryLanguage.QueryExpressions;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    public class ItemQueryIndexExpression : QueryIndexExpression, IArrayIndexExpression, IObjectIndexExpression
    {
        private readonly QueryExpressionNode _expression;

        private ItemQueryIndexExpression(QueryExpressionNode expression) => _expression = expression;

        public async IAsyncEnumerable<int> GetIndexes(Entity entity)
        {
            foreach (var (child, index) in entity.Document.EnumerateArray().Select((item, index) => (item, index)))
            {
                if (await Evaluate(child))
                {
                    yield return index;
                }
            }
        }

        public async IAsyncEnumerable<string> GetProperties(Entity entity)
        {
            foreach (var (name, value) in entity.Document.EnumerateObject())
            {
                if (await Evaluate(value))
                {
                    yield return name;
                }
            }
        }

        private async Task<bool> Evaluate(Entity entity)
        {
            if (_expression.OutputType != QueryExpressionType.Boolean && _expression.OutputType != QueryExpressionType.InstanceDependent)
            {
                return false;
            }

            var result = await _expression.Evaluate(entity);
            if (result.ValueType != EntityValueType.Boolean)
            {
                return false;
            }

            return result.Value<bool>();
        }

        internal static bool TryParse(Entity entity, ReadOnlySpan<char> span, ref int i, out IIndexExpression index)
        {
            if (span[i] != '?' || span[i + 1] != '(')
            {
                i = -1;
                index = null;
                return false;
            }

            var localIndex = i + 1;
            if (!TryParseExpression(entity, span, ref localIndex, out var expression) ||
                !(expression.OutputType == QueryExpressionType.Boolean ||
                  expression.OutputType == QueryExpressionType.InstanceDependent))
            {
                i = localIndex;
                index = null;
                return false;
            }

            i = localIndex;
            if (i >= span.Length)
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
