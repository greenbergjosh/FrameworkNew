using System;
using System.Collections.Generic;
using System.Linq;

namespace Utility.Entity.QueryLanguage.Selectors
{
    public class FunctionSelector : ISelector
    {
        private readonly string _functionName;
        private readonly IReadOnlyList<object> _functionArgumentValues;
        private readonly string _query;

        public FunctionSelector(string functionName, IReadOnlyList<(object argument, char? enclosingCharacter)> functionArguments)
        {
            _functionName = functionName ?? throw new ArgumentNullException(nameof(functionName));
            _functionArgumentValues = functionArguments.Select(arg => arg.argument).ToList();
            _query = $"{_functionName}({string.Join<object>(", ", functionArguments.Select(arg => arg.enclosingCharacter.HasValue ? $"{arg.enclosingCharacter}{arg.argument}{arg.enclosingCharacter}" : arg.argument?.ToString()))})";
        }

        public IAsyncEnumerable<Entity> Process(IEnumerable<Entity> entities)
        {
            var functionHandler = entities.FirstOrDefault()?.FunctionHandler;
            if (functionHandler == null)
            {
                throw new InvalidOperationException($"No function handler defined");
            }

            return functionHandler(entities, _functionName, _functionArgumentValues, _query);
        }
    }
}
