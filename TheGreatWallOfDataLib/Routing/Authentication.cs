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
        private static string _mockToken = new Guid().ToString();
        private static string _consoleToken = "4a5571bf-4c18-400b-a314-5c63f7699c28";
        private static string[] _validIps = null;
        private static FrameworkWrapper _fw;

        public static async Task Initialize(FrameworkWrapper fw)
        {
            _fw = fw;
            _validIps = _fw.StartupConfiguration.GetL("Config/IpWhitelist").Select(w => w.GetS("ip") ?? w.GetS("")).Where(w =>
            {
                IPAddress.TryParse(w, out var ip);

                return ip != null;
            }).ToArray();
#if DEBUG
            await Auth.Initialize(fw);
#endif
        }

        public static async Task<IGenericEntity> Login(string payload, HttpContext ctx)
        {
            await _fw.Trace(nameof(Login), payload);
            var pl = Jw.JsonToGenericEntity(payload);
            var user = pl.GetS("user");
            var password = pl.GetS("password");

            if (!user.IsNullOrWhitespace() && !password.IsNullOrWhitespace()) throw new FunctionException(106, "User/Pass Auth not implemented");

#if DEBUG
            var sso = pl.GetD("").Where(s => s.Item1 != "user" && s.Item1 != "password").Select(s => new { ssoKey = s.Item1, payload = Jw.ToGenericEntity(s.Item2) }).FirstOrDefault();

            if (sso == null) throw new FunctionException(106, $"Invalid sso payload {pl?.GetS("")}");

            var token = await Auth.Login(sso.ssoKey, sso.payload);

            return Jw.ToGenericEntity(new { token = _mockToken, name = pl.GetS("google/name"), email = pl.GetS("google/email"), profileImage = pl.GetS("google/imageUrl") });
#else
            await CheckPermissions("auth", "login", _mockToken, ctx);

            if (pl.GetS("google").IsNullOrWhitespace()) throw new FunctionException(106, "Auth not implemented and only Google OAuth is faked");

            return Jw.ToGenericEntity(new { token = _mockToken, name = pl.GetS("google/name"), email = pl.GetS("google/email"), profileImage = pl.GetS("google/imageUrl") });
#endif
        }

        public static async Task<IGenericEntity> GetUserDetails(string identity, HttpContext ctx)
        {
            await CheckPermissions("auth", "userDetails", _mockToken, ctx);

            return Jw.ToGenericEntity(new { name = "Test User", email = "abc@onpointglobal.com", profileImage = "https://picsum.photos/150" });
        }

        public static async Task CheckPermissions(string scope, string funcName, string identity, HttpContext ctx)
        {
            var ip = ctx.Ip();
            var logMsg = Jw.Serialize(new {identity, ip, action = $"{scope}.{funcName}"});

            await _fw.Trace($"{nameof(Authentication)}.{nameof(CheckPermissions)}", logMsg);

            // If permitted continue, else throw
            if (identity != _consoleToken && !(identity == _mockToken && _validIps.Contains(ip))) throw new FunctionException(106, logMsg);
        }

    }
}
