using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;
using Utility.OpgAuth;
using FuncDic = System.Collections.Concurrent.ConcurrentDictionary<string, TheGreatWallOfDataLib.Routing.Routing.ApiFunc>;
using FuncKvp = System.Collections.Generic.KeyValuePair<string, TheGreatWallOfDataLib.Routing.Routing.ApiFunc>;
using ScopeDic = System.Collections.Concurrent.ConcurrentDictionary<string, System.Collections.Concurrent.ConcurrentDictionary<string, TheGreatWallOfDataLib.Routing.Routing.ApiFunc>>;
using ScopeKvp = System.Collections.Generic.KeyValuePair<string, System.Collections.Concurrent.ConcurrentDictionary<string, TheGreatWallOfDataLib.Routing.Routing.ApiFunc>>;
using Jw = Utility.JsonWrapper;

namespace TheGreatWallOfDataLib.Routing
{
    public static class Routing
    {
        private const string DefaultFuncIdent = "*";
        public delegate Task<IGenericEntity> ApiFunc(string scope, string func, string payload, string identity);

        // ToDo: Refactor to use LBMs and config
        private static readonly (string scope, (string funcName, ApiFunc func)[] funcs)[] __ = new[]
        {
            ("config", new [] {
                ("merge", new ApiFunc((s, f, p, i) => Config.Merge(s, p, i)))
            }),
            ("edw", new [] {
                (DefaultFuncIdent, new ApiFunc((s, f, p, i) => Edw.DefaultFunc(s, f, p, i)))
            }),
            ("rollup182", new [] {
                (DefaultFuncIdent, new ApiFunc(async (s, f, p, i) => await Edw.DefaultFunc(s, f, p, i)))
            }),
            ("auth", new []
            {
                ("login", new ApiFunc(async (s, f, p, i) => await Authentication.Login(p))),
                ("userDetails", new ApiFunc(async (s, f, p, i) => await Authentication.GetUserDetails(i)))
            }),
            ("edw182", new []
            {
                ("getLogs", DbFunc( "err", payload => (args: payload, payload: Jw.Empty) ))
            }),
            ("edw214", new []
            {
                ("getLogs", DbFunc( "err", payload => (args: payload, payload: Jw.Empty) ))
            })
        };
        private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, ApiFunc>> CsFuncs =
            new ScopeDic(__.Select(s => new ScopeKvp(s.scope, new FuncDic(s.funcs.Select(f => new FuncKvp(f.funcName, f.func))))));

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

        private static ApiFunc DbFunc(string errorJsonPath, Func<string, (string args, string payload)> payloadMutation = null, Func<IGenericEntity, JObject> mutateResponse = null)
        {
            return async (scope, funcName, payload, identity) =>
            {
                if (!await Authentication.HasPermissions(scope, funcName, identity)) throw new FunctionException(106, $"Permission denied: Identity: {identity} Scope: {scope} Func: {funcName}");

                IGenericEntity res;

                if (payloadMutation != null)
                {
                    (string args, string payload) ap;

                    try
                    {
                        ap = payloadMutation(payload);
                    }
                    catch (Exception e)
                    {
                        throw new FunctionException(100, "Failed to mutate payload", e);
                    }

                    res = await Data.CallFn(scope, funcName, ap.args, ap.payload);
                }
                else
                {
                    res = await Data.CallFn(scope, funcName, payload: payload);
                }

                if (res?.GetS("").IsNullOrWhitespace() != false) throw new FunctionException(100, "Empty DB response");

                var r = res.GetS(errorJsonPath);

                if (!r.IsNullOrWhitespace()) throw new FunctionException(100, $"Failed db response {res.GetS("")}");

                try
                {

                    if (mutateResponse != null)
                    {
                        var mutated = mutateResponse(res);

                        mutated["r"] = 0;

                        res = Jw.ToGenericEntity(mutated);
                    }
                    else res = Jw.ToGenericEntity(new { r = 0, result = Jw.TryParse(res.GetS("")) });
                }
                catch (Exception e)
                {
                    throw new FunctionException(100, "DB response mutation failed", e);
                }

                return res;
            };
        }

        private static ApiFunc DbFunc()
        {
            return async (scope, funcName, payload, identity) =>
            {
                if (!await Authentication.HasPermissions(scope, funcName, identity)) throw new FunctionException(106, $"Permission denied: Identity: {identity} Scope: {scope} Func: {funcName}");

                var res = await Data.CallFn(scope, funcName, payload: payload);

                if (res == null) throw new FunctionException(100, "Empty DB response");

                var r = res.GetS("r")?.ParseInt();

                if (!r.HasValue) throw new FunctionException(100, $"Invalid db response {res.GetS("")}");

                if (r.Value != 0) throw new FunctionException(r.Value, $"DB response: {res.GetS("")}");

                return res;
            };
        }
    }
}