using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    public class ObjectPropertyIndexExpression : IObjectIndexExpression
    {
        private readonly string _name;
        private readonly char _quoteChar;

        private ObjectPropertyIndexExpression(string name, char quoteChar)
        {
            _name = name;
            _quoteChar = quoteChar;
        }

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public async IAsyncEnumerable<string> GetProperties(Entity entity)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            yield return _name;
        }

        internal static bool TryParse(ReadOnlySpan<char> span, ref int index, out IIndexExpression indexExpression)
        {
            if (span[index] != '\'' && span[index] != '"')
            {
                index = -1;
                indexExpression = null;
                return false;
            }

            var start = span[index];
            var other = start == '\'' ? '"' : '\'';
            index++;
            var length = 0;
            while (index + length < span.Length)
            {
                if (span[index + length] == '\\')
                {
                    length += 2;
                    continue;
                }
                if (span[index + length] == start)
                {
                    break;
                }
                length++;
            }

            var name = span.Slice(index, length);
            index += length + 1;
            var key = name.ToString();
            // don't escape the other quote
            if (Regex.IsMatch(key, $@"(^|[^\\])\\{other}"))
            {
                indexExpression = null;
                return false;
            }

            if (start == '\'')
            {
                key = key.Replace("\\'", "'").Replace("\"", "\\\"");
            }

            indexExpression = new ObjectPropertyIndexExpression(key, start);
            return true;
        }

        public override string ToString() => $"{_quoteChar}{_name}{_quoteChar}";
    }
}
