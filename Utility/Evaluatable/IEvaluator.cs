using System;
using System.Threading.Tasks;

namespace Utility.Evaluatable
{
    internal interface IEvaluator
    {
        Task<EvaluateResponse> Evaluate(string variableName, Entity.Entity entity, Entity.Entity parameters);
        Task<EvaluateResponse> Evaluate(Guid historicalG, Entity.Entity entity, Entity.Entity parameters);
    }
}
