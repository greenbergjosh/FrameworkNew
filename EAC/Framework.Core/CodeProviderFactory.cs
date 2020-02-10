using Framework.Core.CodeProviders.CSharpScript;
using Framework.Core.CodeProviders.CSharpStatic;
using System;
using System.Collections.Concurrent;

namespace Framework.Core
{
    internal static class CodeProviderFactory
    {
        private static ConcurrentDictionary<string, ICodeProvider> _providers = new ConcurrentDictionary<string, ICodeProvider>();

        internal static ICodeProvider Get(ScriptDescriptor scriptDescriptor)
        {
            if (scriptDescriptor == null)
                throw new ArgumentNullException(nameof(scriptDescriptor));

            return Get(scriptDescriptor.CodeProviderType);
        }

        internal static ICodeProvider Get(CodeProviderType codeProviderType)
        {
            return Get(codeProviderType.ToString());
        }

        internal static ICodeProvider Get(string providerTypeOrName)
        {
            return _providers.GetOrAdd(providerTypeOrName, (name) =>
            {
                if (Enum.TryParse<CodeProviderType>(name, out var codeProviderType))
                {
                    switch (codeProviderType)
                    {
                        case CodeProviderType.CSharpScript:
                            return new CSharpScriptCodeProvider();

                        case CodeProviderType.CSharpStatic:
                            return new CSharpStaticCodeProvider();

                        default:
                            throw new ArgumentOutOfRangeException(nameof(codeProviderType), codeProviderType.ToString());
                    }
                }

                var providerType = Type.GetType(name);
                if (providerType == null)
                    throw new NullReferenceException(nameof(providerType));

                var provider = (ICodeProvider)Activator.CreateInstance(providerType);
                if (provider == null)
                    throw new NullReferenceException(nameof(provider));

                return provider;
            });
        }
    }
}
