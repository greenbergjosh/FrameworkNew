namespace Framework.Core.Entity
{
    public interface IEntityEvalHandler
    {
        Task<(string providerName, Entity providerParameters)> HandleEntity(Entity entity);
    }
}
