namespace Framework.Core.Evaluatable
{
    public class Evaluator
    {
        public EvaluatorConfig EvaluatorConfig { get; init; }

        private Evaluator(EvaluatorConfig config) => EvaluatorConfig = config;

        public static Evaluator Create(EvaluatorConfig config) => new(config);

        public Task<EvaluateResponse> Evaluate(string providerName, Entity.Entity providerParameters, Entity.Entity evaluationParameters)
        {
            if (!EvaluatorConfig.EvalProviders.TryGetValue(providerName, out var evaluate))
            {
                throw new InvalidOperationException($"No provider with name {providerName}");
            }

            return evaluate(providerParameters, new EvaluateRequest(this, evaluationParameters));
        }
    }
}
