using Microsoft.CodeAnalysis.Scripting;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Framework.Core
{
    public class ScriptDescriptor
    {
        public string Name { get; }
        public bool Debug { get; }
        public string DebugDir { get; }
        public string CodeProviderType { get; }
        public Type FunctionContainerType { get; }
        public string Code { get; set; }

        public ScriptRunner<object> Script;
        public Func<IGenericEntity, Task<object>> Static;

        private string _key = null;

        public ScriptDescriptor(string name, string code, bool debug, string debugDir)
        {
            Name = name;
            Code = code;
            Debug = debug;
            DebugDir = debugDir;
            _key = null;
            CodeProviderType = Core.CodeProviderType.CSharpScript.ToString();
        }

        public ScriptDescriptor(IGenericEntity evaluateConfiguration)
        {
            if (evaluateConfiguration == null)
                throw new ArgumentNullException(nameof(evaluateConfiguration));

            var code = evaluateConfiguration.Get<string>(Keywords.Code, null);
            if (code != null)
            {
                Name = evaluateConfiguration.Get<string>(Keywords.Name, null);
                Code = code;
                Debug = evaluateConfiguration.Get(Keywords.Debug, false);
                DebugDir = evaluateConfiguration.Get<string>(Keywords.DebugDir, null);
                CodeProviderType = Core.CodeProviderType.CSharpScript.ToString();
            }
            else
            {
                var implementation = evaluateConfiguration.Get<string>(Keywords.Implementation, null);
                if (implementation == null)
                    throw new ArgumentException("Unknown script type.", nameof(evaluateConfiguration));

                var values = implementation.Split(',').Select(s => s.Trim()).ToArray();
                FunctionContainerType = Type.GetType(values[0]);
                if (FunctionContainerType == null)
                    throw new ArgumentException($"Can not find type [{values[0]}].");

                Name = values[1];
                Debug = true;
                _key = implementation;
                CodeProviderType = Core.CodeProviderType.CSharpStatic.ToString();
            }
        }

        public string Key
        {
            get
            {
                if (_key == null) _key = Name?.ToLower() ?? Hashing.Utf8MD5HashAsHexString(Code);
                return _key;
            }
        }
    }
}
