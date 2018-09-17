using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;

namespace RoslynWrapper
{
    public class StateWrapper : System.Dynamic.DynamicObject
    {
        public dynamic r = new System.Dynamic.ExpandoObject();
    }

    public class RoslynWrapper : System.Dynamic.DynamicObject
    {
        public string DefaultDebugDir;
        public ConcurrentDictionary<string, ScriptDescriptor> functions = new ConcurrentDictionary<string, ScriptDescriptor>();

        public RoslynWrapper(IEnumerable<ScriptDescriptor> initialScripts, string defaultDebugDir)
        {
            DefaultDebugDir = defaultDebugDir;
            foreach (ScriptDescriptor sd in initialScripts)
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
            ScriptDescriptor sdCached;
            if (functions.TryGetValue(sd.Key, out sdCached))
            {
                return sdCached;
            }

            ScriptOptions scriptOptions = ScriptOptions.Default
                    .AddReferences(
                        Assembly.GetAssembly(typeof(System.Dynamic.DynamicObject)),  // System.Code
                        Assembly.GetAssembly(typeof(Microsoft.CSharp.RuntimeBinder.CSharpArgumentInfo)),  // Microsoft.CSharp
                        Assembly.GetAssembly(typeof(System.Dynamic.ExpandoObject))  // System.Dynamic
                        )
                    .AddImports("System.Dynamic", "System.Xml");
            if (sd.Debug)
            {
                scriptOptions = scriptOptions
                    .WithFilePath(GenerateDebugSourceFile(sd))
                    .WithFileEncoding(System.Text.Encoding.UTF8)
                    .WithEmitDebugInformation(true);
            }
            var scriptc = CSharpScript.Create<object>(sd.Code, scriptOptions, globalsType: typeof(RoslynWrapperGlobals.Globals));
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

        public async Task<object> Evaluate(string code, object parms, StateWrapper state)
        {
            return await Evaluate(null, code, parms, state, false, null);
        }

        public async Task<object> Evaluate(string name, string code, object parms, StateWrapper state, bool debug, string debugDir)
        {
            ScriptDescriptor sd = new ScriptDescriptor(name, code, debug, debugDir);
            sd = CompileAndCache(sd);
            return await RunFunction(sd.Key, parms, state);
        }        

        public Func<object, StateWrapper, Task<object>> this[string fn]
        {
            get
            {
                return CreateFunction(fn);
            }
        }

        public Func<object, StateWrapper, Task<object>> CreateFunction(string fname)
        {
            Type type = this.GetType();
            MethodInfo methodInfo = type.GetMethod("RunFunction");
            ParameterInfo[] parameters = methodInfo.GetParameters();
            object[] parametersArray = new object[3];
            parametersArray[0] = fname;
            return (async (object parms, StateWrapper sw) =>
            {
                parametersArray[1] = parms;
                parametersArray[2] = sw;
                Task<object> r = (Task<object>)methodInfo.Invoke(this, parametersArray);
                return await r;
            });
        }

        public async Task<object> RunFunction(string fname, object parms, StateWrapper state)
        {
            var globals = (state == null) ? new RoslynWrapperGlobals.Globals { f = this, s = new StateWrapper() }
                                          : new RoslynWrapperGlobals.Globals { f = this, s = state };
            globals.st.Push(RoslynWrapperGlobals.StackFrame.CreateStackFrame(parms));
            object result = await functions[fname].Script(globals);
            globals.st.Pop();
            return result;
        }
    }
}
