using CSC = Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Framework.Core.CodeProviders.CSharpScript
{
    public class CSharpScriptCodeProvider : DynamicObject, ICodeProvider
    {
        private string _defaultDebugDir;
        private readonly ConcurrentDictionary<string, Lazy<ScriptDescriptor>> _functions
            = new ConcurrentDictionary<string, Lazy<ScriptDescriptor>>();

        public CSharpScriptCodeProvider(IEnumerable<ScriptDescriptor> initialScripts = null, string defaultDebugDir = null)
        {
            Initialize(initialScripts, defaultDebugDir);
        }

        public void Initialize(IEnumerable<ScriptDescriptor> scripts = null, string defaultDebugDir = null)
        {
            _defaultDebugDir = defaultDebugDir;

            if (scripts != null)
            {
                foreach (var sd in scripts)
                {
                    CompileAndCache(sd);
                }
            }
        }

        public CodeProviderType CodeProviderType => CodeProviderType.CSharpScript;

        public override bool TryGetMember(GetMemberBinder binder, out object result)
        {
            if (_functions.ContainsKey(binder.Name))
            {
                result = this[binder.Name];
                return true;
            }
            return base.TryGetMember(binder, out result);
        }

        // Need a way to force a recompile even if the Key is already there
        // Probably just a bool argument called forceRecompile
        public ScriptDescriptor CompileAndCache(ScriptDescriptor sd)
        {
            return _functions.GetOrAdd(sd.Key, _ =>
            {
                return new Lazy<ScriptDescriptor>(() =>
                {
                    var dynamicAssemblies = Regex
                        .Matches(sd.Code, @"#r\s+""([A-Za-z][^ \r\n]+)\.dll""\s*\r\n")
                        .OfType<Match>()
                        .Select(match => Assembly.Load(match.Groups[1].Value)).ToArray();

                    sd.Code = Regex.Replace(sd.Code, "(#r.+\r\n)", "//$1");
                    var scriptOptions = ScriptOptions.Default
                        .AddReferences(
                            Assembly.GetAssembly(typeof(DynamicObject)),  // System.Code
                            Assembly.GetAssembly(typeof(Microsoft.CSharp.RuntimeBinder.CSharpArgumentInfo)),  // Microsoft.CSharp
                            Assembly.GetAssembly(typeof(ExpandoObject)),  // System.Dynamic
                            Assembly.GetAssembly(typeof(Microsoft.AspNetCore.Http.HttpContext)),
                            Assembly.GetAssembly(typeof(JsonWrapper))
                            )
                        .AddReferences(dynamicAssemblies)
                        .AddImports("System.Dynamic", "System.Xml");

                    if (sd.Debug)
                    {
                        scriptOptions = scriptOptions
                            .WithFilePath(GenerateDebugSourceFile(sd))
                            .WithFileEncoding(System.Text.Encoding.UTF8)
                            .WithEmitDebugInformation(true);
                    }

                    var scriptc = CSC.CSharpScript.Create<object>(sd.Code, scriptOptions, globalsType: typeof(Globals));
                    scriptc.Compile();
                    sd.Script = scriptc.CreateDelegate();

                    return sd;
                });
            }).Value;
        }

        public string GenerateDebugSourceFile(ScriptDescriptor sd)
        {
            string srcFile = null;
            if (sd.Debug)
            {
                srcFile = (sd.DebugDir ?? _defaultDebugDir) + "\\" + sd.Key + ".csx";
                File.WriteAllText(srcFile, sd.Code);
            }
            return srcFile;
        }

        public Task<object> Evaluate(string code, IGenericEntity state)
        {
            var (debug, debugDir) = GetDefaultDebugValues();

            return Evaluate(Guid.NewGuid().ToString(), code, state, debug, debugDir);
        }

        public Task<object> Evaluate(string name, string code, IGenericEntity s, bool debug, string debugDir)
        {
            var sd = new ScriptDescriptor(name, code, debug, debugDir);
            sd = CompileAndCache(sd);
            return RunFunction(sd.Key, s);
        }

        private (bool debug, string debugDir) GetDefaultDebugValues()
        {
            var debug = false;

#if DEBUG
            if (System.Diagnostics.Debugger.IsAttached && !_defaultDebugDir.IsNullOrWhitespace())
            {
                debug = true;
                var di = new DirectoryInfo(_defaultDebugDir);

                if (!di.Exists)
                    di.Create();
            }
#endif

            return (debug, _defaultDebugDir);
        }

        public Func<Task<object>> this[string fn] => CreateFunction(fn);

        public Func<Task<object>> this[Guid fn] => CreateFunction(fn.ToString().ToLower());

        public Func<Task<object>> CreateFunction(string fname)
        {
            var type = GetType();
            var methodInfo = type.GetMethod("RunFunction");
            var parameters = methodInfo.GetParameters();
            var parametersArray = new object[1];
            parametersArray[0] = fname;
            return () =>
            {
                var r = (Task<object>)methodInfo.Invoke(this, parametersArray);
                return r;
            };
        }

        public async Task<object> RunFunction(string fname, IGenericEntity s)
        {
            var f = _functions[fname];
            var result = await f.Value.Script(new Globals(s));
            return result;
        }
    }
}
