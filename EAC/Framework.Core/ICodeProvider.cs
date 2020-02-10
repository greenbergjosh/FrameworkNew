using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core
{
    public interface ICodeProvider
    {
        CodeProviderType CodeProviderType { get; }
        void Initialize(IEnumerable<ScriptDescriptor> scripts, string defaultDebugDir);
        ScriptDescriptor CompileAndCache(ScriptDescriptor sd);
        Task<object> RunFunction(string fname, IGenericEntity state);
    }
}
