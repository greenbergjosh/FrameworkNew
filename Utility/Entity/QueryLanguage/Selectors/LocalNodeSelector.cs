using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.Selectors
{
    public class LocalNodeSelector : ISelector
    {
        public IEnumerable<EntityDocument> Process(EntityDocument entityDocument) => new[] { entityDocument };

        public override string ToString() => "@";
    }
}
