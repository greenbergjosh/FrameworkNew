using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Utility.DataLayer;
using Utility.GenericEntity;
using Utility.OpgAuth.Sso;
using Jw = Utility.JsonWrapper;
using Random = Utility.Crypto.Random;

namespace Utility.OpgAuth
{
    public static class Auth
    {
        public const string ConnName = "FW_AuthServer";
        public const string GOD_USER = "sauron";
        private static string _initError = "Auth not configured";
        private static bool _initialized = false;
        private static FrameworkWrapper _fw = null;
        private static readonly ConcurrentDictionary<string, Platform> SsoPlatforms = new ConcurrentDictionary<string, Platform>();

        public static async Task Initialize(FrameworkWrapper fw)
        {
            try
            {
                _fw = fw;
                var conf = GetConfig(false);
                var conn = conf?.GetS("Conn").ParseGuid();

                if (conf != null)
                {
                    if (!conn.HasValue) _initError = "";
                    else
                    {
                        await Data.AddConnectionStrings(new[] { new Tuple<string, string>(ConnName, conn.Value.ToString()) });
                        var ssoFailed = false;

                        SsoPlatforms.Clear();

                        foreach (var sso in conf.GetD("Sso"))
                        {
                            var key = sso.Item1;

                            try
                            {
                                var typeName = conf.GetS($"Sso/{key}/Type");
                                var init = conf.GetE($"Sso/{key}/Initialization");

                                if (typeName.IsNullOrWhitespace()) throw new AuthException($"Type not defined for SSO {key}");

                                var instance = Assembly.GetExecutingAssembly().CreateInstance(typeName) as Platform;

                                if (instance == null) throw new AuthException($"Invalid Type for SSO {key}");

                                instance.Init(_fw, init);

                                SsoPlatforms.TryAdd(key, instance);
                            }
                            catch (AuthException e)
                            {
                                _initError = e.Message;
                                ssoFailed = true;
                                break;
                            }
                            catch (Exception e)
                            {
                                _initError = $"Unhandled Auth SSO exception for {key}: {e.UnwrapForLog()}";
                                ssoFailed = true;
                                break;
                            }
                        }

                        if (!ssoFailed) _initialized = true;
                    }
                }
            }
            catch (Exception e)
            {
                _initError = $"Unhandled Auth init exception: {e.UnwrapForLog()}";
            }

            if (!_initialized) throw new AuthException(_initError);
        }

        public static async Task<UserDetails> GetSsoUserDetails(IGenericEntity payload)
        {
            if (!_initialized) throw new Exception(_initError);

            SsoPlatforms.TryGetValue(payload.GetS("sso"), out var platform);

            if (platform == null) throw new AuthFrameworkNotFoundException($"SSO Platform not found: {payload.GetS("")}");

            return await platform.GetUserDetails(payload);
        }

        public static async Task<string> VerifyCode(string email, string verificationCode)
        {
            if (!_initialized) throw new Exception(_initError);

            throw new NotImplementedException();
        }

        public static async Task<string> SendVerificationCode(string email)
        {
            if (!_initialized) throw new Exception(_initError);

            throw new NotImplementedException();
        }

        public static async Task<UserDetails> Login(string username, string password)
        {
            if (!_initialized) throw new Exception(_initError);

            throw new NotImplementedException();
        }

        public static async Task<UserDetails> Login(string ssoKey, IGenericEntity payload, Func<UserDetails, bool> registrationValidation = null)
        {
            if (!_initialized) throw new Exception(_initError);

            SsoPlatforms.TryGetValue(ssoKey, out var platform);

            if (platform == null) throw new AuthFrameworkNotFoundException($"SSO Platform not found: {payload.GetS("")}");

            var userDetails = await platform.GetUserDetails(payload);

            var res = await Data.CallFn(ConnName, "SsoLogin", Jw.Serialize(new { ssoId = userDetails.Id, p = platform.PlatformType, token_duration_h = "24" }));

            if (res == null || res.GetS("") == null ||  !res.GetS("err").IsNullOrWhitespace() ) throw new AuthException($"SSO login failed: Platform: {platform.PlatformType} Payload: {payload} Result: {res?.GetS("") ?? "[null]"}");


            if (!res.GetS("t").IsNullOrWhitespace())
            {
                return new UserDetails(loginToken: res.GetS("t"), name: res.GetS("name"), email: res.GetS("primaryemail"), phone: "", imageUrl: res.GetS("image"), id: null, raw: res.GetS(""));
            }
            else if (!res.GetS("uid").IsNullOrWhitespace())
            {
                throw new AuthException($"SSO login failed: Unexpected error condition: Platform: {platform.PlatformType} Payload: {payload} Result: {res?.GetS("") ?? "[null]"}");
            }

            if (userDetails.Name.IsNullOrWhitespace()) throw new AuthException("Failed to retrieve name from SSO");

            if (userDetails.Email.IsNullOrWhitespace()) throw new AuthException("Failed to retrieve email from SSO");

            if (registrationValidation == null || !registrationValidation(userDetails)) throw new AuthException($"SSO login failed {nameof(registrationValidation)}: Platform: {platform.PlatformType} Payload: {payload} Result: {res?.GetS("") ?? "[null]"}");

            return await RegisterSsoUser(platform, userDetails, payload);
        }

        private static async Task<UserDetails> RegisterSsoUser(Platform platform, UserDetails userDetails, IGenericEntity loginPayload)
        {
            var handle = ToCamelCase(userDetails.Name).IfNullOrWhitespace(userDetails.Email.Split('@').First());
            var altHandles = GenerateAltHandles(handle, new (int digits, int count)[] { (1, -1), (2, -1), (3, 100), (4, 100), (5, 100) });
            var sourceId = Guid.NewGuid().ToString();
            var saltHash = Random.GenerateRandomString(32, 32, Random.hex);
            var initHash = Hashing.ByteArrayToString(Hashing.CalculateSHA1Hash(Jw.Serialize(new { loginPayload, platform.PlatformType, userDetails })));

            loginPayload.Set("platform", platform.PlatformType);

            try
            {
                var res = await Data.CallFn(ConnName, "RegisterSsoUser", Jw.Serialize(userDetails), Jw.Serialize(new { handle, altHandles, sourceId, saltHash, initHash, sso = JToken.Parse(loginPayload.GetS("")) }));
                if (res.GetS("t").IsNullOrWhitespace()) throw new AuthException($"Unhandled exception in SSO registration:\n\n{platform.PlatformType}\n\nPayload: {loginPayload}\n\nResult: {res?.GetS("") ?? "[null]"}");

                return new UserDetails(loginToken: res.GetS("t"), name: res.GetS("name"), email: res.GetS("primaryemail"), phone: "", imageUrl: res.GetS("image"), id: null, raw: res.GetS(""));
            }
            catch (Exception e)
            {
                throw new AuthException($"Unhandled exception in SSO registration:\n\n{platform.PlatformType}\n\nPayload: {loginPayload}", e);
            }
        }

        public static async Task<string> RegisterUser(string handle, string email, string password, string verificationCode)
        {
            if (!_initialized) throw new Exception(_initError);

            throw new NotImplementedException();
        }

        public static async Task<IGenericEntity> GetTokenUserDetails(string token)
        {
            var res = await Data.CallFn(ConnName, "GetTokenUserDetails", Jw.Serialize(new { t = token }));
            var err = res.GetS("err");

            if (!err.IsNullOrWhitespace()) throw new AuthException($"Failed to get user details from token: Token: {token} Error: {err}");

            return res;
        }

        public static async Task<IEnumerable<string>> GetSecurables()
        {
            var permissions = JArray.Parse((await Data.CallFn(ConnName, "AllPermissions")).GetS(""));
            var res = new List<string>();

            void Dive(string rootPath, JObject tree)
            {
                var divider = rootPath.IsNullOrWhitespace() ? "" : ".";

                foreach (var branch in tree.Properties())
                {
                    var path = rootPath + divider + branch.Name;

                    res.Add(path);

                    if (branch.Value is JObject jo) Dive(path, jo);
                }
            }

            foreach (var jt in permissions)
            {
                if (jt is JObject jo) Dive("", jo);
            }

            return res.Distinct().OrderBy(s => s).ToArray();
        }

        public static async Task<bool> HasPermission(string token, string securable)
        {
            var res = await Data.CallFn(ConnName, "AllUserPermissions", Jw.Serialize(new { t = token }));
            var err = res.GetS("err");

            if (!err.IsNullOrWhitespace()) throw new AuthException($"Failed to get user permission details: Token: {token} Securable: {securable} Error: {err}");

            JObject final = new JObject();
            res.GetL("").ForEach(perm => { final.Merge(JObject.Parse(perm.GetS(""))); });
            IGenericEntity mergedPermissions = Jw.JsonToGenericEntity(final.ToString());

            if (mergedPermissions.GetB(GOD_USER)) return true;

            var steps = securable.Split('.');

            for (int i = 1; i < steps.Length + 1; i++)
            {
                var path = steps.Take(i).Join("/");
                var val = mergedPermissions.GetS(path);

                if (val == null) return false;

                var hasPermissions = val.ParseBool();

                if (hasPermissions.HasValue) return hasPermissions.Value;
            }

            return false;
        }

        private static string ToCamelCase(string handle)
        {
            handle = handle?.Trim();

            if (handle.IsNullOrWhitespace()) return null;

            var parts = handle.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            string res;

            if (parts[0].Length > 2) res = parts[0][0].ToString().ToLower() + parts[0].Substring(1);
            else res = parts[0][0].ToString().ToLower();

            for (int i = 1; i < parts.Length; i++)
            {
                if (parts[i].Length > 2) res += parts[i][0].ToString().ToUpper() + parts[i].Substring(1);
                else res += parts[i][i].ToString().ToLower();
            }

            return res;
        }

        private static IEnumerable<string> GenerateAltHandles(string handle, IEnumerable<(int digits, int count)> cfg)
        {
            var separator = handle.Last().ToString().ParseInt().HasValue ? "_" : "";

            return cfg.SelectMany(c =>
            {
                if (c.count == 0) return new string[0];

                if (c.count < 0)
                {
                    var start = (int)Math.Pow(10, c.digits - 1);
                    var end = (int)Math.Pow(10, c.digits);
                    var l = new List<(string handle, Guid sort)>();

                    for (int i = start; i < end; i++)
                    {
                        l.Add(($"{handle}{separator}{i}", Guid.NewGuid()));
                    }

                    return l.OrderBy(x => x.sort).Select(x => x.handle);
                }

                var size = c.digits * c.count;

                return Random.GenerateRandomString(size, size, Random.Digits).Split(c.digits).Distinct().Select(r => $"{handle}{separator}{r}");
            });
        }

        internal static IGenericEntity GetConfig(bool throwOnNull = true)
        {
            var conf = _fw?.StartupConfiguration.GetE("Config/OpgAuth");

            if (conf == null && throwOnNull) throw new Exception(_initError);

            return conf;
        }


    }
}
