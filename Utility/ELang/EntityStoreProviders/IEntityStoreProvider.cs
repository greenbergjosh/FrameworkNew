using System;
using System.Threading.Tasks;

namespace Framework.Core.EntityStoreProviders
{
    internal interface IEntityStoreProvider
    {
        Task<Entity> GetEntity(Guid entityId);
    }
}
