using System.Collections.Generic;
using System.Linq;

namespace Utility.Entity.QueryLanguage.Selectors
{
    public class PropertySelector : ISelector
    {
        private readonly string _name;

        public static PropertySelector Wildcard => new(null);

        public PropertySelector(string name)
        {
            _name = name;
        }

        public override string ToString() => $".{_name ?? "*"}";

        public IEnumerable<EntityDocument> Process(EntityDocument entityDocument)
        {
            if (this == Wildcard)
            {
                if (entityDocument.IsObject)
                {
                    foreach (var (name, value) in entityDocument.EnumerateObject())
                    {
                        value.Query = entityDocument.Query + $".{name}";
                        yield return value;
                    }
                }
                else if (entityDocument.IsArray)
                {
                    foreach (var (item, index) in entityDocument.EnumerateArray().Select((item, index) => (item, index)))
                    {
                        item.Query = entityDocument.Query + $".[{index}]";
                        yield return item;
                    }
                }
                else
                {
                    yield break;
                }
            }

            if (!entityDocument.IsObject)
            {
                yield break;
            }

            if (!entityDocument.TryGetProperty(_name, out var propertyEntityDocument))
            {
                yield break;
            }

            propertyEntityDocument.Query = entityDocument.Query + $".{_name}";

            yield return propertyEntityDocument;
        }
    }
}
