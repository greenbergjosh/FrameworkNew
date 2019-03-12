using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;

namespace Utility
{

    public class StateWrapper : System.Dynamic.DynamicObject
    {
        public dynamic r = new System.Dynamic.ExpandoObject();
    }

    public class RoslynWrapper : System.Dynamic.DynamicObject
    {
        public string DefaultDebugDir = null;
        public ConcurrentDictionary<string, ScriptDescriptor> functions = new ConcurrentDictionary<string, ScriptDescriptor>();

        public RoslynWrapper(IEnumerable<ScriptDescriptor> initialScripts, string defaultDebugDir)
        {
            DefaultDebugDir = defaultDebugDir;
            foreach (var sd in initialScripts)
            {
                CompileAndCache(sd);
            }
        }

        public override bool TryGetMember(GetMemberBinder binder, out object result)
        {
            if (functions.ContainsKey(binder.Name))
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

            if (functions.TryGetValue(sd.Key, out var sdCached))
            {
                return sdCached;
            }

            var scriptOptions = ScriptOptions.Default
                    .AddReferences(
                        Assembly.GetAssembly(typeof(System.Dynamic.DynamicObject)),  // System.Code
                        Assembly.GetAssembly(typeof(Microsoft.CSharp.RuntimeBinder.CSharpArgumentInfo)),  // Microsoft.CSharp
                        Assembly.GetAssembly(typeof(System.Dynamic.ExpandoObject)),  // System.Dynamic
                        Assembly.GetAssembly(typeof(Microsoft.AspNetCore.Http.HttpContext)),  // TODO: Use Assembly.Load() from db list
                        Assembly.GetAssembly(typeof(Utility.JsonWrapper))
                        )
                    .AddImports("System.Dynamic", "System.Xml");

            if (sd.Debug)
            {
                scriptOptions = scriptOptions
                    .WithFilePath(GenerateDebugSourceFile(sd))
                    .WithFileEncoding(System.Text.Encoding.UTF8)
                    .WithEmitDebugInformation(true);
            }

            var scriptc = CSharpScript.Create<object>(sd.Code, scriptOptions, globalsType: typeof(Globals));
            scriptc.Compile();
            functions[sd.Key] = sd;
            sd.Script = scriptc.CreateDelegate();

            return functions[sd.Key];
        }

        public string GenerateDebugSourceFile(ScriptDescriptor sd)
        {
            string srcFile = null;
            if (sd.Debug)
            {
                srcFile = (sd.DebugDir ?? DefaultDebugDir) + "\\" + sd.Key + ".csx";
                File.WriteAllText(srcFile, sd.Code);
            }
            return srcFile;
        }

        public Task<object> Evaluate(string code, object parms, StateWrapper state)
        {
            var (debug, debugDir) = GetDefaultDebugValues();

            return Evaluate(null, code, parms, state, debug, debugDir);
        }

        public Task<object> Evaluate(string name, string code, object parms, StateWrapper state, bool debug, string debugDir)
        {
            var sd = new ScriptDescriptor(null, name, code, debug, debugDir);
            sd = CompileAndCache(sd);
            return RunFunction(sd.Key, parms, state);
        }

        public Task<object> Evaluate(Guid name, string code, object parms, StateWrapper state)
        {
            var (debug, debugDir) = GetDefaultDebugValues();

            return Evaluate(name.ToString().ToLower(), code, parms, state, debug, debugDir);
        }

        private (bool debug, string debugDir) GetDefaultDebugValues()
        {
            var debug = false;

#if DEBUG
            if (System.Diagnostics.Debugger.IsAttached && !DefaultDebugDir.IsNullOrWhitespace())
            {
                debug = true;
                var di = new DirectoryInfo(DefaultDebugDir);

                if (!di.Exists)
                {
                    di.Create();
                }
            }
#endif

            return (debug, DefaultDebugDir);
        }

        public Func<object, StateWrapper, Task<object>> this[string fn] => CreateFunction(fn);

        public Func<object, StateWrapper, Task<object>> this[Guid fn] => CreateFunction(fn.ToString().ToLower());

        public Func<object, StateWrapper, Task<object>> CreateFunction(string fname)
        {
            var type = GetType();
            var methodInfo = type.GetMethod("RunFunction");
            var parameters = methodInfo.GetParameters();
            var parametersArray = new object[3];
            parametersArray[0] = fname;
            return ((object parms, StateWrapper sw) =>
            {
                parametersArray[1] = parms;
                parametersArray[2] = sw;
                var r = (Task<object>)methodInfo.Invoke(this, parametersArray);
                return r;
            });
        }

        public async Task<object> RunFunction(string fname, object parms, StateWrapper state)
        {
            var globals = (state == null) ? new Globals { f = this, s = new StateWrapper() }
                                          : new Globals { f = this, s = state };
            globals.st.Push(StackFrame.CreateStackFrame(parms));
            var result = await functions[fname].Script(globals);
            globals.st.Pop();
            return result;
        }
    }
}
