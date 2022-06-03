namespace Framework.Core.Evaluatable.EvalProviders
{
    public class ConstantEvalProvider : IEvalProvider
    {
        public static string Name => "Constant";

        public async Task<EvaluateResponse> Evaluate(Entity.Entity parameters, EvaluateRequest request)
        {
            var (found, value) = await parameters.TryGetProperty("value");
            if (!found)
            {
                throw new InvalidOperationException($"Expected parameter {nameof(value)}");
            }

            return new EvaluateResponse(true, value);
        }
    }
}
