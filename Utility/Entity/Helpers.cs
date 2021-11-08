using System;
using System.Collections.Generic;
using System.Text.Json;
using Utility.Entity.Implementations;

namespace Utility.Entity
{
    internal static class Helpers
    {
        private static readonly HashSet<char> _numberCharacters = new()
        {
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            'e',
            '.',
            '-'
        };

        public static void ConsumeWhitespace(ReadOnlySpan<char> span, ref int index)
        {
            while (index < span.Length && char.IsWhiteSpace(span[index]))
            {
                index++;
            }
        }

        public static bool TryGetInt(ReadOnlySpan<char> query, ref int index, out int value)
        {
            var consumed = index;
            while (consumed < query.Length && _numberCharacters.Contains(query[consumed]))
            {
                consumed++;
            }

            if (consumed > index && int.TryParse(query[index..consumed], out value))
            {
                index = consumed;
                return true;
            }

            value = default;
            return false;
        }

        public static bool TryParseEntityDocument(ReadOnlySpan<char> query, ref int index, out EntityDocument entityDocument)
        {
            try
            {
                var end = index;
                char endChar;
                switch (query[index])
                {
                    case 'f':
                        end += 5;
                        break;
                    case 't':
                    case 'n':
                        end += 4;
                        break;
                    case '.':
                    case '-':
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        end = index;
                        var allowDash = false;
                        while (end < query.Length && _numberCharacters.Contains(query[end]))
                        {
                            if (!allowDash && query[end] == '-')
                            {
                                break;
                            }

                            allowDash = query[end] == 'e';
                            end++;
                        }

                        break;
                    case '\'':
                    case '"':
                        end = index + 1;
                        endChar = query[index];
                        while (end < query.Length && query[end] != endChar)
                        {
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

                        end++;
                        break;
                    case '{':
                    case '[':
                        end = index + 1;
                        endChar = query[index] == '{' ? '}' : ']';
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

                            end++;
                        }

                        end++;
                        break;
                    default:
                        entityDocument = default;
                        return false;
                }

                var block = query[index..end];
                if (block[0] == '\'' && block[^1] == '\'')
                {
                    block = $"\"{block[1..^1].ToString()}\"".AsSpan();
                }

                using var doc = JsonDocument.Parse(block.ToString());
                entityDocument = new EntityDocumentJson(doc.RootElement.Clone());
                index = end;
                return true;
            }
            catch
            {
                entityDocument = default;
                return false;
            }
        }
    }
}
