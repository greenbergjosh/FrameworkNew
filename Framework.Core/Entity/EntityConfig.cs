namespace Framework.Core.Entity
{
    public record EntityConfig(Evaluatable.Evaluator? Evaluator) : IEntityConfig;
}
