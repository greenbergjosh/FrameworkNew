using System.Collections.Generic;

namespace Utility.Evaluatable
{
    public interface IEvaluatable
    {
        IAsyncEnumerable<Entity.Entity> Evaluate(Entity.Entity entity);
    }
}
