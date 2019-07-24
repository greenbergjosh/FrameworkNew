using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace TheGreatWallOfDataLib.Routing
{
    public static class Lbm
    {
        private static FrameworkWrapper _fw;

        public static async Task Initialize(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public static async Task<IGenericEntity> Run(string idOrName, string payload, string identity, HttpContext ctx)
        {
            var id = idOrName.ParseGuid();
            IGenericEntity lbm = null;

            if (id.HasValue) lbm = await _fw.Entities.GetEntity(id.Value);
            else
            {
                lbm = await _fw.Entities.GetEntity("LBM", idOrName);
                id = lbm.GetS("id").ParseGuid();
            }

            if (!id.HasValue) throw new FunctionException(100, $"Function not found {idOrName}");

            await Authentication.CheckPermissions("lbm", id.ToString(), identity, ctx);



            return null;
        }

    }
}