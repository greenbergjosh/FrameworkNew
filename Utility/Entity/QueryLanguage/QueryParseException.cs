using System;

namespace Utility.Entity.QueryLanguage
{
    public class QueryParseException : Exception
    {
        public int Index { get; init; }

        public QueryParseException(int index, string message) : base(message)
        {
            Index = index;
        }
    }
}
