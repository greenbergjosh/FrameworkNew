using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal class RefSelector : ISelector
    {
        public async IAsyncEnumerable<Entity> Process(Entity entity)
        {
            if (entity.Document.IsObject)
            {
                var (found, propertyEntity) = await entity.Document.TryGetProperty("$ref");
                if (found)
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
