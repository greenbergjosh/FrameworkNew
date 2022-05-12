using System;
using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    internal sealed class ArrayElementIndexExpression : IArrayIndexExpression
    {
        private readonly Index _index;

        private ArrayElementIndexExpression(Index index) => _index = index;

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public async IAsyncEnumerable<int> GetIndexes(Entity entity, Entity evaluationParameters)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            yield return _index.IsFromEnd ? entity.Document.Length - _index.Value : _index.Value;
        }

        public static bool TryParse(ReadOnlySpan<char> query, ref int index, out IIndexExpression elementIndex)
        {
            if (!Helpers.TryGetInt(query, ref index, out var value))
            {
                index = -1;
                elementIndex = null;
                return false;
            }

            elementIndex = value < 0 ? new ArrayElementIndexExpression(^(-value)) : new ArrayElementIndexExpression(value);
            return true;
        }

        public override string ToString() => IArrayIndexExpression.IndexToPath(_index);
    }
}
