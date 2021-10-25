using System;
using System.Collections.Generic;
using System.Linq;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class FunctionSelector : ISelector
    {
        private readonly string _functionName;
        private readonly IReadOnlyList<Entity> _functionArguments;
        private readonly string _query;

        public FunctionSelector(string functionName, IReadOnlyList<Entity> functionArguments)
        {
            _functionName = functionName ?? throw new ArgumentNullException(nameof(functionName));
            _functionArguments = functionArguments;
            _query = $"{_functionName}({string.Join<object>(", ", functionArguments.Select(arg => arg.Query))})";
        }

        public IAsyncEnumerable<Entity> Process(IEnumerable<Entity> entities)
        {
            var functionHandler = entities.FirstOrDefault()?.FunctionHandler;
            if (functionHandler is null)
            {
                throw new InvalidOperationException($"No function handler defined");
            }

            return functionHandler(entities, _functionName, _functionArguments, _query);
        }
    }
}
