using System;
using System.Collections.Generic;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class ErrorSelector : ISelector
    {
        public string Message { get; init; }

        public ErrorSelector(string message) => Message = message;

        public IAsyncEnumerable<Entity> Process(IEnumerable<Entity> entities) => throw new NotImplementedException();
    }
}
