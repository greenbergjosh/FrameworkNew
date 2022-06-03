using System;

namespace Utility.Evaluatable
{
    public record EvaluateResponse(bool Complete, Entity.Entity Entity, Guid InG = default, Guid OutG = default);
}
