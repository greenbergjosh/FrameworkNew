using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    public interface IArrayIndexExpression : IIndexExpression
    {
        IAsyncEnumerable<int> GetIndexes(Entity entity);
    }
}
