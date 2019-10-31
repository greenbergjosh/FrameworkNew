using System.Threading.Tasks;
using Utility.DataLayer;

namespace Utility
{
    public static class Staging
    {
        private const string Conn = "Staging";

        public static async Task CreateStagingTableIfDoesntExist(string name, object columns, string prefix = null, string schema = null)
        {
            var args = JsonWrapper.Serialize(new
            {
                schemaName = schema,
                tablePrefix = prefix,
                tableName = name,
                columns = columns
            });
            var result = await Data.CallFn(Conn, "createStagingTableIfDoesntExist", args);
        }

        public static async Task<long> InsertInStagingTable(string name, object values, string prefix = null, string schema = null)
        {
            var args = JsonWrapper.Serialize(new
            {
                schemaName = schema,
                tablePrefix = prefix,
                tableName = name.ToLowerInvariant()
            });
            var payload = JsonWrapper.Serialize(values);
            var result = await Data.CallFn(Conn, "insertInStagingTable", args, payload);
            return long.Parse(result.Get("id").ToString());
        }
    }
}