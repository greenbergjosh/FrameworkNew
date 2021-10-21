using System;
using System.Text.RegularExpressions;

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

        public static bool TryGetInt(ReadOnlySpan<char> query, ref int index, out int value)
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

        public static bool TryGetString(ReadOnlySpan<char> query, ref int index, out string value, out char? enclosingCharacter)
        {
            if (query[index] != '\'' && query[index] != '"')
            {
                value = null;
                enclosingCharacter = null;
                return false;
            }

            var startCharacter = query[index];
            var otherCharacter = startCharacter == '\'' ? '"' : '\'';

            var startIndex = index + 1;
            var length = 0;
            while (startIndex + length < query.Length)
            {
                // Skip escaped characters
                if (query[startIndex + length] == '\\')
                {
                    length += 2;
                    continue;
                }
                else if (query[startIndex + length] == startCharacter)
                {
                    break;
                }
                length++;
            }

            value = query.Slice(startIndex, length).ToString();
            enclosingCharacter = startCharacter;

            // don't escape the other quote
            if (Regex.IsMatch(value, $@"(^|[^\\])\\{otherCharacter}"))
            {
                value = null;
                enclosingCharacter = null;
                return false;
            }

            index += length + 2;
            return true;
        }
    }
}
