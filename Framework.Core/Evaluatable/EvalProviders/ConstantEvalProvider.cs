namespace Framework.Core.Evaluatable.EvalProviders
{
    public class ConstantEvalProvider : IEvalProvider
    {
        public static string Name => "Constant";

        // The Constant provider expects providerParameters to be the constant value to return.
        // This avoids the need to do any evaluation of a property (for example: providerParameters.TryGetProperty("value")
        // and gives us our base case to avoid infinite recursion. (Since the above TryGetProperty would eventually evaluate
        // to a Constant again.
        public Task<EvaluateResponse> Evaluate(Entity.Entity providerParameters, EvaluateRequest request)
        {
            var value = providerParameters;
            return Task.FromResult(new EvaluateResponse(true, value));
        }
    }
}
