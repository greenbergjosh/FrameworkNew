using System.Threading.Tasks;

namespace Utility.Evaluatable.CodeProviders
{
    internal class ConstantEvalProvider : IEvalProvider
    {
        public Task<EvaluateResponse> Evaluate(EvaluateRequest request)
        {
            return Task.FromResult(new EvaluateResponse(true, request.Entity, true));
        }
    }
}
