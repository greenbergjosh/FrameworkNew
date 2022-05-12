using System;
using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    internal interface IArrayIndexExpression : IIndexExpression
    {
        IAsyncEnumerable<int> GetIndexes(Entity entity, Entity evaluationParameters);

        protected static string IndexToPath(Index index) => index.IsFromEnd ? $"-{index.Value}" : index.Value.ToString();
    }
}
