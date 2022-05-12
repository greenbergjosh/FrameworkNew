using System.Threading.Tasks;

namespace Utility.Evaluatable
{
    public interface IEvaluatable
    {
        Task<EvaluateResponse> Evaluate(EvaluateRequest request);
    }
}
