using System;
using System.Collections.Generic;

namespace Utility.DataLayer
{
    public class DataLayerClientFactory
    {
        public const string SqlServer = "SqlServer";
        public const string PostgreSQL = "PostgreSQL";

        public static Dictionary<string, Func<IDataLayerClient>> SupportedClients = new Dictionary<string, Func<IDataLayerClient>>() {
            { SqlServer,  () => new SqlServerDataLayerClient()},
            { PostgreSQL, () => new PostgreSqlDataLayerClient()},
        };

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
