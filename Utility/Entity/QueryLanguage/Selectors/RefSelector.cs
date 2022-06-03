using System.Collections.Generic;
using Utility.Evaluatable;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class RefSelector : Selector
    {
        protected override async IAsyncEnumerable<Entity> Load(EvaluatableSequenceBase selector, Entity targetEntity, EvaluateRequest request)
        {
            await foreach (var target in targetEntity.Document.EnumerateArray())
            {
                var (found, propertyEntity) = await target.Document.TryGetProperty("$ref");
                if (found)
                {
                    yield return propertyEntity;
                }
            }
        }

        public override string ToString() => ".$ref";
    }
}
