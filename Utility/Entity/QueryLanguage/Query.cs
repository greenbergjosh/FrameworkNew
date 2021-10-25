using System;
using System.Collections.Generic;
using Utility.Entity.QueryLanguage.IndexExpressions;
using Utility.Entity.QueryLanguage.Selectors;

namespace Utility.Entity.QueryLanguage
{
    internal sealed class Query
    {
        public IReadOnlyList<ISelector> Selectors { get; init; }

        private Query(IReadOnlyList<ISelector> selectors) => Selectors = selectors;

        public static Query Parse(Entity entity, ReadOnlySpan<char> query)
        {
            var index = 0;
            if (!TryParse(entity, query, ref index, false, out var value, out var exception))
            {
                throw exception;
            }

            return value;
        }

        public static bool TryParse(Entity entity, ReadOnlySpan<char> query, out Query value)
        {
            var index = 0;
            return TryParse(entity, query, ref index, false, out value, out var _);
        }

        internal static bool TryParse(Entity entity, ReadOnlySpan<char> query, ref int index, bool allowTrailingContent, out Query value, out QueryParseException exception)
        {
            var selectors = new List<ISelector>();

            while (index < query.Length)
            {
                var selector = query[index] switch
                {
                    '$' => AddRootNode(entity, query, ref index),
                    '@' => AddLocalNode(ref index),
                    '.' => AddPropertyOrNestedDescentOrRefOrFunction(entity, query, ref index),
                    '[' => AddIndex(entity, query, ref index),
                    char ch when Query.IsValidForPropertyName(ch) && index == 0 => AddPropertyOrNestedDescentOrRefOrFunction(entity, query, ref index, true),
                    _ => null
                };

                if (selector == null)
                {
                    if (allowTrailingContent)
                    {
                        break;
                    }
                    value = null;
                    exception = new QueryParseException(index, $"Could not identify selector at index {index}");
                    return false;
                }

                if (selector is ErrorSelector errorSelector)
                {
                    if (allowTrailingContent)
                    {
                        break;
                    }

                    value = null;
                    exception = new QueryParseException(index, errorSelector.Message);
                    return false;
                }

                selectors.Add(selector);
            }

            if (selectors.Count == 0)
            {
                value = null;
                exception = new QueryParseException(index, "No query found");
                return false;
            }

            value = new Query(selectors);
            exception = null;
            return true;
        }

        #region Private Implementation
        private delegate bool TryParseMethod(ReadOnlySpan<char> span, ref int i, out IIndexExpression index);
        private delegate bool TryParseWithEntityMethod(Entity entity, ReadOnlySpan<char> span, ref int i, out IIndexExpression index);

        private static readonly List<TryParseMethod> _indexParseMethods =
            new()
            {
                ArraySliceIndexExpression.TryParse,
                ArrayElementIndexExpression.TryParse,
                ObjectPropertyIndexExpression.TryParse,
            };

        private static readonly List<TryParseWithEntityMethod> _indexParseWithEntityMethods =
            new()
            {
                ItemQueryIndexExpression.TryParse,
                ContainerQueryIndexExpression.TryParse
            };

        private static ISelector AddIndex(Entity entity, ReadOnlySpan<char> query, ref int index)
        {
            var slice = query[index..];
            if (slice.StartsWith("[*]"))
            {
                index += 3;
                return IndexSelector.Wildcard;
            }

            index++;
            var current = ',';
            var indexes = new List<IIndexExpression>();
            while (current == ',')
            {
                Helpers.ConsumeWhitespace(query, ref index);
                if (!ParseIndex(entity, query, ref index, out var indexExpression))
                {
                    return new ErrorSelector($"Error parsing index value near position {index}");
                }

                indexes.Add(indexExpression);

                Helpers.ConsumeWhitespace(query, ref index);

                if (index >= query.Length)
                {
                    break;
                }

                current = query[index++];
            }

            if (current != ']')
            {
                return new ErrorSelector($"Expected ']' or ',' near position {index}");
            }

            return new IndexSelector(indexes);
        }

        private static ISelector AddLocalNode(ref int index)
        {
            index++;
            return new LocalNodeSelector();
        }

        private static ISelector AddPropertyOrNestedDescentOrRefOrFunction(Entity entity, ReadOnlySpan<char> query, ref int index, bool noDot = false)
        {
            var slice = query[index..];

            if (!noDot)
            {
                if (slice.StartsWith("..") || slice.StartsWith(".["))
                {
                    index++;
                    if (slice.StartsWith("..["))
                    {
                        index++;
                    }
                    return new NestedDescentSelector();
                }
                else if (slice.StartsWith(".$ref"))
                {
                    index += 5;
                    return new RefSelector();
                }
                else if (slice.StartsWith(".*"))
                {
                    index += 2;
                    return PropertySelector.Wildcard;
                }

                slice = slice[1..];
            }

            var propertyNameLength = 0;
            if (slice.StartsWith("$"))
            {
                propertyNameLength++;
            }

            while (propertyNameLength < slice.Length && IsValidForPropertyName(slice[propertyNameLength]))
            {
                propertyNameLength++;
            }

            index += (noDot ? 0 : 1) + propertyNameLength;
            if (propertyNameLength < slice.Length && slice[propertyNameLength] == '(')
            {
                var functionName = slice[..propertyNameLength].ToString();
                index++;
                var current = ',';
                var functionArguments = new List<Entity>();
                while (current == ',')
                {
                    Helpers.ConsumeWhitespace(query, ref index);
                    if (Helpers.TryParseEntityDocument(query, ref index, out var argumentEntityDocument))
                    {
                        functionArguments.Add(entity.Create(argumentEntityDocument, argumentEntityDocument.ToString()));
                    }
                    else
                    {
                        return new ErrorSelector($"Unsupported function argument type near position {index}");
                    }

                    current = query[index++];
                }

                return new FunctionSelector(functionName, functionArguments);
            }
            else
            {
                var propertyName = slice[..propertyNameLength];
                return new PropertySelector(propertyName.ToString());
            }
        }

        private static ISelector AddRootNode(Entity entity, ReadOnlySpan<char> query, ref int index)
        {
            if (index + 1 < query.Length && IsValidForPropertyName(query[index + 1]))
            {
                return AddPropertyOrNestedDescentOrRefOrFunction(entity, query, ref index, true);
            }
            else
            {
                index++;
                return new RootNodeSelector();
            }
        }

        private static bool IsValidForPropertyName(char ch) =>
            (ch >= 'a' && ch <= 'z') ||
            (ch >= 'A' && ch <= 'Z') ||
            (ch >= '0' && ch <= '9') ||
            ch == '_' || ch == '-' ||
            (ch >= 0x80 && ch < 0x10FFFF);

        private static bool ParseIndex(Entity entity, ReadOnlySpan<char> query, ref int index, out IIndexExpression indexExpression)
        {
            foreach (var tryParse in _indexParseMethods)
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

            foreach (var tryParse in _indexParseWithEntityMethods)
            {
                var consumed = index;
                if (tryParse(entity, query, ref consumed, out indexExpression))
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
        #endregion

        public override string ToString() => string.Concat(Selectors);
    }
}
