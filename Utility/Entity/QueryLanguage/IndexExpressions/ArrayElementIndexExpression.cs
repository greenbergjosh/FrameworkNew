using System;
using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    public class ArrayElementIndexExpression : IArrayIndexExpression
    {
        private readonly Index _index;

        private ArrayElementIndexExpression(Index index)
        {
            _index = index;
        }

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public async IAsyncEnumerable<int> GetIndexes(Entity entity)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            var end = _index.IsFromEnd ? entity.Document.Length - _index.Value : _index.Value;
            yield return end;
        }

        public static bool TryParse(ReadOnlySpan<char> query, ref int index, out IIndexExpression elementIndex)
        {
            if (!IIndexExpression.TryGetInt(query, ref index, out var value) || query[index] != ']')
            {
                index = -1;
                elementIndex = null;
                return false;
            }

            elementIndex = value < 0 ? new ArrayElementIndexExpression(^(-value)) : new ArrayElementIndexExpression(value);
            return true;
        }

        public override string ToString() => IIndexExpression.IndexToPath(_index);
    }
}
