using System;

namespace Utility.Entity
{
    internal static class Helpers
    {
        public static void ConsumeWhitespace(ReadOnlySpan<char> span, ref int index)
        {
            while (index < span.Length && char.IsWhiteSpace(span[index]))
            {
                index++;
            }
        }
    }
}
