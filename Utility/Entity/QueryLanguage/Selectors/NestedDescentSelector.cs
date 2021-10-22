using System.Collections.Generic;
using System.Linq;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal class NestedDescentSelector : ISelector
    {
        public IAsyncEnumerable<Entity> Process(Entity entity) => GetChildren(entity);

        private static async IAsyncEnumerable<Entity> GetChildren(Entity entity)
        {
            if (entity.Document.IsObject)
            {
                yield return entity;
                foreach (var (name, value) in entity.Document.EnumerateObject())
                {
                    value.Query = $"{entity.Query}.{name}";
                    await foreach (var child in GetChildren(value))
                    {
                        yield return child;
                    }
                }
            }
            else if (entity.Document.IsArray)
            {
                yield return entity;
                foreach (var (item, index) in entity.Document.EnumerateArray().Select((item, index) => (item, index)))
                {
                    item.Query = $"{entity.Query}[{index}]";
                    await foreach (var child in GetChildren(item))
                    {
                        yield return child;
                    }
                }
            }
            else
            {
                yield return entity;
            }
        }

        public override string ToString() => ".";
    }
}
