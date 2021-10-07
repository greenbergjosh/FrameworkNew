using System;
using System.Collections.Generic;
using System.Linq;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    public class ArrayElementIndexExpression : ArrayIndexExpression
    {
        public override IEnumerable<Index> Indexes { get; init; }

        private ArrayElementIndexExpression(Index index)
        {
            Indexes = new[] { index };
        }

        internal static bool TryParse(ReadOnlySpan<char> query, ref int index, out IndexExpression elementIndex)
        {
            if (!TryGetInt(query, ref index, out var value))
            {
                index = -1;
                elementIndex = null;
                return false;
            }

            elementIndex = value < 0 ? new ArrayElementIndexExpression(^(-value)) : new ArrayElementIndexExpression(value);
            return true;
        }

        public override string ToString() => IndexToPath(Indexes.First());
    }
}
