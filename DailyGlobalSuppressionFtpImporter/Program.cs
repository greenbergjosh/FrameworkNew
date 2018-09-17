using DailyGlobalSuppressionFtpLib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DailyGlobalSuppressionFtpImporter
{
    class Program
    {
        public static string cfgConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";
        public static string evtConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";

        static void Main(string[] args)
        {
            //Task t1 = Task.Run(async () => {
            //    await DailyGlobalSuppressionFtpImporterTasks.DownloadFile(@"D:\DailyGlobalSuppressionFtpStore", "test.txt", "Blacklist_20170201.txt", "cc1141.com",
            //                                        "LmmToComplaint", "L3SRVjyT");
            //});
            //Task t1 = Task.Run(async () => {
            //    await DailyGlobalSuppressionFtpImporterTasks.DoDownload(cfgConnectionString, @"D:\DailyGlobalSuppressionFtpStore", @"^Blacklist_.*\.txt$", 1,
            //        "cc1141.com", 21, "LmmToComplaint", "L3SRVjyT");
            //});
            //t1.GetAwaiter().GetResult();

            string dailyDataFtpHost = String.Empty;
            int dailyDataFtpPort = 0;
            string dailyDataFtpUserName = String.Empty;
            string dailyDataFtpPassword = String.Empty;
            string dailyDataBaseDir = String.Empty;

            try
            {
                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "DailyGlobalSuppressionFtpImporter", "Main", "Starting...", $"");

                Dictionary<string, string> basicConfig = DataLayer.GetBasicConfig(cfgConnectionString, "DailyGlobalSuppressionFtpImporter").GetAwaiter().GetResult();
                dailyDataFtpHost = Utility.GetBasicConfigValue<string>(basicConfig, "Host", "");
                dailyDataFtpPort = Utility.GetBasicConfigValue<int>(basicConfig, "Port", 22);
                dailyDataFtpUserName = Utility.GetBasicConfigValue<string>(basicConfig, "UserName", "");
                dailyDataFtpPassword = Utility.GetBasicConfigValue<string>(basicConfig, "Password", "");
                dailyDataBaseDir = Utility.GetBasicConfigValue<string>(basicConfig, "BaseDirectory", @"D:\DailyGlobalSuppressionFtpStore");

                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "DailyGlobalSuppressionFtpImporter", "Main", "Configuration...",
                            $"Main: host={dailyDataFtpHost}::port={dailyDataFtpPort.ToString()}::userName={dailyDataFtpUserName}");

                Task t = Task.Run(async () => {
                    await DailyGlobalSuppressionFtpTasks.DoImport(cfgConnectionString, dailyDataBaseDir, dailyDataFtpHost,
                                                        21, dailyDataFtpUserName, dailyDataFtpPassword);
                });
                t.GetAwaiter().GetResult();

                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "DailyGlobalSuppressionFtpImporter", "Main", "Completed with Success...", $"");
            }
            catch (Exception ex)
            {
                DataLayer.InsertErrorLogSync(cfgConnectionString, 100, "DailyGlobalSuppressionFtpImporter", "Main", "Exception",
                            $"Main: host={dailyDataFtpHost}::port={dailyDataFtpPort.ToString()}::userName={dailyDataFtpUserName}::{ex.ToString()}");
            }
        }
    }
}
