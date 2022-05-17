using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.Entity.Implementations;

namespace Utility.Evaluatable.CodeProviders
{
    internal class PfaEvalProvider : IEvalProvider
    {
        public async Task<EvaluateResponse> Evaluate(EvaluateRequest request)
        {
            var query = await request.Entity.EvalS("$evaluate.query");
            var parameters = await request.Entity.EvalE("$evaluate.parameters");

            if (request.Parameters.Document is not EntityDocumentStack stack)
            {
                stack = new EntityDocumentStack();
                stack.Push(request.Parameters.Document);
            }

            stack.Push(parameters.Document);

            var result = await request.Entity.Eval(query, request.Entity.Create(stack)).ToList();

            _ = stack.Pop();

            return new EvaluateResponse(true, result.First());
        }
    }
}
