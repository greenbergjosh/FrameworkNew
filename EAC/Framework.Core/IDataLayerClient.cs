using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core
{
    public interface IDataLayerClient
    {
        Task<List<Dictionary<string, object>>> CallStoredFunction(IDictionary<string, object> parameters, string sproc, string connectionString, int timeout = 120);
        Task<string> CallStoredFunction(string args, string payload, string sproc, string connectionString, int timeout = 120);
        Task<string> InsertEdwPayload(string connectionString, string payload, int timeout = 120, byte debug = 0);

        Task<string> InsertErrorLog(string connectionString, int sequence, int severity,
            string process, string method, string descriptor, string message, int timeout = 120);

        Task<string> InsertPostingQueue(string connectionString, string postType, DateTime postDate, string payload, int timeout = 120);

        Task<string> BulkInsertPostingQueue(string connectionString, string payload, int timeout = 120);
    }

}
