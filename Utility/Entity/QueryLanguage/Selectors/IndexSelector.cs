using System.Collections.Generic;
using System.Linq;
using Utility.Entity.QueryLanguage.IndexExpressions;
using Utility.Evaluatable;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class IndexSelector : Selector
    {
        private readonly IEnumerable<IIndexExpression> _indexExpressions;

        public static IndexSelector Wildcard { get; } = new(null);

        public IndexSelector(IEnumerable<IIndexExpression> indexExpressions) => _indexExpressions = indexExpressions;

        protected override async IAsyncEnumerable<Entity> Load(EvaluatableSequenceBase selector, Entity targetEntity, Entity parameters)
        {
            var indexSelector = (IndexSelector)selector;

            foreach (var target in targetEntity.Document.EnumerateArray())
            {
                var matched = Enumerable.Empty<Entity>();

                if (target.Document.IsArray)
                {
                    var arrayLength = target.Document.Length;

                    IEnumerable<int> indexes;
                    // TODO: Replace with Wildcard once evaluator provides state
                    if (indexSelector._indexExpressions == null)
                    {
                        matched = target.Document.EnumerateArray();
                    }
                    else
                    {
                        var returnedIndexes = new HashSet<int>();
                        foreach (var indexExpression in indexSelector._indexExpressions.OfType<IArrayIndexExpression>())
                        {
                            await foreach (var index in indexExpression.GetIndexes(target, parameters))
                            {
                                if (index >= 0 && index < arrayLength)
                                {
                                    _ = returnedIndexes.Add(index);
                                }
                            }
                        }

                        indexes = returnedIndexes;

                        matched = target.Document.EnumerateArray().Select((entity, index) => (entity, index)).Where(item => indexes.Contains(item.index)).OrderBy(match => match.index).Select(match => match.entity);
                    }
                }
                else if (target.Document.IsObject)
                {
                    // TODO: Replace with Wildcard once evaluator provides state
                    if (indexSelector._indexExpressions == null)
                    {
                        matched = target.Document.EnumerateObject().Select(item => item.value);
                    }
                    else
                    {
                        var properties = new HashSet<string>();
                        foreach (var indexExpression in indexSelector._indexExpressions.OfType<IObjectIndexExpression>())
                        {
                            await foreach (var property in indexExpression.GetProperties(target, parameters))
                            {
                                _ = properties.Add(property);
                            }
                        }

                        var items = new List<Entity>();

                        foreach (var property in properties)
                        {
                            var (found, value) = await target.Document.TryGetProperty(property);
                            if (found)
                            {
                                items.Add(value);
                            }
                        }

                        matched = items;
                    }
                }
                else
                {
                    var succeeded = true;
                    foreach (var indexExpression in indexSelector._indexExpressions.OfType<ItemQueryIndexExpression>())
                    {
                        if (!await indexExpression.Evaluate(target, parameters))
                        {
                            succeeded = false;
                            break;
                        }
                    }

                    if (succeeded)
                    {
                        matched = new[] { target };
                    }
                }

                foreach (var match in matched)
                {
                    yield return match;
                }
            }
        }

        // TODO: Replace with Wildcard once evaluator provides state
        public override string ToString() => _indexExpressions == null ? "[*]" : $"[{string.Join(",", _indexExpressions.Select(r => r.ToString()))}]";
    }
}
