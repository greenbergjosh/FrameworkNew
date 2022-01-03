using System.Collections.Generic;
using Utility.Entity;

namespace Utility.Evaluatable
{
    public record EvaluatableRequest(Entity.Entity Entity, Entity.Entity Parameters, ReadOnlyEntity ReadLocation, IDictionary<string, Entity.Entity> WriteLocation);
}
