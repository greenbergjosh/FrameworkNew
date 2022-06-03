using Framework.Core.Entity;

namespace Framework.Core.Evaluatable.EvalProviders
{
    public class DynamicCSharpEvalProvider : IEvalProvider
    {
        private readonly RoslynWrapper<EvaluateRequest, EvaluateResponse> _roslyn;

        public DynamicCSharpEvalProvider(RoslynWrapper<EvaluateRequest, EvaluateResponse> roslyn) => _roslyn = roslyn;

        public async Task<EvaluateResponse> Evaluate(Entity.Entity parameters, EvaluateRequest request)
        {
            var code = await parameters.GetRequiredString("code");
            return await _roslyn.Evaluate(code, request);
        }
    }
}
