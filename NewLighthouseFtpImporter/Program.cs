using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NewLighthouseFtpLib;

namespace NewLighthouseFtpImporter
{
    class Program
    {
        public static string cfgConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";
        public static string evtConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";

        static void Main(string[] args)
        {
            string NewLighthouseFtpHost = String.Empty;
            int NewLighthouseFtpPort = 0;
            string NewLighthouseFtpUserName = String.Empty;
            string NewLighthouseFtpPassword = String.Empty;
            string NewLightHouseBaseDir = String.Empty;
            string NewLighthouseFilePattern = String.Empty;

            try
            {
                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "NewLighthouseFtpImporter", "Main", "Starting...", $"");

                Dictionary<string, string> basicConfig = DataLayer.GetBasicConfig(cfgConnectionString, "NewLighthouseFtpImporter").GetAwaiter().GetResult();
                NewLighthouseFtpHost = Utility.GetBasicConfigValue<string>(basicConfig, "Host", "");
                NewLighthouseFtpPort = Utility.GetBasicConfigValue<int>(basicConfig, "Port", 22);
                NewLighthouseFtpUserName = Utility.GetBasicConfigValue<string>(basicConfig, "UserName", "");
                NewLighthouseFtpPassword = Utility.GetBasicConfigValue<string>(basicConfig, "Password", "");
                NewLightHouseBaseDir = Utility.GetBasicConfigValue<string>(basicConfig, "BaseDirectory", @"D:\NewLighthouseFtpStore");

                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "NewLighthouseFtpImporter", "Main", "Configuration...",
                            $"Main: host={NewLighthouseFtpHost}::port={NewLighthouseFtpPort.ToString()}::userName={NewLighthouseFtpUserName}");

                Task t = Task.Run(async () => {
                    await NewLighthouseFtpTasks.DoImport(cfgConnectionString, NewLightHouseBaseDir, NewLighthouseFtpHost,
                                                        NewLighthouseFtpPort, NewLighthouseFtpUserName, NewLighthouseFtpPassword).ConfigureAwait(continueOnCapturedContext: false);
                });
                t.GetAwaiter().GetResult();

                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "NewLighthouseFtpImporter", "Main", "Completed with Success...", $"");
            }
            catch (Exception ex)
            {
                DataLayer.InsertErrorLogSync(cfgConnectionString, 100, "NewLighthouseFtpImporter", "Main", "Exception",
                            $"Main: host={NewLighthouseFtpHost}::port={NewLighthouseFtpPort.ToString()}::userName={NewLighthouseFtpUserName}::{ex.ToString()}");
            }
        }
    }
}

