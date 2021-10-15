using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal class RootNodeSelector : ISelector
    {
#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public async IAsyncEnumerable<Entity> Process(Entity entity)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            yield return entity.Root;
        }

        public override string ToString() => "$";
    }
}
