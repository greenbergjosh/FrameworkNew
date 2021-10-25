using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class NestedDescentSelector : ISelector
    {
        public async IAsyncEnumerable<Entity> Process(IEnumerable<Entity> entities)
        {
            foreach (var entity in entities)
            {
                await foreach (var child in GetChildren(entity))
                {
                    yield return child;
                }
            }
        }

        private static async IAsyncEnumerable<Entity> GetChildren(Entity entity)
        {
            if (entity.Document.IsObject)
            {
                yield return entity;
                foreach (var (name, value) in entity.Document.EnumerateObject())
                {
                    await foreach (var child in GetChildren(value))
                    {
                        yield return child;
                    }
                }
            }
            else if (entity.Document.IsArray)
            {
                yield return entity;
                foreach (var item in entity.Document.EnumerateArray())
                {
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
