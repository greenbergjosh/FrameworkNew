using System;
using System.Collections.Generic;
using Utility.Entity.QueryLanguage.IndexExpressions;
using Utility.Entity.QueryLanguage.Tokens;

namespace Utility.Entity.QueryLanguage
{
    public class Query
    {
        public IEnumerable<Token> Tokens { get; init; }

        private Query(IEnumerable<Token> tokens)
        {
            Tokens = tokens;
        }

        public static Query Parse(ReadOnlySpan<char> query)
        {
            var index = 0;

            var tokens = new List<Token>();

            while (index < query.Length)
            {
                var token = query[index] switch
                {
                    '$' => AddRootNode(ref index),
                    '@' => AddLocalNode(ref index),
                    '.' => AddPropertyOrRecursive(query, ref index),
                    '[' => AddIndex(query, ref index),
                    _ => null
                };

                if (token == null)
                {
                    throw new QueryParseException(index, $"Could not identify selector at index {index}");
                }

                if (token is ErrorToken errorToken)
                {
                    throw new QueryParseException(index, errorToken.Message);
                }

                tokens.Add(token);
            }

            if (tokens.Count == 0)
            {
                throw new QueryParseException(index, "No query found");
            }

            return new Query(tokens);
        }

        private static Token AddIndex(ReadOnlySpan<char> query, ref int index)
        {
            var slice = query[index..];
            if (slice.StartsWith("[*]"))
            {
                index += 3;
                return new IndexToken(null);
            }

            index++;
            var current = ',';
            var indexes = new List<IndexExpression>();
            while (current == ',')
            {
                ConsumeWhitespace(query, ref index);
                if (!ParseIndex(query, ref index, out var indexExpression))
                {
                    return new ErrorToken($"Error parsing index value near position {index}");
                }

                indexes.Add(indexExpression);

                ConsumeWhitespace(query, ref index);

                if (index >= query.Length)
                {
                    break;
                }

                current = query[index++];
            }

            if (current != ']')
            {
                return new ErrorToken($"Expected ']' or ',' near position {index}");
            }

            return new IndexToken(indexes);
        }

        private static void ConsumeWhitespace(ReadOnlySpan<char> query, ref int index)
        {
            while (index < query.Length && char.IsWhiteSpace(query[index]))
            {
                index++;
            }
        }

        private delegate bool TryParseMethod(ReadOnlySpan<char> span, ref int i, out IndexExpression index);

        private static readonly List<TryParseMethod> _parseMethods =
            new()
            {
                ArrayElementIndexExpression.TryParse,
                ObjectElementIndexExpression.TryParse
            };

        private static bool ParseIndex(ReadOnlySpan<char> query, ref int index, out IndexExpression indexExpression)
        {
            foreach (var tryParse in _parseMethods)
            {
                var consumed = index;
                if (tryParse(query, ref consumed, out indexExpression))
                {
                    index = consumed;
                    return true;
                }

                if (consumed != -1)
                {
                    index = consumed;
                    indexExpression = null;
                    return false;
                }
            }

            indexExpression = null;
            return false;
        }

        private static Token AddPropertyOrRecursive(ReadOnlySpan<char> query, ref int index)
        {
            var slice = query[index..];
            if (slice.StartsWith("..") || slice.StartsWith(".["))
            {
                index++;
                return new NestedDescentToken();
            }

            if (slice.StartsWith(".*"))
            {
                index += 2;
                return PropertyToken.Wildcard;
            }

            slice = slice[1..];
            var propertyNameLength = 0;
            while (propertyNameLength < slice.Length && IsValidForPropertyName(slice[propertyNameLength]))
            {
                propertyNameLength++;
            }

            var propertyName = slice[..propertyNameLength];
            index += 1 + propertyNameLength;
            return new PropertyToken(propertyName.ToString());
        }

        private static bool IsValidForPropertyName(char ch) =>
            (ch >= 'a' && ch <= 'z') ||
            (ch >= 'A' && ch <= 'Z') ||
            (ch >= '0' && ch <= '9') ||
            ch == '_' ||
            (ch >= 0x80 && ch < 0x10FFFF);

        private static Token AddRootNode(ref int index)
        {
            index++;
            return new RootNodeToken();
        }

        private static Token AddLocalNode(ref int index)
        {
            index++;
            return new RootNodeToken();
        }

        public override string ToString() => string.Concat(Tokens);
    }
}
