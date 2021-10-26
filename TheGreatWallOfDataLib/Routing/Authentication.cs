using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;
using Utility.GenericEntity;
using Utility.OpgAuth;
using Jw = Utility.JsonWrapper;

namespace TheGreatWallOfDataLib.Routing
{
    public static class Authentication
    {
        private static FrameworkWrapper _fw;

        public static async Task Initialize(FrameworkWrapper fw)
        {
            _fw = fw;
            await Auth.Initialize(fw);
        }

        public static async Task<IGenericEntity> Login(string payload, HttpContext ctx)
        {
            await _fw.Trace(nameof(Login), payload);
            var pl = Jw.JsonToGenericEntity(payload);
            var user = pl.GetS("user");
            var password = pl.GetS("password");

            if (!user.IsNullOrWhitespace() && !password.IsNullOrWhitespace()) throw new FunctionException(106, "User/Pass Auth not implemented");

            var sso = pl.GetD("").Where(s => s.Item1 != "user" && s.Item1 != "password").Select(s => new { ssoKey = s.Item1, payload = Jw.ToGenericEntity(s.Item2) }).FirstOrDefault();

            if (sso == null) throw new FunctionException(106, $"Invalid sso payload {pl?.GetS("")}");

            var userDetails = await Auth.Login(sso.ssoKey, sso.payload, RegistrationValidation.DefaultAutoRegister);

            return Jw.ToGenericEntity(userDetails);
        }

        public static async Task<IGenericEntity> GetUserDetails(string identity, HttpContext ctx)
        {
            await CheckPermissions("auth", "userDetails", identity, ctx);

            return await Auth.GetTokenUserDetails(identity);
        }

        private static string GetSecurable(string scope, string funcName) => $"{scope}.{funcName}";

        public static Task<bool> HasPermissions(string scope, string funcName, string identity, HttpContext ctx) => Auth.HasPermission(identity,GetSecurable(scope, funcName));

        public static async Task CheckPermissions(string scope, string funcName, string identity, HttpContext ctx)
        {
            if (!await HasPermissions(scope, funcName, identity, ctx)) throw new FunctionException(106, Jw.Serialize(new {identity, ip = ctx.Ip(), action = GetSecurable(scope, funcName)}));
        }

    }
}
