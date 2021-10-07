using System.Collections.Generic;
using Utility.Entity.QueryLanguage.IndexExpressions;

namespace Utility.Entity.QueryLanguage.Tokens
{
    public class IndexToken : Token
    {
        public IEnumerable<IndexExpression> Indexes { get; init; }
        public IndexToken(IEnumerable<IndexExpression> indexes)
        {
            Indexes = indexes;
        }
    }
}
