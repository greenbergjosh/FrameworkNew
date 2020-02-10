using Framework.Core.EntityStoreProviders;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core
{
    public static class Store
    {
        #region Private Static Fields
        private static IEntityStoreProvider _entityStore = new JsonEntityStoreProvider();

        #endregion

        #region Public Static Methods
        public static async Task<IGenericEntity> GetEntity(Guid entityId)
        {
            return await _entityStore.GetEntity(entityId);
        }

        public static async Task<IGenericEntity> GetContract(Guid contractId)
        {
            return await _entityStore.GetContract(contractId);
        }

        public static async Task<Guid> GetRelation(Guid entityId, string name)
        {
            return await _entityStore.GetRelation(entityId, name);
        }

        public static async Task<IEnumerable<Guid>> GetRelations(Guid entityId, string name)
        {
            return await _entityStore.GetRelations(entityId, name);
        }
        #endregion
    }
}
