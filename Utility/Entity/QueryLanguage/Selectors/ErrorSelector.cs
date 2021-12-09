using System;
using System.Collections.Generic;
using Utility.Evaluatable;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class ErrorSelector : Selector
    {
        public string Message { get; init; }

        public ErrorSelector(string message) => Message = message;

        protected override IAsyncEnumerable<Entity> Load(EvaluatableSequenceBase selector, Entity targetEntity, EvaluatableRequest request) => throw new NotImplementedException();
    }
}
