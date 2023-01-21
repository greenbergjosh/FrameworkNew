using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;
using System.Collections.Concurrent;
using System.Reflection;
using System.Text.RegularExpressions;

namespace Framework.Core
{
    public class RoslynWrapper<TGlobals, TOutput>
    {
        private readonly string _defaultDebugDir;
        private readonly ConcurrentDictionary<string, Lazy<ScriptRunner<TOutput>>> _cache = new();

        public RoslynWrapper(string defaultDebugDir) => _defaultDebugDir = defaultDebugDir;

        public Task<TOutput> Evaluate(string code, TGlobals parms)
        {
            var (debug, debugDir) = GetDefaultDebugValues();
            return Evaluate(code, parms, debug, debugDir);
        }

        public Task<TOutput> Evaluate(string code, TGlobals globals, bool debug, string debugDir)
        {
            CompileAndCache(code, debug, debugDir);
            return RunFunction(code, globals);
        }

        public void ClearCache() => _cache.Clear();

        private (bool debug, string debugDir) GetDefaultDebugValues()
        {
            var debug = false;

#if DEBUG
            if (System.Diagnostics.Debugger.IsAttached && !string.IsNullOrWhiteSpace(_defaultDebugDir))
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

        private async Task<TOutput> RunFunction(string code, TGlobals globals)
        {
            var result = await _cache[code].Value(globals);
            return result;
        }

        private void CompileAndCache(string code, bool debug, string debugDir)
        {
            var update = false;
#if DEBUG
            update = true;
#endif
            Lazy<ScriptRunner<TOutput>> valueFactory(string _) => new(() =>
            {
                var runner = Compile(code, debug, debugDir);
                return runner;
            });

            _cache.AddOrUpdate(code, valueFactory, (_, lazy) => update ? valueFactory(_) : lazy);
        }

        private ScriptRunner<TOutput> Compile(string code, bool debug = false, string? debugDir = null)
        {
            var dynamicAssemblies = Regex.Matches(code, @"#r\s+""([A-Za-z][^ \r\n]+)\.dll""\s*\r\n").Select(match => Assembly.Load(match.Groups[1].Value)).ToArray();

            var referenceReplacedCode = Regex.Replace(code, "(#r.+\r\n)", "//$1");
            var scriptOptions = ScriptOptions.Default.AddReferences(GetType().Assembly).AddReferences(dynamicAssemblies);

            if (debug)
            {
                scriptOptions = scriptOptions
                    .WithFilePath(GenerateDebugSourceFile(Guid.NewGuid().ToString(), referenceReplacedCode, debugDir))
                    .WithFileEncoding(System.Text.Encoding.UTF8)
                    .WithEmitDebugInformation(true);
            }

            var scriptc = CSharpScript.Create<TOutput>(referenceReplacedCode, scriptOptions, globalsType: typeof(TGlobals));
            //_ = scriptc.Compile();
            return scriptc.CreateDelegate();
        }

        private string GenerateDebugSourceFile(string key, string code, string? debugDir)
        {
            var srcFile = $"{debugDir ?? _defaultDebugDir}\\{key}.csx";
            File.WriteAllText(srcFile, code);
            return srcFile;
        }
    }
}
