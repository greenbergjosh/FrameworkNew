using System.Collections.Generic;
using Utility.Evaluatable;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class RootNodeSelector : Selector
    {
#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        protected override async IAsyncEnumerable<Entity> Load(EvaluatableSequenceBase selector, Entity targetEntity, Entity parameters)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            foreach (var target in targetEntity.Document.EnumerateArray())
            {
                yield return target.Root;
            }
        }

        public override string ToString() => "$";
    }
}
