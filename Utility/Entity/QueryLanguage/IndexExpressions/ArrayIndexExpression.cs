using System;
using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    public abstract class ArrayIndexExpression : IndexExpression
    {
        public abstract IEnumerable<int> GetIndexes(int arrayLength);
    }
}
