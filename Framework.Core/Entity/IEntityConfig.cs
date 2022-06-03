namespace Framework.Core.Entity
{
    public interface IEntityConfig
    {
        Evaluatable.Evaluator? Evaluator { get; }
    }
}