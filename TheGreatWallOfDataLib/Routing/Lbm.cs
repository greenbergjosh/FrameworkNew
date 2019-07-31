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
                id = lbm.GetS("LbmId").ParseGuid();
            }
            
            if (!id.HasValue) throw new FunctionException(100, $"LBM not found {idOrName}");

            var codeId = lbm.GetS("LbmId").ParseGuid();

            if (!codeId.HasValue) throw new FunctionException(100, $"LBM code not found {idOrName}\nLBM:\n{lbm.GetS("")}");

            await Authentication.CheckPermissions("lbm", id.ToString(), identity, ctx);

            var code = await _fw.Entities.GetEntity(codeId.Value);

            if(code.GetS("type") != "LBM.CS") throw new FunctionException(100, $"{code.GetS("type")} LBM not supported. {idOrName}\nLBM:\n{lbm.GetS("")}");

            try
            {
                return (IGenericEntity)(await _fw.RoslynWrapper.Evaluate(id.Value, code.GetS("Config"), new { _httpContext = ctx, _payload = payload, _fw, _lbmConfig = lbm.GetS("") }, new StateWrapper()));
            }
            catch (Exception e)
            {
                throw new FunctionException(100,$"LBM execution failed: {idOrName}\nLBM:\n{lbm.GetS("")}\n\n{e.UnwrapForLog()}");
            }
        }

    }
}