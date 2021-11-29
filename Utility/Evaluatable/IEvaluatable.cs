using System.Threading.Tasks;

namespace Utility.Evaluatable
{
    public interface IEvaluatable
    {
        Task<Entity.Entity> Evaluate(Entity.Entity entity, Entity.Entity parameters);
    }
}
