using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TowerDataFtpLib;

namespace TowerDataFtpImporter
{
    class Program
    {
        public static string cfgConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";
        public static string evtConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";

        static void Main(string[] args)
        {
            string towerDataFtpHost = String.Empty;
            int towerDataFtpPort = 0;
            string towerDataFtpUserName = String.Empty;
            string towerDataFtpPassword = String.Empty;
            string towerDataBaseDir = String.Empty;
            string towerDataFilePattern = String.Empty;

            try
            {
                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "TowerDataFtpImporter", "Main", "Starting...", $"");

                Dictionary<string, string> basicConfig = DataLayer.GetBasicConfig(cfgConnectionString, "TowerDataFtpImporter").GetAwaiter().GetResult();
                towerDataFtpHost = Utility.GetBasicConfigValue<string>(basicConfig, "Host", "");
                towerDataFtpPort = Utility.GetBasicConfigValue<int>(basicConfig, "Port", 21);
                towerDataFtpUserName = Utility.GetBasicConfigValue<string>(basicConfig, "UserName", "");
                towerDataFtpPassword = Utility.GetBasicConfigValue<string>(basicConfig, "Password", "");
                towerDataBaseDir = Utility.GetBasicConfigValue<string>(basicConfig, "BaseDirectory", @"D:\TowerDataFtpStore");
                towerDataFilePattern = Utility.GetBasicConfigValue<string>(basicConfig, "FilePattern", @"^OPSG_.*\.csv\.gz$");
            
                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "TowerDataFtpImporter", "Main", "Configuration...",
                            $"Main: host={towerDataFtpHost}::port={towerDataFtpPort.ToString()}::userName={towerDataFtpUserName}");

                Task t = Task.Run(async () => {
                    await TowerDataFtpTasks.DoImport(cfgConnectionString, towerDataBaseDir, towerDataFilePattern, towerDataFtpHost,
                                                        towerDataFtpPort, towerDataFtpUserName, towerDataFtpPassword);
                });
                t.GetAwaiter().GetResult();

                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "TowerDataFtpImporter", "Main", "Completed with Success...", $"");
            }
            catch (Exception ex)
            {
                DataLayer.InsertErrorLogSync(cfgConnectionString, 100, "TowerDataFtpImporter", "Main", "Exception",
                            $"Main: host={towerDataFtpHost}::port={towerDataFtpPort.ToString()}::userName={towerDataFtpUserName}::{ex.ToString()}");
            }
        }
    }
}
