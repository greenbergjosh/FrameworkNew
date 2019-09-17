using System;
using System.Linq;
using System.Net;
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

            var userDetails = await Auth.Login(sso.ssoKey, sso.payload, RegistrationValidation.EmailIsAtOnpointglobal);

            await CheckPermissions("auth", "login", userDetails.LoginToken, ctx);
            return Jw.ToGenericEntity(userDetails);
        }

        public static async Task<IGenericEntity> GetUserDetails(string identity, HttpContext ctx)
        {
            await CheckPermissions("auth", "userDetails", identity, ctx);

            return await Auth.GetTokenUserDetails(identity);
        }

        public static async Task CheckPermissions(string scope, string funcName, string identity, HttpContext ctx)
        {
            var ip = ctx.Ip();
            var logMsg = Jw.Serialize(new {identity, ip, action = $"{scope}.{funcName}"});

            if (!await Auth.HasPermission(identity, scope)) throw new FunctionException(106, logMsg);
        }

    }
}
