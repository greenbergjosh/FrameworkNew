using Framework.Core.Entity;

namespace Framework.Core.Evaluatable.EvalProviders
{
    public class DynamicCSharpEvalProvider
    {
        public static string Name => "DynamicCSharp";

        private readonly RoslynWrapper<EvaluateRequest, EvaluateResponse> _roslyn;

        public DynamicCSharpEvalProvider(RoslynWrapper<EvaluateRequest, EvaluateResponse> roslyn) => _roslyn = roslyn;

        public async Task<EvaluateResponse> Evaluate(Entity.Entity providerParameters, EvaluateRequest request)
        {
            var code = await providerParameters.GetRequiredString("code");
            return await _roslyn.Evaluate(code, request);
        }
    }
}
