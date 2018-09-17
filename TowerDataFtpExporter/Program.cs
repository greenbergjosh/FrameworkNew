using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TowerDataFtpLib;

namespace TowerDataFtpExporter
{
    class Program
    {
        public static string cfgConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";
        public static string evtConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";

        public class FtpExportConfiguration
        {
            public string Host;
            public int Port;
            public string Username;
            public string Password;
            public int DelayInDays;
        }

        public class FtpExportConfigurationList
        {
            public List<FtpExportConfiguration> Config;
        }

        static void Main(string[] args)
        {
            string tpConfig = String.Empty;
            string tpDataBaseDir = String.Empty;

            //try
            //{
            //    Task t = Task.Run(async () => {
            //        await TowerDataFtpTasks.ExportData(cfgConnectionString, @"d:\TowerDataFtpStore", "testtd.csv", new DateTime(2017, 3, 26), new DateTime(2017, 3, 27));
            //    });
            //    t.GetAwaiter().GetResult();
            //}
            //catch (Exception exc)
            //{
            //    string s = "break";
            //}
           
            

            try
            {
                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "TowerDataFtpExporter", "Main", "Starting...", $"");

                Dictionary<string, string> basicConfig = DataLayer.GetBasicConfig(cfgConnectionString, "TowerDataFtpExporter").GetAwaiter().GetResult();                
                tpConfig = Utility.GetBasicConfigValue<string>(basicConfig, "Config", "");
                tpDataBaseDir = Utility.GetBasicConfigValue<string>(basicConfig, "BaseDirectory", @"D:\TowerDataFtpStore");

                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "TowerDataFtpExporter", "Main", "Configuration...",
                            $"Main: config={tpConfig}");

                FtpExportConfigurationList configJobs = JsonConvert.DeserializeObject<FtpExportConfigurationList>(tpConfig);

                foreach (FtpExportConfiguration job in configJobs.Config)
                {
                    Task t = Task.Run(async () => {
                        await TowerDataFtpTasks.DoExport(cfgConnectionString, tpDataBaseDir, job.Host, job.Port, job.Username, job.Password, job.DelayInDays);
                    });
                    t.GetAwaiter().GetResult();
                }                

                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "TowerDataFtpExporter", "Main", "Completed with Success...", $"");
            }
            catch (Exception ex)
            {
                DataLayer.InsertErrorLogSync(cfgConnectionString, 100, "TowerDataFtpExporter", "Main", "Exception",
                            $"Main: config={tpConfig}::{ex.ToString()}");
            }
        }
    }
}
