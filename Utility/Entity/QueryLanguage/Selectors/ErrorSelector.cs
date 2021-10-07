using System;
using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.Selectors
{
    public class ErrorSelector : ISelector
    {
        public string Message { get; init; }

        public ErrorSelector(string message)
        {
            Message = message;
        }

        public IEnumerable<EntityDocument> Process(EntityDocument entityDocument) => throw new NotImplementedException();
    }
}
