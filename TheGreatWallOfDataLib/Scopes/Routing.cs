using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.OpgAuth;
using ScopeKvp = System.Collections.Generic.KeyValuePair<string, System.Collections.Concurrent.ConcurrentDictionary<string, TheGreatWallOfDataLib.Scopes.Routing.ApiFunc>>;
using FuncKvp = System.Collections.Generic.KeyValuePair<string, TheGreatWallOfDataLib.Scopes.Routing.ApiFunc>;
using FuncDic = System.Collections.Concurrent.ConcurrentDictionary<string, TheGreatWallOfDataLib.Scopes.Routing.ApiFunc>;
using ScopeDic = System.Collections.Concurrent.ConcurrentDictionary<string, System.Collections.Concurrent.ConcurrentDictionary<string, TheGreatWallOfDataLib.Scopes.Routing.ApiFunc>>;

namespace TheGreatWallOfDataLib.Scopes
{
    public static class Routing
    {
        private const string DefaultFuncIdent = "*";
        public delegate Task<IGenericEntity> ApiFunc(string scope, string func, string payload, string identity);

        // ToDo: Refactor to use LBMs and config
        private static readonly (string scope, (string funcName, ApiFunc func)[] funcs)[] __ = new[]
        {
            ("config", new [] {
                ("merge", new ApiFunc(async (s, f, p, i) => await Config.Merge(s, p, i)))
            }),
            ("edw", new [] {
                (DefaultFuncIdent, new ApiFunc(async (s, f, p, i) => await Edw.DefaultFunc(s, f, p, i)))
            }),
            ("auth", new []
            {
                ("login", new ApiFunc(async (s, f, p, i) => await Authentication.Login(p))),
                ("userDetails", new ApiFunc(async (s, f, p, i) => await Authentication.GetUserDetails(i)))
            })
        };
        private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, ApiFunc>> CsFuncs =
            new ScopeDic(__.Select(s => new ScopeKvp(s.scope, new FuncDic(s.funcs.Select(f => new FuncKvp(f.funcName, f.func))))));

        public static ApiFunc GetFunc(string scopeName, string funcName)
        {
            // If first char is '_' then function is internal only
            if (scopeName == Auth.ConnName || funcName.IsNullOrWhitespace() || funcName == DefaultFuncIdent || funcName.First() == '_') throw new FunctionException(100, $"Function is an invalid or internal: {funcName.IfNullOrWhitespace("[empty]")}");

            var scope = CsFuncs.GetValueOrDefault(scopeName);
            ApiFunc func = null;

            if (scope != null) func = scope.GetValueOrDefault(funcName) ?? scope?.GetValueOrDefault("*");

            return func ?? DbFunc();
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