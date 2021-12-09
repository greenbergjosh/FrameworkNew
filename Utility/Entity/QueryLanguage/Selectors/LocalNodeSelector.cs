using System.Collections.Generic;
using Utility.Evaluatable;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class LocalNodeSelector : Selector
    {
#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        protected override async IAsyncEnumerable<Entity> Load(EvaluatableSequenceBase selector, Entity targetEntity, EvaluatableRequest request)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            foreach (var entity in targetEntity.Document.EnumerateArray())
            {
                yield return entity;
            }
        }

        public override string ToString() => "@";
    }
}
