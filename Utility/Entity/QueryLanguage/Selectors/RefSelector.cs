using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class RefSelector : ISelector
    {
        public async IAsyncEnumerable<Entity> Process(IEnumerable<Entity> entities, Entity evaluationParameters)
        {
            foreach (var entity in entities)
            {
                if (entity.Document.IsObject)
                {
                    var (found, propertyEntity) = await entity.Document.TryGetProperty("$ref");
                    if (found)
                    {
                        yield return propertyEntity;
                    }
                }
            }
        }

        public override string ToString() => ".$ref";
    }
}
