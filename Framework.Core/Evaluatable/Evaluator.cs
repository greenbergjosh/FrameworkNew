using Framework.Core.Evaluatable.EvalProviders;

namespace Framework.Core.Evaluatable
{
    public class Evaluator
    {
        public EvaluatorConfig EvaluatorConfig { get; init; }

        private Evaluator(EvaluatorConfig config) => EvaluatorConfig = config;

        public static Evaluator Create(EvaluatorConfig config) => new(config);

        public Task<EvaluateResponse> Evaluate(string providerName, Entity.Entity providerParameters, Entity.Entity evaluationParameters)
        {
            if (!EvaluatorConfig.EvalProviders.TryGetValue(providerName, out var provider))
            {
                throw new InvalidOperationException($"No provider with name {providerName}");
            }

            return provider.Evaluate(providerParameters, new EvaluateRequest(this, evaluationParameters));
        }

        public async Task<EvaluateResponse> Evaluate(Entity.Entity entity, Entity.Entity parameters)
        {
            if (entity.Document.EvalHandler == null)
            {
                return new EvaluateResponse(true, entity);
            }

            // TODO: Set up memory and hand it to both the EntityEvalHandler and the EvalProvider

            var (providerName, providerParameters) = await entity.Document.EvalHandler.HandleEntity(entity);

            return await Evaluate(providerName, providerParameters, parameters);
        }
    }
}
