namespace Framework.Core.Entity
{
    public delegate Task<Entity> EntityResolver(Entity baseEntity, Uri entityUri);

    public interface IEntityConfig
    {
        Evaluatable.Evaluator? Evaluator { get; }
        EntityResolver? EntityResolver { get; }
    }
}