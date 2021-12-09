using System.Threading.Tasks;

namespace Utility.Evaluatable
{
    public interface IEvaluatable
    {
        Task<EvaluatableResponse> Evaluate(EvaluatableRequest request);
    }
}
