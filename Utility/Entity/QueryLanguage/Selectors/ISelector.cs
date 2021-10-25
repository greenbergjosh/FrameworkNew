using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal interface ISelector
    {
        IAsyncEnumerable<Entity> Process(IEnumerable<Entity> entities);
    }
}
