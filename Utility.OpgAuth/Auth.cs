using System;
using System.Threading.Tasks;
using Utility.DataLayer;

namespace Utility.OpgAuth
{
    public static class Auth
    {
        private const string Conn = "FW_AuthServer";
        private static string _initError = "Auth not configured";
        private static bool _initialized = false;
        private static FrameworkWrapper _fw = null;

        public static async Task Initialize(FrameworkWrapper fw)
        {
            try
            {
                _fw = fw;
                var conf = GetConfig(false);
                var conn = conf?.GetS("Conn").ParseGuid();

                if (conf != null)
                {
                    if (!conn.HasValue) _initError = "";
                    else
                    {
                        await Data.AddConnectionStrings(new[] {new Tuple<string, string>(Conn, conn.Value.ToString())});
                        // ToDo: Initialize 3rd Party Platforms
                        _initialized = true;
                    }
                }
            }
            catch (Exception e)
            {
                _initError = $"Unhandled Auth init exception: {e.UnwrapForLog()}";
            }
            
            if(!_initialized) throw new Exception(_initError);
        }

        public static async Task DoSomething()
        {
            if(!_initialized) throw new Exception(_initError);
            var conn = Conn;
        }

        private static IGenericEntity GetConfig(bool throwOnNull = true)
        {
            var conf = _fw?.StartupConfiguration.GetE("OpgAuth");

            if(conf == null && throwOnNull) throw new Exception(_initError);

            return conf;
        }
    }
}
