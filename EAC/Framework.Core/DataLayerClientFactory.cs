using System;
using System.Collections.Generic;

namespace Framework.Core
{
    public class DataLayerClientFactory
    {
        private static readonly IDictionary<string, Func<IDataLayerClient>> SupportedClients =
            new Dictionary<string, Func<IDataLayerClient>>();

        public static void Initialize(params (string Name, Func<IDataLayerClient> Activator)[] clientActivators)
        {
            foreach (var clientActivator in clientActivators)
            {
                SupportedClients.Add(clientActivator.Name, clientActivator.Activator);
            }
        }

        public static IDataLayerClient DataStoreInstance(string clientName)
        {
            if (!SupportedClients.ContainsKey(clientName))
            {
                throw new ArgumentException($"Client name ({clientName}) not found in list of supported data stores: {SupportedClients.Keys.Join(", ")}");
            }

            return SupportedClients[clientName].Invoke();
        }

    }
}
