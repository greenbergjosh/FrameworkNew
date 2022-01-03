using System.Collections.Generic;
using Utility.Evaluatable;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class LocalNodeSelector : Selector
    {
        protected override async IAsyncEnumerable<Entity> Load(EvaluatableSequenceBase selector, Entity targetEntity, EvaluatableRequest request)
        {
            await foreach (var entity in targetEntity.Document.EnumerateArray())
            {
                yield return entity;
            }
        }

        public override string ToString() => "@";
    }
}
