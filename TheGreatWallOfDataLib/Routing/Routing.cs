﻿using System;
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
        public delegate Task<IGenericEntity> ApiFunc(string scope, string func, string requestArgs, string identity);

        // ToDo: Refactor to use LBMs and config
        private static readonly (string scope, (string funcName, ApiFunc func)[] funcs)[] __ = new[]
        {
            ("config", new [] {
                ("merge", new ApiFunc((s, f, a, i) => Config.Merge(s, a, i)))
            }),
            ("auth", new []
            {
                ("login", new ApiFunc(async (s, f, a, i) => await Authentication.Login(a))),
                ("userDetails", new ApiFunc(async (s, f, a, i) => await Authentication.GetUserDetails(i)))
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

        private static ApiFunc DbFunc()
        {
            return async (scope, funcName, requestArgs, identity) =>
            {
                if (!await Authentication.HasPermissions(scope, funcName, identity)) throw new FunctionException(106, $"Permission denied: Identity: {identity} Scope: {scope} Func: {funcName}");

                var res = await Data.CallFn(scope, funcName, requestArgs);
                var resStr = res?.GetS("");

                if (resStr?.IsNullOrWhitespace() != false) throw new FunctionException(100, "Empty DB response");

                var r = res.GetS("r")?.ParseInt();

                if (!r.HasValue) res = Jw.ToGenericEntity(JObject.FromObject(new { r = 0, result = Jw.TryParse(resStr) }));

                return res;
            };
        }
    }
}