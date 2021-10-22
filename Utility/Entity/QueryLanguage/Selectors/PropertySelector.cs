using System.Collections.Generic;
using System.Linq;
using Utility.Entity.Implementations;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal class PropertySelector : ISelector
    {
        private readonly string _name;

        public static PropertySelector Wildcard { get; } = new(null);

        public PropertySelector(string name) => _name = name;

        public async IAsyncEnumerable<Entity> Process(IEnumerable<Entity> entities)
        {
            foreach (var entity in entities)
            {
                if (this == Wildcard)
                {
                    if (entity.Document.IsObject)
                    {
                        foreach (var (name, value) in entity.Document.EnumerateObject())
                        {
                            value.Query = $"{entity.Document.Query}.{name}";
                            yield return value;
                        }
                    }
                    else if (entity.Document.IsArray)
                    {
                        foreach (var (item, index) in entity.Document.EnumerateArray().Select((item, index) => (item, index)))
                        {
                            item.Query = $"{entity.Document.Query}.[{index}]";
                            yield return item;
                        }
                    }
                }
                else if (entity.Document.IsObject)
                {
                    var (found, propertyEntity) = await entity.Document.TryGetProperty(_name);
                    if (found)
                    {
                        propertyEntity.Query = $"{entity.Document.Query}.{_name}";

                        yield return propertyEntity;
                    }
                }
                else if (_name == "length")
                {
                    yield return entity.Create(new EntityDocumentConstant(entity.Document.Length, EntityValueType.Number, $"{entity.Document.Query}.length"));
                }
            }
        }

        public override string ToString() => $".{_name ?? "*"}";
    }
}
