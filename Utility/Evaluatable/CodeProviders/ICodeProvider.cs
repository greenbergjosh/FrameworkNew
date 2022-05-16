using System.Threading.Tasks;

namespace Utility.Evaluatable.CodeProviders
{
    public interface IEvalProvider
    {
        Task<EvaluateResponse> Evaluate(EvaluateRequest request);
    }
}
