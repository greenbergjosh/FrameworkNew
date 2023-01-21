using Framework.Core.Entity;
using Framework.Core.Entity.Implementations;

namespace Framework.Core.Evaluatable.EvalProviders
{
    public static class PfaEvalProvider
    {
        public static string Name => "Pfa";

        // The Pfa provider expects two parameters:
        // entity: The entity that will be evaluated
        // parameters: The (potentially partially applied) parameters to pass to `entity`
        public static async Task<EvaluateResponse> Evaluate(Entity.Entity providerParameters, EvaluateRequest request)
        {
            var entity = await providerParameters.Document.GetRequiredProperty("entity");
            var entityParameters = await providerParameters.GetRequiredProperty("parameters", request.Parameters);

            if (request.Parameters.Document is not EntityDocumentStack stack)
            {
                stack = new EntityDocumentStack();
                if (request.Parameters.ValueType != EntityValueType.Undefined)
                {
                    stack.Push(request.Parameters.Document);
                }
            }

            stack.Push(entityParameters.Document);

            var result = await entity.Evaluate(entity.Create(stack));

            _ = stack.Pop();

            return result;
        }
    }
}
