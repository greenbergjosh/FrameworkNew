using System;
using System.Collections.Concurrent;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace Utility
{
    internal class RoslynWrapper
    {
        private class ScriptDescriptor
        {
            public Guid? Id;
            public string Code;
            public bool Debug;
            public string DebugDir;

            public ScriptRunner<object> Script;

            public ScriptDescriptor(Guid? id, string code, bool debug = false, string debugDir = null)
            {
                Id = id;
                Code = code;
                Debug = debug;
                DebugDir = debugDir;
                Key = GetKey();
            }

            public string Key { get; }

            private string GetKey() => Id?.ToString().ToLower() ?? Hashing.Utf8MD5HashAsHexString(Code);
        }

        private readonly string _defaultDebugDir;
        private readonly ConcurrentDictionary<string, Lazy<ScriptDescriptor>> _functions = new();

        public RoslynWrapper(string defaultDebugDir) => _defaultDebugDir = defaultDebugDir;

        public Task<object> Evaluate(Guid id, string code, object parms)
        {
            var (debug, debugDir) = GetDefaultDebugValues();

            return Evaluate(id, code, parms, debug, debugDir);
        }

        public Task<object> Evaluate(Guid id, string code, object parms, bool debug, string debugDir)
        {
            var sd = new ScriptDescriptor(id, code, debug, debugDir);
            sd = CompileAndCache(sd);
            return RunFunction(sd.Key, parms);
        }

        public Task<object> Evaluate(string code, object parms)
        {
            var (debug, debugDir) = GetDefaultDebugValues();
            return Evaluate(code, parms, debug, debugDir);
        }

        public Task<object> Evaluate(string code, object parms, bool debug, string debugDir)
        {
            var sd = new ScriptDescriptor(null, code, debug, debugDir);
            sd = CompileAndCache(sd);
            return RunFunction(sd.Key, parms);
        }

        public void ClearCache() => _functions.Clear();

        private (bool debug, string debugDir) GetDefaultDebugValues()
        {
            var debug = false;

#if DEBUG
            if (System.Diagnostics.Debugger.IsAttached && !_defaultDebugDir.IsNullOrWhitespace())
            {
                debug = true;
                var di = new DirectoryInfo(_defaultDebugDir);

                if (!di.Exists)
                {
                    di.Create();
                }
            }
#endif

            return (debug, _defaultDebugDir);
        }

        private async Task<object> RunFunction(string fname, object parms)
        {
            var globals = new Globals();
            globals.st.Push(StackFrame.CreateStackFrame(parms));
            var result = await _functions[fname].Value.Script(globals);
            return result;
        }

        private ScriptDescriptor CompileAndCache(ScriptDescriptor sd)
        {
            var update = false;
#if DEBUG
            update = true;
#endif
            Lazy<ScriptDescriptor> valueFactory(string _) => new(() =>
            {
                var runner = Compile(sd.Key, sd.Code, sd.Debug, sd.DebugDir);
                sd.Script = runner;
                return sd;
            });

            return _functions.AddOrUpdate(sd.Key, valueFactory, (_, lazy) => update ? valueFactory(_) : lazy).Value;
        }

        private ScriptRunner<object> Compile(string key, string code, bool debug = false, string debugDir = null)
        {
            var dynamicAssemblies = Regex.Matches(code, @"#r\s+""([A-Za-z][^ \r\n]+)\.dll""\s*\r\n").Select(match => Assembly.Load(match.Groups[1].Value)).ToArray();

            code = Regex.Replace(code, "(#r.+\r\n)", "//$1");
            var scriptOptions = ScriptOptions.Default
                .AddReferences(
                    Assembly.GetAssembly(typeof(Enumerable)),  // System.Linq
                    Assembly.GetAssembly(typeof(DynamicObject)),  // System.Code
                    Assembly.GetAssembly(typeof(Microsoft.CSharp.RuntimeBinder.CSharpArgumentInfo)),  // Microsoft.CSharp
                    Assembly.GetAssembly(typeof(ExpandoObject)),  // System.Dynamic
                    GetType().Assembly
                )
                .AddReferences(dynamicAssemblies)
                .AddImports("System.Dynamic", "System.Xml", "System.Linq");

            if (debug)
            {
                scriptOptions = scriptOptions
                    .WithFilePath(GenerateDebugSourceFile(key ?? Guid.NewGuid().ToString(), code, debugDir))
                    .WithFileEncoding(System.Text.Encoding.UTF8)
                    .WithEmitDebugInformation(true);
            }

            var scriptc = CSharpScript.Create<object>(code, scriptOptions, globalsType: typeof(Globals));
            _ = scriptc.Compile();
            return scriptc.CreateDelegate();
        }

        private string GenerateDebugSourceFile(string key, string code, string debugDir)
        {
            var srcFile = $"{debugDir ?? _defaultDebugDir}\\{key}.csx";
            File.WriteAllText(srcFile, code);
            return srcFile;
        }
    }
}
