using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class RootNodeSelector : ISelector
    {
#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public async IAsyncEnumerable<Entity> Process(IEnumerable<Entity> entities, Entity evaluationParameters)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            foreach (var entity in entities)
            {
                yield return entity.Root;
            }
        }

        public override string ToString() => "$";
    }
}
