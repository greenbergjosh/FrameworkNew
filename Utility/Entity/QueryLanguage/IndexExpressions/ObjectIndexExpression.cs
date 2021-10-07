using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    public abstract class ObjectIndexExpression : IndexExpression
    {
        public abstract IEnumerable<string> Properties { get; init; }
    }
}
