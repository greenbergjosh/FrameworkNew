namespace Framework.Core.Evaluatable.EvalProviders
{
    public class ConstantEvalProvider : IEvalProvider
    {
        public static string Name => "Constant";

        public Task<EvaluateResponse> Evaluate(Entity.Entity providerParameters, EvaluateRequest request)
        {
            var value = providerParameters;

            return Task.FromResult(new EvaluateResponse(true, value));
        }
    }
}
