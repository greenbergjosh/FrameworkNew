using System;
using System.Collections.Generic;

namespace Utility.DataLayer
{
    public class DataLayerClientFactory
    {
        public const string SqlServer = "SqlServer";
        public const string PostgreSQL = "PostgreSQL";

        private static readonly Dictionary<string, Func<IDataLayerClient>> _supportedClients = new()
        {
            { SqlServer, () => new SqlServerDataLayerClient() },
            { PostgreSQL, () => new PostgreSqlDataLayerClient() },
        };

        public static IDataLayerClient DataStoreInstance(string clientName) => !_supportedClients.ContainsKey(clientName)
                ? throw new ArgumentException($"Client name ({clientName}) not found in list of supported data stores: {_supportedClients.Keys.Join(", ")}")
                : _supportedClients[clientName].Invoke();
    }
}
