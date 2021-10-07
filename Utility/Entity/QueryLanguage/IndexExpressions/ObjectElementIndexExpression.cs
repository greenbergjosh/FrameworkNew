using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    public class ObjectElementIndexExpression : ObjectIndexExpression
    {
        public override IEnumerable<string> Properties { get; init; }

        private readonly string _name;
        private readonly char _quoteChar;

        private ObjectElementIndexExpression(string name, char quoteChar)
        {
            Properties = new[] { name };
            _quoteChar = quoteChar;
        }

        internal static bool TryParse(ReadOnlySpan<char> span, ref int index, out IndexExpression indexExpression)
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
                if (span[index + length] == start) break;
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

            try
            {
                if (start == '\'')
                    key = key.Replace("\\'", "'").Replace("\"", "\\\"");
                using var doc = JsonDocument.Parse($"\"{key}\"");
                key = doc.RootElement.GetString();
            }
            catch
            {
                indexExpression = null;
                return false;
            }

            indexExpression = new ObjectElementIndexExpression(key, start);
            return true;
        }

        public override string ToString()
        {
            // TODO: add escaping
            return $"{_quoteChar}{_name}{_quoteChar}";
        }
    }
}
