using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
