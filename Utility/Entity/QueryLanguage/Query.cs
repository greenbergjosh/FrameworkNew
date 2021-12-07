using System;
using System.Collections.Generic;
using System.Linq;
using Utility.Entity.QueryLanguage.IndexExpressions;
using Utility.Entity.QueryLanguage.Selectors;
using Utility.Evaluatable;

namespace Utility.Entity.QueryLanguage
{
    internal sealed class Query : EvaluatableSequenceBase
    {
        #region Fields
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

        private readonly string _query;
        #endregion

        #region Constructors
        public Query(string query) => _query = query;
        #endregion

        #region Delegates
        private delegate bool TryParseMethod(ReadOnlySpan<char> span, ref int i, out IIndexExpression index);

        private delegate bool TryParseWithEntityMethod(Entity entity, ReadOnlySpan<char> span, ref int i, out IIndexExpression index);
        #endregion

        #region Properties
        public bool IsLocal => _query == "@";
        #endregion

        #region Methods
        public override string ToString() => _query;

        internal static bool TryParse(Entity entity, ReadOnlySpan<char> query, ref int index, bool allowTrailingContent, out Query result)
        {
            var queryEndIndex = index;
            if (TryParse(entity, query, ref queryEndIndex, allowTrailingContent, out var _, out var _))
            {
                result = new Query(query[index..queryEndIndex].ToString());
                index = queryEndIndex;
                return true;
            }

            result = default;
            return false;
        }

        protected override async IAsyncEnumerable<Entity> Load(EvaluatableSequenceBase sequence, Entity targetEntity, Entity parameters)
        {
            var query = (Query)sequence;
            IEnumerable<Entity> entities;

            string queryToParse;
            if (Uri.TryCreate(query._query, UriKind.Absolute, out var uri))
            {
                if (targetEntity.Retriever is null)
                {
                    throw new InvalidOperationException($"Absolute queries are not allowed unless a retriever has been provided.");
                }

                var result = await targetEntity.Retriever(targetEntity, uri);
                entities = result.entities;

                if (entities is null || !entities.Any())
                {
                    throw new InvalidOperationException("Absolute query did not return an entity");
                }

                queryToParse = string.IsNullOrWhiteSpace(result.query) ? "@" : result.query;
            }
            else
            {
                if (targetEntity.Document is null)
                {
                    throw new InvalidOperationException("Cannot run a relative query on a null entity");
                }

                entities = new[] { targetEntity };
                queryToParse = query._query;
            }

            var index = 0;
            var selectors = Parse(targetEntity, queryToParse, ref index, false).ToList();

            var current = entities;

            for (var i = 0; i < selectors.Count && current.Any(); i++)
            {
                var selector = selectors[i];

                var next = new List<Entity>();
                await foreach (var child in targetEntity.Evaluator.Evaluate(targetEntity.Create(selector), targetEntity.Create(new { target = current, parameters })))
                {
                    var processReference = i == selectors.Count - 1 || selectors[i + 1] is not RefSelector;

                    await foreach (var handledChild in HandleChild(child, processReference, parameters))
                    {
                        next.Add(handledChild);
                    }
                }

                current = next;
            }

            foreach (var item in current)
            {
                yield return item;
            }

            static async IAsyncEnumerable<Entity> HandleChild(Entity child, bool processReference, Entity evaluationParameters)
            {
                var hadReference = false;
                if (processReference)
                {
                    await foreach (var referenceChild in child.Document.ProcessReference())
                    {
                        hadReference = true;
                        referenceChild.Query = referenceChild.Query.Replace("$", child.Query);
                        await foreach (var handledChild in HandleChild(referenceChild, processReference, evaluationParameters))
                        {
                            yield return handledChild;
                        }
                    }

                    if (hadReference)
                    {
                        yield break;
                    }
                }

                if (child.Evaluator != null)
                {
                    await foreach (var evaluationChild in child.Evaluator.Evaluate(child, null))
                    {
                        if (!child.Equals(evaluationChild))
                        {
                            await foreach (var handledChild in HandleChild(evaluationChild, processReference, evaluationParameters))
                            {
                                yield return handledChild;
                            }
                        }
                        else
                        {
                            yield return child;
                        }
                    }
                }
                else
                {
                    yield return child;
                }
            }
        }

        private static Selector AddIndex(Entity entity, ReadOnlySpan<char> query, ref int index)
        {
            var slice = query[index..];
            if (slice.StartsWith("[*]"))
            {
                index += 3;
                // TODO: Can't use Wildcard anymore since selectors have state
                // TODO: Set back to Wildcard once Evaluator provides state
                //return IndexSelector.Wildcard;
                return new IndexSelector(null);
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

            return current != ']' ? new ErrorSelector($"Expected ']' or ',' near position {index}") : new IndexSelector(indexes);
        }

        private static Selector AddLocalNode(ref int index)
        {
            index++;
            return new LocalNodeSelector();
        }

        private static Selector AddPropertyOrNestedDescentOrRefOrFunction(Entity entity, ReadOnlySpan<char> query, ref int index, bool noDot = false)
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
                    // TODO: Can't use static Wildcard anymore since selectors have state
                    return new PropertySelector(null);
                    //return PropertySelector.Wildcard;
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

                var functionArguments = new List<Entity>();
                if (query[index] == ')')
                {
                    index++;
                }
                else
                {
                    var current = ',';
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
                }

                return new FunctionSelector(functionName, functionArguments);
            }
            else
            {
                var propertyName = slice[..propertyNameLength];
                return new PropertySelector(propertyName.ToString());
            }
        }

        private static Selector AddRootNode(Entity entity, ReadOnlySpan<char> query, ref int index)
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
#pragma warning disable IDE0078 // Use pattern matching
            (ch >= 'a' && ch <= 'z') ||
            (ch >= 'A' && ch <= 'Z') ||
            (ch >= '0' && ch <= '9') ||
            ch == '_' || ch == '-' ||
            (ch >= 0x80 && ch < 0x10FFFF);

        private static IList<Selector> Parse(Entity entity, ReadOnlySpan<char> query, ref int index, bool allowTrailingContent)
        {
            if (!TryParse(entity, query, ref index, allowTrailingContent, out var selectors, out var exception))
            {
                throw exception;
            }

            return selectors;
        }

#pragma warning restore IDE0078 // Use pattern matching
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

        private static bool TryParse(Entity entity, ReadOnlySpan<char> query, ref int index, bool allowTrailingContent, out IList<Selector> selectors, out QueryParseException exception)
        {
            selectors = new List<Selector>();

            while (index < query.Length)
            {
                var selector = query[index] switch
                {
                    '$' => AddRootNode(entity, query, ref index),
                    '@' => AddLocalNode(ref index),
                    '.' => AddPropertyOrNestedDescentOrRefOrFunction(entity, query, ref index),
                    '[' => AddIndex(entity, query, ref index),
                    char ch when IsValidForPropertyName(ch) && index == 0 => AddPropertyOrNestedDescentOrRefOrFunction(entity, query, ref index, true),
                    _ => null
                };

                if (selector is null)
                {
                    if (allowTrailingContent)
                    {
                        break;
                    }

                    exception = new QueryParseException(index, $"Could not identify selector at index {index}");
                    return false;
                }

                if (selector is ErrorSelector errorSelector)
                {
                    if (allowTrailingContent)
                    {
                        break;
                    }

                    exception = new QueryParseException(index, errorSelector.Message);
                    return false;
                }

                selectors.Add(selector);
            }

            if (selectors.Count == 0)
            {
                exception = new QueryParseException(index, "No query found");
                return false;
            }

            exception = default;
            return true;
        }
        #endregion
    }
}
