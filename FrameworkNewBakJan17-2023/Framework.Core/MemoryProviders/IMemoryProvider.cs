namespace Framework.Core.Evaluatable.MemoryProviders
{
    public interface IMemoryProvider
    {
        Task<IDictionary<string, Entity.Entity>> CreateNode(Guid g);
        Task<(bool found, IDictionary<string, Entity.Entity>? memory)> TryDeserialize(Entity.Entity baseEntity, Guid g);
        Task Serialize(Guid g, IDictionary<string, Entity.Entity> memory);
    }
}
