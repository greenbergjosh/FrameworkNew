using System.Collections.Generic;
using Utility.Entity;

namespace Utility.Evaluatable
{
    public record EvaluateRequest(Entity.Entity Entity, Entity.Entity Parameters);
}
