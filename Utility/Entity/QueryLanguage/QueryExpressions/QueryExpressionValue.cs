using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Utility.Entity.QueryLanguage.QueryExpressions
{
    public abstract class QueryExpressionValue
    {
        public static bool TryParseValue(ReadOnlySpan<char> query, ref int index, out QueryExpressionValue value)
        {
            var slice = query[index..];

            if (slice.StartsWith("false"))
            {
                index += 5;
                value = BooleanQueryExpressionValue.False;
                return true;
            }
            else if (slice.StartsWith("true"))
            {
                index += 4;
                value = BooleanQueryExpressionValue.True;
                return true;
            }
            else if (slice.StartsWith("null"))
            {
                index += 4;
                value = NullQueryExpressionValue.Instance;
                return true;
            }

            return TryParseNumber(query, ref index, out value)
                || TryParseString(query, ref index, out value)
                || TryParseObjectOrArray(query, ref index, out value);
        }

        private static bool TryParseObjectOrArray(ReadOnlySpan<char> query, ref int index, out QueryExpressionValue value)
        {
            if (query[index] == '{' || query[index] == '}')
            {
                var end = index + 1;
                var endChar = query[index] == '{' ? '}' : ']';
                var inString = false;

                while (end < query.Length)
                {
                    var escaped = false;
                    if (query[end] == '\\')
                    {
                        escaped = true;
                        end++;
                        if (end >= query.Length)
                        {
                            break;
                        }
                    }
                    if (!escaped && query[end] == '"')
                    {
                        inString = !inString;
                    }
                    else if (!inString && query[end] == endChar)
                    {
                        break;
                    }
                }
            }

            value = null;
            return false;
        }

        private static bool TryParseNumber(ReadOnlySpan<char> query, ref int index, out QueryExpressionValue value)
        {
            var current = query[index];
            if (char.IsDigit(current) || current == '-' || current == '.')
            {
                var end = index;
                var hasDot = false;
                var hasE = false;

                while (end < query.Length && (
                    char.IsDigit(query[end])
                    || query[end] == '.'
                    || query[end] == '-'
                    || query[end] == 'e'
                ))
                {
                    if (query[end] == '.')
                    {
                        hasDot = true;
                    }
                    else if (query[end] == 'e')
                    {
                        hasE = true;
                    }
                    end++;
                }

                if (hasE && float.TryParse(query[index..end], out var floatValue))
                {
                    value = new FloatQueryExpressionValue(floatValue);
                    index = end;
                    return true;
                }
                else if (hasDot && decimal.TryParse(query[index..end], out var decimalValue))
                {
                    value = new DecimalQueryExpressionValue(decimalValue);
                    index = end;
                    return true;
                }
                else if (int.TryParse(query[index..end], out var intValue))
                {
                    value = new IntegerQueryExpressionValue(intValue);
                    index = end;
                    return true;
                }
            }

            value = null;
            return false;
        }

        private static bool TryParseString(ReadOnlySpan<char> query, ref int index, out QueryExpressionValue value)
        {
            if (query[index] == '\'' || query[index] == '"')
            {
                var end = index + 1;
                var endChar = query[index];

                while (end < query.Length && query[end] != endChar)
                {
                    // If an escape is seen, just skip the next character
                    if (query[end] == '\\')
                    {
                        end++;
                        if (end >= query.Length)
                        {
                            break;
                        }
                    }
                    end++;
                }

                var stringValue = query[(index + 1)..end].ToString().Replace("\\", "");
                value = new StringQueryExpressionValue(stringValue);
                index = end + 1;
                return true;
            }

            value = null;
            return false;
        }
    }

    public class NullQueryExpressionValue : QueryExpressionValue
    {
        private NullQueryExpressionValue()
        {
        }

        public static NullQueryExpressionValue Instance { get; } = new();
    }

    public class BooleanQueryExpressionValue : QueryExpressionValue
    {
        public bool Value { get; init; }

        private BooleanQueryExpressionValue(bool value) => Value = value;

        public static BooleanQueryExpressionValue True { get; } = new BooleanQueryExpressionValue(true);
        public static BooleanQueryExpressionValue False { get; } = new BooleanQueryExpressionValue(false);
    }

    public class FloatQueryExpressionValue : QueryExpressionValue
    {
        public float Value { get; init; }

        public FloatQueryExpressionValue(float value) => Value = value;
    }

    public class DecimalQueryExpressionValue : QueryExpressionValue
    {
        public decimal Value { get; init; }

        public DecimalQueryExpressionValue(decimal value) => Value = value;
    }

    public class IntegerQueryExpressionValue : QueryExpressionValue
    {
        public int Value { get; init; }

        public IntegerQueryExpressionValue(int value) => Value = value;
    }

    public class StringQueryExpressionValue : QueryExpressionValue
    {
        public string Value { get; init; }

        public StringQueryExpressionValue(string value) => Value = value;
    }
}
