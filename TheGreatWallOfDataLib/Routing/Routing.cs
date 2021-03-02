using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;
using Utility.OpgAuth;
using FuncDic = System.Collections.Concurrent.ConcurrentDictionary<string, TheGreatWallOfDataLib.Routing.Routing.ApiFunc>;
using FuncKvp = System.Collections.Generic.KeyValuePair<string, TheGreatWallOfDataLib.Routing.Routing.ApiFunc>;
using Jw = Utility.JsonWrapper;
using ScopeDic = System.Collections.Concurrent.ConcurrentDictionary<string, System.Collections.Concurrent.ConcurrentDictionary<string, TheGreatWallOfDataLib.Routing.Routing.ApiFunc>>;
using ScopeKvp = System.Collections.Generic.KeyValuePair<string, System.Collections.Concurrent.ConcurrentDictionary<string, TheGreatWallOfDataLib.Routing.Routing.ApiFunc>>;

namespace TheGreatWallOfDataLib.Routing
{
    public static class Routing
    {
        private static FrameworkWrapper _fw;
        private const string DefaultFuncIdent = "*";
        public delegate Task<IGenericEntity> ApiFunc(string scope, string func, string requestArgs, string identity, HttpContext ctx);

        // ToDo: Refactor to use config?
        private static readonly (string scope, (string funcName, ApiFunc func)[] funcs)[] __ = new[]
        {
            ("config", new [] {
                ("merge", new ApiFunc((s, f, a, i, ctx) => Config.Merge(s, a, i, ctx)))
            }),
            ("auth", new []
            {
                ("login", new ApiFunc(async (s, f, a, i, ctx) => await Authentication.Login(a, ctx))),
                ("userDetails", new ApiFunc(async (s, f, a, i, ctx) => await Authentication.GetUserDetails(i, ctx))),
                ("hasPermissions", new ApiFunc(async (s, f, a, i, ctx) => Jw.ToGenericEntity( new { hasPermission = await Auth.HasPermission(i, a) })))
            }),
            ("lbm",new [] {
                ("*", new ApiFunc((s, f, a, i, ctx) => Lbm.Run(f, a, i, ctx)))
            }),
            ("test", new [] {("*",  (ApiFunc) RunTests )})
        };
        private static readonly ScopeDic CsFuncs = new ScopeDic(__.Select(s => new ScopeKvp(s.scope, new FuncDic(s.funcs.Select(f => new FuncKvp(f.funcName, f.func))))));

        public static Task Initialize(FrameworkWrapper fw)
        {
            _fw = fw;
            return Task.CompletedTask;
        }

        public static ApiFunc GetFunc(string scopeName, string funcName)
        {
            // If first char is '_' then function is internal only
            if (scopeName == Auth.ConnName || funcName.IsNullOrWhitespace() || funcName == DefaultFuncIdent || funcName.First() == '_')
            {
                throw new FunctionException(100, $"Function is an invalid or internal: {funcName.IfNullOrWhitespace("[empty]")}");
            }

            var scope = CsFuncs.GetValueOrDefault(scopeName);
            ApiFunc func = null;

            if (scope != null)
            {
                func = scope.GetValueOrDefault(funcName) ?? scope?.GetValueOrDefault("*");
            }

            return func ?? DbFunc();
        }

        private static ApiFunc DbFunc()
        {
            return async (scope, funcName, requestArgs, identity, ip) =>
            {
                await Authentication.CheckPermissions(scope, funcName, identity, ip);

                // Check if requestArgs is JSON (which is should be since we're passing it to CallFn
                // If it is JSON and have only 2 properties (args, payload), then grab them and pass
                // them both to CallFn in the matching parameters.
                // Otherwise, continue to just pass the entire requestArgs in as args.
                var args = requestArgs;
                string payload = null;
                try
                {
                    var request = JToken.Parse(requestArgs);
                    if (request is JObject obj
                        && obj.Count == 2
                        && obj["args"] != null
                        && obj["payload"] != null
                    )
                    {
                        args = obj["args"].ToString();
                        payload = obj["payload"].ToString();
                    }
                }
                catch { }

                var res = await Data.CallFn(scope, funcName, args, payload);
                var resStr = res?.GetS("");

                if (resStr?.IsNullOrWhitespace() != false) throw new FunctionException(100, "Empty DB response");

                var r = res.GetS("r")?.ParseInt();

                if (!r.HasValue) res = Jw.ToGenericEntity(JObject.FromObject(new { r = 0, result = Jw.TryParse(resStr) }));

                return res;
            };
        }

        private static async Task<IGenericEntity> RunTests(string scope, string func, string requestArgs, string identity, HttpContext ctx)
        {
            var errors = new List<string>();
            var stats = new Dictionary<string, double>();
            var sw = Stopwatch.StartNew();

            await _fw.Log(scope, "Starting tests");

            try
            {
                const string conn = "signal";
                const string inSignalGroups = "inSignalGroups";
                const string suppressIp = "suppressIp";

                var res = await Data.CallFn(conn, inSignalGroups, _fw.StartupConfiguration.GetS("Config/Tests/signal:inSignalGroups"));

                sw.Restart(() => stats.Add(inSignalGroups, sw.Elapsed.TotalSeconds));
                var resArr = res?.GetL("in");

                if (resArr?.Any() != true) errors.Add($"{inSignalGroups} failed. Result: {res?.GetS("")}");
                res = await Data.CallFn(conn, suppressIp, _fw.StartupConfiguration.GetS("Config/Tests/signal:suppressIp"));
                sw.Restart(() => stats.Add(suppressIp, sw.Elapsed.TotalSeconds));

                if (res?.GetS("suppress").ParseBool() != true) errors.Add($"{suppressIp} failed. Result: {res?.GetS("")}");
            }
            catch (Exception e)
            {
                errors.Add($"Tests failed. {e.UnwrapForLog()}");
            }

            if (errors.Any()) throw new FunctionException(3, Jw.Serialize(new { stats, errors }), true);

            await _fw.Log(scope, Jw.Serialize(new { stats }));
            await _fw.Log(scope, "Tests complete");

            return Jw.ToGenericEntity(new { result = "All Ok" });
        }

    }
}