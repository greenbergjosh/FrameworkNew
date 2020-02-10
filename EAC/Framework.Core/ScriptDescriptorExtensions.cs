using System.Threading.Tasks;

namespace Framework.Core
{
    public static class ScriptDescriptorExtensions
    {
        public static async Task<object> Evaluate(this ScriptDescriptor scriptDescriptor, IGenericEntity state = null)
        {
            var provider = CodeProviderFactory.Get(scriptDescriptor);
            scriptDescriptor = provider.CompileAndCache(scriptDescriptor);
            return await provider.RunFunction(scriptDescriptor.Key, state);
        }
    }
}
