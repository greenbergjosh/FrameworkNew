using System;
using System.Collections.Generic;
using System.Linq;
using Utility.Evaluatable;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class FunctionSelector : Selector
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

        protected override async IAsyncEnumerable<Entity> Load(EvaluatableSequenceBase selector, Entity targetEntity, Entity parameters)
        {
            var functionSelector = (FunctionSelector)selector;

            var functionHandler = targetEntity.FunctionHandler;

            var entities = targetEntity.Document.EnumerateArray();

            await foreach (var resultEntity in functionHandler(entities, functionSelector._functionName, functionSelector._functionArguments, functionSelector._query, parameters))
            {
                yield return resultEntity;
            }
        }
    }
}
