using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.Selectors
{
    public interface ISelector
    {
        IEnumerable<EntityDocument> Process(EntityDocument entityDocument);
    }
}
