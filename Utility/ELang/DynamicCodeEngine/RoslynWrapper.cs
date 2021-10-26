using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace DynamicCodeEngine
{
    public class RoslynWrapper
    {
        public class Globals
        {
            public dynamic State = new Dictionary<string, object>();
        }

        public Dictionary<string, string> functions = new Dictionary<string, string>();
        public Dictionary<string, Type> functionReturnTypes = new Dictionary<string, Type>();
        //public Dictionary<string, dynamic> typedCompiledFunctions = new Dictionary<string, dynamic>();

        public Dictionary<string, Script> _compiledFunctions = new Dictionary<string, Script>();

        public RoslynWrapper()
        {
            functions.Add("f1", @"State[""thisObject""] + ""SomeMoreString"" + State[""globalObject""].Get(""Account/Login"")");
            functionReturnTypes.Add("f1", Type.GetType("System.String"));
            functions.Add("predTrue", @"true");
            functionReturnTypes.Add("predTrue", Type.GetType("System.Boolean"));

            ScriptOptions scriptOptions = ScriptOptions.Default
                .AddReferences(
                    Assembly.GetAssembly(typeof(System.Dynamic.DynamicObject)),  // System.Code
                    Assembly.GetAssembly(typeof(Microsoft.CSharp.RuntimeBinder.CSharpArgumentInfo)),  // Microsoft.CSharp
                    Assembly.GetAssembly(typeof(System.Dynamic.ExpandoObject)))  // System.Dynamic
                .AddImports("System.Dynamic");

            //MethodInfo mi = typeof(CSharpScript).GetMethods().First(m => m.Name =="Create" && m.IsGenericMethod);

            //foreach (string key in functions.Keys)
            //{
            //    string code = functions[key];
            //    Type t = functionReturnTypes[key];
            //    dynamic script = mi.MakeGenericMethod(t).Invoke(null, new object[] {
            //        code,
            //        scriptOptions,
            //        typeof(Globals),
            //        null
            //    });

            //    script.Compile();
            //    typedCompiledFunctions.Add(key, script);
            //}

            foreach (string key in functions.Keys)
            {
                string code = functions[key];
                Script script = CSharpScript.Create(code, scriptOptions, globalsType: typeof(Globals));
                script.Compile();
                _compiledFunctions.Add(key, script);
            }
        }

        public async Task<object> RunFunction(string fname, object thisObject, object globalObject)
        {
            var globals = new Globals();
            globals.State.Add("thisObject", (dynamic)thisObject);
            globals.State.Add("globalObject", (dynamic)globalObject);
            ScriptState result = await _compiledFunctions[fname].RunAsync(globals);
            return result.ReturnValue;
        }

        //public async Task<T> RunFunction<T>(string fname, string thisObject, object globalObject)
        //{
        //    var globals = new Globals();
        //    globals.State.Add("thisObject", (dynamic)thisObject);
        //    globals.State.Add("globalObject", (dynamic)globalObject);
        //    dynamic result = await typedCompiledFunctions[fname].RunAsync(globals);
        //    return (T)result.ReturnValue;
        //}
    }
}
