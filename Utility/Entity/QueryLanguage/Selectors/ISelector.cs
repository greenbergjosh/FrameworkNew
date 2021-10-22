using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.Selectors
{
    public interface ISelector
    {
        IAsyncEnumerable<Entity> Process(IEnumerable<Entity> entities);
    }
}
