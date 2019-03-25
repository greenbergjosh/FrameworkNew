using Framework.Core.CodeProviders;
using System;
using System.Collections.Concurrent;

namespace Framework.Core
{
    internal static class CodeProviderFactory
    {
        private static ConcurrentDictionary<string, ICodeProvider> _providers = new ConcurrentDictionary<string, ICodeProvider>();

        internal static ICodeProvider Get(string providerName)
        {
            return _providers.GetOrAdd(providerName, (name) =>
            {
                Type providerType = Type.GetType(name);
                ICodeProvider provider = (ICodeProvider)Activator.CreateInstance(providerType);

                return provider;
            });
        }
    }
}
