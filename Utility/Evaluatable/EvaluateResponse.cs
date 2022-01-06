namespace Utility.Evaluatable
{
    public record EvaluateResponse(bool Complete, Entity.Entity Entity = null, bool ProducedResult = false, Entity.Entity Child = null);
}
