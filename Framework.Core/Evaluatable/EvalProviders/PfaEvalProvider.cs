using Framework.Core.Entity;
using Framework.Core.Entity.Implementations;

namespace Framework.Core.Evaluatable.EvalProviders
{
    public class PfaEvalProvider : IEvalProvider
    {
        public async Task<EvaluateResponse> Evaluate(Entity.Entity providerParameters, EvaluateRequest request)
        {
            var query = await providerParameters.GetRequiredString("query");
            var (parametersFound, entityParameters) = await providerParameters.TryGetProperty("parameters", request.Parameters);

            if (request.Parameters?.Document is not EntityDocumentStack stack)
            {
                stack = new EntityDocumentStack();
                if (request.Parameters != null)
                {
                    stack.Push(request.Parameters.Document);
                }
            }

            stack.Push(entityParameters.Document);

            var result = Entity.Entity.Undefined;// await request.Entity.Eval(query, request.Entity.Create(stack)).ToList();

            _ = stack.Pop();

            return new EvaluateResponse(true, result);
        }
    }
}
