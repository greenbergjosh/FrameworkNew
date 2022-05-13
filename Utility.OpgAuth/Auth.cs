using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Threading.Tasks;
using Utility.DataLayer;
using Utility.Entity.Implementations;
using Utility.OpgAuth.Sso;
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
        private static readonly ConcurrentDictionary<string, Platform> SsoPlatforms = new();

        public static async Task Initialize(FrameworkWrapper fw)
        {
            try
            {
                _fw = fw;
                var conf = await GetConfig(false);
                var conn = conf == null ? null : await conf.EvalGuid("Conn", defaultValue: null);

                if (conf != null)
                {
                    if (!conn.HasValue)
                    {
                        _initError = "";
                    }
                    else
                    {
                        var appName = await fw.StartupConfiguration.EvalS("ErrorLogAppName", "");
                        await Data.AddConnectionStrings(fw.Entity.Create(new Dictionary<string, Entity.Entity> { [ConnName] = conn.Value.ToString() }), appName);
                        var ssoFailed = false;

                        SsoPlatforms.Clear();

                        foreach (var sso in await conf.EvalD<Entity.Entity>("Sso", throwIfMissing: false))
                        {
                            var ssoKey = sso.Key;
                            var ssoConf = sso.Value;

                            try
                            {
                                var typeName = await ssoConf.EvalS($"Type");
                                var init = await ssoConf.EvalE($"Initialization");

                                if (typeName.IsNullOrWhitespace())
                                {
                                    throw new AuthException($"Type not defined for SSO {ssoKey}");
                                }

                                if (Assembly.GetExecutingAssembly().CreateInstance(typeName) is not Platform instance)
                                {
                                    throw new AuthException($"Invalid Type for SSO {ssoKey}");
                                }

                                await instance.Init(_fw, init);

                                _ = SsoPlatforms.TryAdd(ssoKey, instance);
                            }
                            catch (AuthException e)
                            {
                                _initError = e.Message;
                                ssoFailed = true;
                                break;
                            }
                            catch (Exception e)
                            {
                                _initError = $"Unhandled Auth SSO exception for {ssoKey}: {e.UnwrapForLog()}";
                                ssoFailed = true;
                                break;
                            }
                        }

                        if (!ssoFailed)
                        {
                            _initialized = true;
                        }
                    }
                }
            }
            catch (Exception e)
            {
                _initError = $"Unhandled Auth init exception: {e.UnwrapForLog()}";
            }

            if (!_initialized)
            {
                throw new AuthException(_initError);
            }
        }

        public static async Task<UserDetails> GetSsoUserDetails(Entity.Entity payload)
        {
            if (!_initialized)
            {
                throw new Exception(_initError);
            }

            _ = SsoPlatforms.TryGetValue(await payload.EvalS("sso"), out var platform);

            return platform == null
                ? throw new AuthFrameworkNotFoundException($"SSO Platform not found: {payload}")
                : await platform.GetUserDetails(payload);
        }

        public static async Task<UserDetails> Login(string ssoKey, Entity.Entity payload, Func<UserDetails, Task<bool>> registrationValidation = null)
        {
            if (!_initialized)
            {
                throw new Exception(_initError);
            }

            _ = SsoPlatforms.TryGetValue(ssoKey, out var platform);

            if (platform == null)
            {
                throw new AuthFrameworkNotFoundException($"SSO Platform not found: {payload}");
            }

            var userDetails = await platform.GetUserDetails(payload);

            var res = await Data.CallFn(ConnName, "SsoLogin", JsonSerializer.Serialize(new { ssoId = userDetails.Id, p = platform.PlatformType, token_duration_h = "24" }));

            if (res == null || await res.EvalAsS("@") == null || !(await res.EvalS("err", defaultValue: null)).IsNullOrWhitespace())
            {
                throw new AuthException($"SSO login failed: Platform: {platform.PlatformType} Payload: {payload} Result: {res?.ToString() ?? "[null]"}");
            }

            if (!(await res.EvalS("t", defaultValue: null)).IsNullOrWhitespace())
            {
                return new UserDetails(loginToken: await res.EvalS("t"), name: await res.EvalS("name"), email: await res.EvalS("primaryemail"), phone: "", imageUrl: await res.EvalS("image"), id: null, raw: res.ToString());
            }
            else if (!(await res.EvalS("uid", defaultValue: null)).IsNullOrWhitespace())
            {
                throw new AuthException($"SSO login failed: Unexpected error condition: Platform: {platform.PlatformType} Payload: {payload} Result: {res}");
            }

            return userDetails.Name.IsNullOrWhitespace()
                ? throw new AuthException("Failed to retrieve name from SSO")
                : userDetails.Email.IsNullOrWhitespace()
                ? throw new AuthException("Failed to retrieve email from SSO")
                : registrationValidation == null || !await registrationValidation(userDetails)
                ? throw new AuthException($"SSO login failed {nameof(registrationValidation)}: Platform: {platform.PlatformType} Payload: {payload} Result: {res}")
                : await RegisterSsoUser(platform, userDetails, payload);
        }

        private static async Task<UserDetails> RegisterSsoUser(Platform platform, UserDetails userDetails, Entity.Entity loginPayload)
        {
            var handle = ToCamelCase(userDetails.Name).IfNullOrWhitespace(userDetails.Email.Split('@').First());
            var altHandles = GenerateAltHandles(handle, new (int digits, int count)[] { (1, -1), (2, -1), (3, 100), (4, 100), (5, 100) });
            var sourceId = Guid.NewGuid().ToString();
            var saltHash = Random.GenerateRandomString(32, 32, Random.hex);
            var initHash = Hashing.ByteArrayToString(Hashing.CalculateSHA1Hash(JsonSerializer.Serialize(new { loginPayload, platform.PlatformType, userDetails })));

            var loginPayloadStacked = new EntityDocumentStack();
            loginPayloadStacked.Push(loginPayload);
            loginPayloadStacked.Push(loginPayload.Create(new { platform = platform.PlatformType }));

            try
            {
                var res = await Data.CallFn(ConnName, "RegisterSsoUser", JsonSerializer.Serialize(userDetails), JsonSerializer.Serialize(new { handle, altHandles, sourceId, saltHash, initHash, sso = loginPayload.Create(loginPayloadStacked) }));
                return (await res.EvalS("t")).IsNullOrWhitespace()
                    ? throw new AuthException($"Unhandled exception in SSO registration:\n\n{platform.PlatformType}\n\nPayload: {loginPayload}\n\nResult: {res}")
                    : new UserDetails(loginToken: await res.EvalS("t"), name: await res.EvalS("name"), email: await res.EvalS("primaryemail"), phone: "", imageUrl: await res.EvalS("image"), id: null, raw: res.ToString());
            }
            catch (Exception e)
            {
                throw new AuthException($"Unhandled exception in SSO registration:\n\n{platform.PlatformType}\n\nPayload: {loginPayload}", e);
            }
        }

        public static async Task<Entity.Entity> GetTokenUserDetails(string token)
        {
            var res = await Data.CallFn(ConnName, "GetTokenUserDetails", JsonSerializer.Serialize(new { t = token }));
            var err = await res.EvalS("err", defaultValue: null);

            return !err.IsNullOrWhitespace()
                ? throw new AuthException($"Failed to get user details from token: Token: {token} Error: {err}")
                : res;
        }

        public static async Task<IEnumerable<string>> GetSecurables()
        {
            var permissions = await Data.CallFn(ConnName, "AllPermissions");
            var res = new List<string>();

            async Task Dive(string rootPath, Entity.Entity tree)
            {
                var divider = rootPath.IsNullOrWhitespace() ? "" : ".";

                foreach (var branch in await tree.EvalD("@"))
                {
                    var path = rootPath + divider + branch.Key;

                    res.Add(path);

                    if (branch.Value.IsObject)
                    {
                        await Dive(path, branch.Value);
                    }
                }
            }

            await foreach (var item in permissions.EvalL("@"))
            {
                if (item.IsObject)
                {
                    await Dive("", item);
                }
            }

            return res.Distinct().OrderBy(s => s).ToArray();
        }

        public static async Task<bool> HasPermission(string token, string securable)
        {
            var res = await Data.CallFn(ConnName, "AllUserPermissions", JsonSerializer.Serialize(new { t = token }));
            var err = await res.EvalS("err", defaultValue: null);

            if (!err.IsNullOrWhitespace())
            {
                throw new AuthException($"Failed to get user permission details: Token: {token} Securable: {securable} Error: {err}");
            }

            var permissions = new Dictionary<string, Entity.Entity>();
            await foreach (var permissionSet in res.EvalL("@"))
            {
                foreach (var kvp in await permissionSet.EvalD("@"))
                {
                    permissions[kvp.Key] = kvp.Value;
                }
            }

            var mergedPermissions = _fw.Entity.Create(permissions);

            if (await mergedPermissions.EvalB(GOD_USER, false))
            {
                return true;
            }

            var steps = securable.Split('.');

            for (var i = 1; i < steps.Length + 1; i++)
            {
                var path = steps.Take(i).Join(".");
                var val = await mergedPermissions.Eval(path).FirstOrDefault();

                if (val == null)
                {
                    return false;
                }

                if (val.ValueType == Entity.EntityValueType.Boolean)
                {
                    return val.Value<bool>();
                }
            }

            return false;
        }

        private static string ToCamelCase(string handle)
        {
            handle = handle?.Trim();

            if (handle.IsNullOrWhitespace())
            {
                return null;
            }

            var parts = handle.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var res = parts[0].Length > 2 ? parts[0][0].ToString().ToLower() + parts[0][1..] : parts[0][0].ToString().ToLower();
            for (var i = 1; i < parts.Length; i++)
            {
                if (parts[i].Length > 2)
                {
                    res += parts[i][0].ToString().ToUpper() + parts[i][1..];
                }
                else
                {
                    res += parts[i][i].ToString().ToLower();
                }
            }

            return res;
        }

        private static IEnumerable<string> GenerateAltHandles(string handle, IEnumerable<(int digits, int count)> cfg)
        {
            var separator = handle.Last().ToString().ParseInt().HasValue ? "_" : "";

            return cfg.SelectMany(c =>
            {
                if (c.count == 0)
                {
                    return Array.Empty<string>();
                }

                if (c.count < 0)
                {
                    var start = (int)Math.Pow(10, c.digits - 1);
                    var end = (int)Math.Pow(10, c.digits);
                    var l = new List<(string handle, Guid sort)>();

                    for (var i = start; i < end; i++)
                    {
                        l.Add(($"{handle}{separator}{i}", Guid.NewGuid()));
                    }

                    return l.OrderBy(x => x.sort).Select(x => x.handle);
                }

                var size = c.digits * c.count;

                return Random.GenerateRandomString(size, size, Random.Digits).Split(c.digits).Distinct().Select(r => $"{handle}{separator}{r}");
            });
        }

        internal static async Task<Entity.Entity> GetConfig(bool throwOnNull = true)
        {
            var conf = await _fw?.StartupConfiguration.Eval("OpgAuth").FirstOrDefault();

            return conf == null && throwOnNull ? throw new Exception(_initError) : conf;
        }
    }
}
