using System.Collections.Generic;

namespace Utility.Evaluatable
{
    public record EvaluateRequest(Entity.Entity Entity, Entity.Entity Parameters, EvaluateMemory Memory = null);

    public record EvaluateMemory(IDictionary<string, Entity.Entity> Historical, IDictionary<string, Entity.Entity> Continual, IDictionary<string, Entity.Entity> Thread, IDictionary<string, Entity.Entity> Process);
}
