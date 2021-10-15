using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal class RefSelector : ISelector
    {
#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public async IAsyncEnumerable<Entity> Process(Entity entity)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            if (entity.Document.IsObject)
            {
                if (entity.Document.TryGetProperty("$ref", out var propertyEntity))
                {
                    propertyEntity.Query = $"{entity.Document.Query}.$ref";

                    yield return propertyEntity;
                    yield break;
                }
            }
        }

        public override string ToString() => ".$ref";
    }
}
