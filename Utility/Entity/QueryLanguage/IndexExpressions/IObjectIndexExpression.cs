using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    public interface IObjectIndexExpression : IIndexExpression
    {
        IAsyncEnumerable<string> GetProperties(Entity entity);
    }
}
