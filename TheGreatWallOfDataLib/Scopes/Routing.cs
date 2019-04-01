using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using ScopeKvp = System.Collections.Generic.KeyValuePair<string, System.Collections.Concurrent.ConcurrentDictionary<string, TheGreatWallOfDataLib.Scopes.Routing.ApiFunc>>;
using FuncKvp = System.Collections.Generic.KeyValuePair<string, TheGreatWallOfDataLib.Scopes.Routing.ApiFunc>;
using FuncDic = System.Collections.Concurrent.ConcurrentDictionary<string, TheGreatWallOfDataLib.Scopes.Routing.ApiFunc>;
using ScopeDic = System.Collections.Concurrent.ConcurrentDictionary<string, System.Collections.Concurrent.ConcurrentDictionary<string, TheGreatWallOfDataLib.Scopes.Routing.ApiFunc>>;

namespace TheGreatWallOfDataLib.Scopes
{
    public static class Routing
    {
        public delegate Task<IGenericEntity> ApiFunc(FrameworkWrapper fw, string payload, string identity);

        private static readonly (string scope, (string funcName, ApiFunc func)[] funcs)[] __ = new[]
        {
            ("config", new [] {
                ("merge", new ApiFunc(async (fw, p, i) => await Config.Merge(fw, "config", p, i)))
            })
        };
        private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, ApiFunc>> CsFuncs =
            new ScopeDic(__.Select(s => new ScopeKvp(s.scope, new FuncDic(s.funcs.Select(f => new FuncKvp(f.funcName, f.func))))));

        public static ApiFunc GetFunc(string scopeName, string funcName)
        {
            var func = CsFuncs.GetValueOrDefault(scopeName)?.GetValueOrDefault(funcName);

            return func ?? DbFunc(scopeName, funcName);
        }

        private static ApiFunc DbFunc(string scopeName, string funcName)
        {
            return async (fw, payload, identity) =>
            {
                // If first char is '_' then function is internal only
                if (funcName.IsNullOrWhitespace() || funcName.First() == '_') throw new FunctionException(100, $"Function is an invalid or internal: {funcName.IfNullOrWhitespace("[empty]")}");

                var res = await Data.CallFn(scopeName, funcName, identity, payload);

                if (res == null) throw new FunctionException(100, "Empty DB response");

                var r = res.GetS("r")?.ParseInt();

                if (!r.HasValue) throw new FunctionException(100, $"Invalid db response {res.GetS("")}");

                if (r.Value != 0) throw new FunctionException(r.Value, $"DB response: {res.GetS("")}");

                return res;
            };
        }
    }
}