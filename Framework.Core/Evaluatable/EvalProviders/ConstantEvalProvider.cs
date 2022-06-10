using Framework.Core.Entity;

namespace Framework.Core.Evaluatable.EvalProviders
{
    public static class ConstantEvalProvider
    {
        public static string Name => "Constant";

        // The Constant provider expects the parameter "value" to contain the constant value.
        // It goes directly to the EntityDocument to avoid evaluation, thus providing a base-case
        // for evaluation.
        public static async Task<EvaluateResponse> Evaluate(Entity.Entity providerParameters, EvaluateRequest request)
        {
            var value = await providerParameters.Document.GetRequiredProperty("value");
            return new EvaluateResponse(true, value);
        }
    }
}
