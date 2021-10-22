using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal class LocalNodeSelector : ISelector
    {
#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public async IAsyncEnumerable<Entity> Process(IEnumerable<Entity> entities)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            foreach (var entity in entities)
            {
                yield return entity;
            }
        }

        public override string ToString() => "@";
    }
}
