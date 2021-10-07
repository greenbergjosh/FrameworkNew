using System;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    public abstract class IndexExpression
    {
        protected static bool TryGetInt(ReadOnlySpan<char> query, ref int index, out int value)
        {
            var negative = false;
            if (query[index] == '-')
            {
                negative = true;
                index++;
            }

            var foundNumber = false;
            value = 0;
            while (index < query.Length && char.IsDigit(query[index]))
            {
                foundNumber = true;
                value = value * 10 + query[index] - '0';
                index++;
            }

            if (negative)
            {
                value = -value;
            }

            return foundNumber;
        }

        protected static string IndexToPath(Index index) => index.IsFromEnd ? $"-{index.Value}" : index.Value.ToString();
    }
}
