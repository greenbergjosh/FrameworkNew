using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    internal sealed class ObjectPropertyIndexExpression : IObjectIndexExpression
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

        internal static bool TryParse(ReadOnlySpan<char> query, ref int index, out IIndexExpression indexExpression)
        {
            if (query[index] is not '\'' and not '"')
            {
                index = -1;
                indexExpression = null;
                return false;
            }

            var start = query[index];
            var other = start == '\'' ? '"' : '\'';
            index++;
            var length = 0;
            while (index + length < query.Length)
            {
                if (query[index + length] == '\\')
                {
                    length += 2;
                    continue;
                }

                if (query[index + length] == start)
                {
                    break;
                }

                length++;
            }

            var name = query.Slice(index, length);
            index += length + 1;
            var key = name.ToString();
            // don't escape the other quote
            if (Regex.IsMatch(key, $@"(^|[^\\])\\{other}"))
            {
                indexExpression = null;
                return false;
            }

            indexExpression = new ObjectPropertyIndexExpression(key, start);
            return true;
        }

        public override string ToString() => $"{_quoteChar}{_name}{_quoteChar}";
    }
}
