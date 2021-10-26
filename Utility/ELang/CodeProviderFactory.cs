using System;
using System.Collections.Concurrent;
using Framework.Core.CodeProviders;

namespace Framework.Core
{
    internal static class CodeProviderFactory
    {
        private static readonly ConcurrentDictionary<string, ICodeProvider> _providers = new ConcurrentDictionary<string, ICodeProvider>();

        internal static ICodeProvider Get(string providerName) => _providers.GetOrAdd(providerName, (name) =>
                                                                            {
                                                                                Type providerType = Type.GetType(name);
                                                                                ICodeProvider provider = (ICodeProvider)Activator.CreateInstance(providerType);

                                                                                return provider;
                                                                            });
    }
}
