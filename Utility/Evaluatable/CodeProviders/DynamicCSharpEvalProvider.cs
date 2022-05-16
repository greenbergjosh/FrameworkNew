using System.Threading.Tasks;

namespace Utility.Evaluatable.CodeProviders
{
    internal class DynamicCSharpEvalProvider : IEvalProvider
    {
        private readonly RoslynWrapper<EvaluateRequest, EvaluateResponse> _roslyn;

        public DynamicCSharpEvalProvider(RoslynWrapper<EvaluateRequest, EvaluateResponse> roslyn) => _roslyn = roslyn;

        public async Task<EvaluateResponse> Evaluate(EvaluateRequest request)
        {
            var code = await request.Entity.EvalS("$evaluate.code");
            return await _roslyn.Evaluate(code, request);
        }
    }
}
