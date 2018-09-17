using IndiaLiveFeedFtpLib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IndiaLiveFeedFtpImport
{
    class Program
    {
        public static string cfgConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";
        public static string evtConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";

        static void Main(string[] args)
        {
            //Task t1 = Task.Run(async () => {
            //    await IndiaLiveFeedFtpTasks.DownloadFile(@"D:\IndiaLiveFeedFtpStore", "test.txt", "Blacklist_20170201.txt", "cc1141.com",
            //                                        "LmmToComplaint", "L3SRVjyT");
            //});
            //Task t1 = Task.Run(async () => {
            //    await IndiaLiveFeedFtpTasks.DoDownload(cfgConnectionString, @"D:\IndiaLiveFeedFtpStore", @"^Blacklist_.*\.txt$", 1,
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
                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "IndiaLiveFeedFtpImporter", "Main", "Starting...", $"");

                Dictionary<string, string> basicConfig = DataLayer.GetBasicConfig(cfgConnectionString, "IndiaLiveFeedFtpImporter").GetAwaiter().GetResult();
                dailyDataFtpHost = Utility.GetBasicConfigValue<string>(basicConfig, "Host", "");
                dailyDataFtpPort = Utility.GetBasicConfigValue<int>(basicConfig, "Port", 21);
                dailyDataFtpUserName = Utility.GetBasicConfigValue<string>(basicConfig, "UserName", "");
                dailyDataFtpPassword = Utility.GetBasicConfigValue<string>(basicConfig, "Password", "");
                dailyDataBaseDir = Utility.GetBasicConfigValue<string>(basicConfig, "BaseDirectory", @"D:\IndiaLiveFeedFtpStore");

                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "IndiaLiveFeedFtpImporter", "Main", "Configuration...",
                            $"Main: host={dailyDataFtpHost}::port={dailyDataFtpPort.ToString()}::userName={dailyDataFtpUserName}");

                Task t = Task.Run(async () => {
                    await IndiaLiveFeedFtpTasks.DoImport(cfgConnectionString, dailyDataBaseDir, dailyDataFtpHost,
                                                        21, dailyDataFtpUserName, dailyDataFtpPassword);
                });
                t.GetAwaiter().GetResult();

                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "IndiaLiveFeedFtpImporter", "Main", "Completed with Success...", $"");
            }
            catch (Exception ex)
            {
                DataLayer.InsertErrorLogSync(cfgConnectionString, 100, "IndiaLiveFeedFtpImporter", "Main", "Exception",
                            $"Main: host={dailyDataFtpHost}::port={dailyDataFtpPort.ToString()}::userName={dailyDataFtpUserName}::{ex.ToString()}");
            }
        }
    }
}
