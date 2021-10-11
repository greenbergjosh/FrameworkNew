using System.Collections.Generic;
using System.Linq;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal class PropertySelector : ISelector
    {
        private readonly string _name;

        public static PropertySelector Wildcard { get; } = new(null);

        public PropertySelector(string name)
        {
            _name = name;
        }

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public async IAsyncEnumerable<Entity> Process(Entity entity)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
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

                yield break;
            }

            if (entity.Document.IsObject)
            {
                if (entity.Document.TryGetProperty(_name, out var propertyEntity))
                {
                    propertyEntity.Query = $"{entity.Document.Query}.{_name}";

                    yield return propertyEntity;
                    yield break;
                }
            }

            if (_name == "length")
            {
                yield return Entity.Create(entity, new EntityDocumentConstant(entity.Document.Length, EntityValueType.Number, $"{entity.Document.Query}.length"));
            }
        }

        public override string ToString() => $".{_name ?? "*"}";
    }
}
