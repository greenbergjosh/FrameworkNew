using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal class RefSelector : ISelector
    {
        public async IAsyncEnumerable<Entity> Process(IEnumerable<Entity> entities)
        {
            foreach (var entity in entities)
            {
                if (entity.Document.IsObject)
                {
                    var (found, propertyEntity) = await entity.Document.TryGetProperty("$ref");
                    if (found)
                    {
                        propertyEntity.Query = $"{entity.Document.Query}.$ref";

                        yield return propertyEntity;
                    }
                }
            }
        }

        public override string ToString() => ".$ref";
    }
}
