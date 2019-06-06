using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.EntityStoreProviders
{
    interface IEntityStoreProvider
    {
        Task<Entity> GetEntity(Guid entityId);
    }
}
