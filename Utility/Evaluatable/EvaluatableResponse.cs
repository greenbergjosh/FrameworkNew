namespace Utility.Evaluatable
{
    public record EvaluatableResponse(bool Complete, Entity.Entity Entity = null, bool ProducedResult = false, Entity.Entity Child = null);
}
