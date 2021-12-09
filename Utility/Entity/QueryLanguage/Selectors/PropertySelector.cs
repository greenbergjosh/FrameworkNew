using System.Collections.Generic;
using System.Linq;
using Utility.Entity.Implementations;
using Utility.Evaluatable;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class PropertySelector : Selector
    {
        private readonly string _name;

        public static PropertySelector Wildcard { get; } = new(null);

        public PropertySelector(string name) => _name = name;

        protected override async IAsyncEnumerable<Entity> Load(EvaluatableSequenceBase selector, Entity targetEntity, EvaluatableRequest request)
        {
            var propertySelector = (PropertySelector)selector;

            var matched = new List<Entity>();

            foreach (var target in targetEntity.Document.EnumerateArray())
            {
                // TODO: Replace with Wildcard once evaluator provides state
                if (propertySelector._name == null)
                {
                    if (target.Document.IsObject)
                    {
                        matched.AddRange(target.Document.EnumerateObject().Select(property => property.value));
                    }
                    else if (target.Document.IsArray)
                    {
                        matched.AddRange(target.Document.EnumerateArray());
                    }
                }
                else if (target.Document.IsObject)
                {
                    var (found, propertyEntity) = await target.Document.TryGetProperty(propertySelector._name);
                    if (found)
                    {
                        matched.Add(propertyEntity);
                    }
                }
                else if (propertySelector._name == "length")
                {
                    matched.Add(target.Create(new EntityDocumentConstant(target.Document.Length, EntityValueType.Number), $"{target.Query}.length", target));
                }
            }

            foreach (var match in matched)
            {
                yield return match;
            }
        }

        public override string ToString() => $".{_name ?? "*"}";
    }
}
