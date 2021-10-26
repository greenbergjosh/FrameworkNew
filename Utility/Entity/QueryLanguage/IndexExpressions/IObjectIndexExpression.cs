using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    internal interface IObjectIndexExpression : IIndexExpression
    {
        IAsyncEnumerable<string> GetProperties(Entity entity);
    }
}
