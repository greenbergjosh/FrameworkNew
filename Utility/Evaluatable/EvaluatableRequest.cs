namespace Utility.Evaluatable
{
    public record EvaluatableRequest(Entity.Entity Entity, Entity.Entity Parameters, Entity.Entity ChildResult = null);
}
