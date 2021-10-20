using System.Collections.Generic;
using System.Linq;
using Utility.Entity.QueryLanguage.IndexExpressions;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal class IndexSelector : ISelector
    {
        private readonly IEnumerable<IIndexExpression> _indexes;

        public static IndexSelector Wildcard { get; } = new(null);

        public IndexSelector(IEnumerable<IIndexExpression> indexes) => _indexes = indexes;

        public async IAsyncEnumerable<Entity> Process(Entity entity)
        {
            if (entity.Document.IsArray)
            {
                var arrayLength = entity.Document.Length;

                IEnumerable<int> indexes;
                if (this == Wildcard)
                {
                    indexes = Enumerable.Range(0, arrayLength).ToHashSet();
                }
                else
                {
                    var returnedIndexes = new HashSet<int>();
                    foreach (var indexExpression in _indexes.OfType<IArrayIndexExpression>())
                    {
                        await foreach (var index in indexExpression.GetIndexes(entity))
                        {
                            if (index >= 0 && index < arrayLength)
                            {
                                returnedIndexes.Add(index);
                            }
                        }
                    }

                    indexes = returnedIndexes;
                }

                var matched = entity.Document.EnumerateArray().Select((entity, index) => (entity, index)).Where(item => indexes.Contains(item.index));

                foreach (var match in matched)
                {
                    match.entity.Query = $"{entity.Query}[{match.index}]";
                    yield return match.entity;
                }
            }
            else if (entity.Document.IsObject)
            {
                if (this == Wildcard)
                {
                    foreach (var (name, value) in entity.Document.EnumerateObject())
                    {
                        value.Query = $"{entity.Query}.{name}";
                        yield return value;
                    }
                }
                else
                {
                    var properties = new HashSet<string>();
                    foreach (var indexExpression in _indexes.OfType<IObjectIndexExpression>())
                    {
                        await foreach (var property in indexExpression.GetProperties(entity))
                        {
                            properties.Add(property);
                        }
                    }

                    foreach (var property in properties)
                    {
                        if (entity.Document.TryGetProperty(property, out var value))
                        {
                            value.Query = $"{entity.Query}.{property}";
                            yield return value;
                        }
                    }
                }
            }
            else
            {
                var succeeded = true;
                foreach (var indexExpression in _indexes.OfType<ItemQueryIndexExpression>())
                {
                    if (!await indexExpression.Evaluate(entity))
                    {
                        succeeded = false;
                        break;
                    }
                }

                if (succeeded)
                {
                    yield return entity;
                }
            }
        }

        public override string ToString() => this == Wildcard ? "[*]" : $"[{string.Join(",", _indexes.Select(r => r.ToString()))}]";
    }
}
