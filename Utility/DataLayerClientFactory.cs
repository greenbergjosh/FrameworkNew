using System;
using System.Collections.Generic;
using System.Text;

namespace Utility
{
    public class DataLayerClientFactory
    {
        public static Dictionary<string, Func<DataLayerClient>> supportedClients = new Dictionary<string, Func<DataLayerClient>>() {
            { "SqlServer",  () => { return new SqlServerDataLayerClient(); } },
            { "PostgreSQL", () => { return new PostgreSqlDataLayerClient(); } },
        };

        public static DataLayerClient DataStoreInstance(string clientName)
        {
            if (!supportedClients.ContainsKey(clientName))
            {
                throw new ArgumentException($"Client name ({clientName}) not found in list of supported data stores: {string.Join(",", supportedClients.Keys)}");
            }

            return supportedClients[clientName].Invoke();
        }

    }
}
