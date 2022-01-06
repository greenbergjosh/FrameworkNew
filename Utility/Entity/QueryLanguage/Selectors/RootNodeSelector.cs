using System.Collections.Generic;
using Utility.Evaluatable;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class RootNodeSelector : Selector
    {
        protected override async IAsyncEnumerable<Entity> Load(EvaluatableSequenceBase selector, Entity targetEntity, EvaluateRequest request)
        {
            await foreach (var target in targetEntity.Document.EnumerateArray())
            {
                yield return target.Root;
            }
        }

        public override string ToString() => "$";
    }
}
