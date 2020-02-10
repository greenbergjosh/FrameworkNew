using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;

namespace Framework.Core.CodeProviders.CSharpStatic
{
    public class CSharpStaticCodeProvider : ICodeProvider
    {
        private static ConcurrentDictionary<string, Lazy<ScriptDescriptor>> _cache 
            = new ConcurrentDictionary<string, Lazy<ScriptDescriptor>>();

        public CSharpStaticCodeProvider(IEnumerable<ScriptDescriptor> initialScripts = null, string defaultDebugDir = null)
        {
            Initialize(initialScripts, defaultDebugDir);
        }

        public void Initialize(IEnumerable<ScriptDescriptor> scripts = null, string defaultDebugDir = null)
        {
            if (scripts != null)
            {
                foreach (var sd in scripts)
                {
                    CompileAndCache(sd);
                }
            }
        }

        public CodeProviderType CodeProviderType => CodeProviderType.CSharpStatic;

        public ScriptDescriptor CompileAndCache(ScriptDescriptor sd)
        {
            return _cache.GetOrAdd(sd.Key, _ =>
            {
                return new Lazy<ScriptDescriptor>(() =>
                {
                    var methodInfo = sd.FunctionContainerType.GetMethod(sd.Name, BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic);
                    if (methodInfo == null)
                        throw new ArgumentException(string.Format("Can not find method [{0}] on type [{1}]", sd.Name, sd.FunctionContainerType));

                    dynamic stateParameter = Expression.Parameter(typeof(IGenericEntity), "s");
                    var expression = Expression.Lambda<Func<IGenericEntity, Task<object>>>(Expression.Call(methodInfo, stateParameter), stateParameter);

                    sd.Static = expression.Compile();

                    return sd;
                });
            }).Value; //Third parameter is used to fix GetOrAdd ambiguity on Func<TKey, TValue>.
        }

        public async Task<object> RunFunction(string fname, IGenericEntity s)
        {
            var f = _cache[fname];
            return await f.Value.Static(s);
        }
    }
}
