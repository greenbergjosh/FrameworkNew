using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.EntityStoreProviders
{
    interface IEntityStoreProvider
    {
        Task<IGenericEntity> GetEntity(Guid entityId);
        Task<IGenericEntity> GetContract(Guid contractId);
        Task<Guid> GetRelation(Guid entityId, string relation);
        Task<IEnumerable<Guid>> GetRelations(Guid entityId, string relation);
    }
}
