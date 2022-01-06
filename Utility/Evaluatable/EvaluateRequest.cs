using System.Collections.Generic;
using Utility.Entity;

namespace Utility.Evaluatable
{
    public record EvaluateRequest(Entity.Entity Entity, Entity.Entity Parameters, IReadOnlyEntity ReadLocation, IDictionary<string, Entity.Entity> WriteLocation);
}
