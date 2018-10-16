using GenericEntity;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Data.SqlClient;

namespace QuickTester
{
    class Program
    {
        static void Main(string[] args)
        {
            string ConnectionString = "Data Source=66.70.182.182;Initial Catalog=Unsub;Persist Security Info=True;User ID=GlobalConfigUser;Password=Global!User1";

            string general = SqlWrapper.SqlServerProviderEntry(ConnectionString, "SelectConfig", "", "")
                .GetAwaiter().GetResult();
            IGenericEntity gc = new GenericEntityJson();
            var gcstate = ((JArray)JsonConvert.DeserializeObject(general))[0];
            gc.InitializeEntity(null, null, gcstate);

            bool CallLocalLoadUnsubFiles = gc.GetB("Config/CallLocalLoadUnsubFiles");
            bool UseLocalNetworkFile = gc.GetB("Config/UseLocalNetworkFile");

            Console.WriteLine("CallLocalLoadUnsubFiles: " + CallLocalLoadUnsubFiles.ToString());
            Console.WriteLine("UseLocalNetworkFile: " + UseLocalNetworkFile.ToString());
            //Console.WriteLine("Before uppercase");
            //try
            //{
            //    Utility.ProtocolClient.DownloadFileFtp(
            //            @"d:\workspace\quicktest",
            //            "Unsub/" + "02779DA1-730A-4FAC-AB18-741231BFFB7D" + ".txt.srt",
            //            "abc.txt",
            //            "ftpback-bhs6-85.ip-66-70-176.net",
            //            "ns557038.ip-66-70-182.net",
            //            "kerBVnPFmJ"
            //            ).GetAwaiter().GetResult();

            //    Console.WriteLine("After uppercase");
            //}
            //catch (Exception ex)
            //{
            //    Console.WriteLine("Exception uppercase - " + ex);
            //}

            //Console.WriteLine("Before lowercase");

            //try
            //{
            //    Utility.ProtocolClient.DownloadFileFtp(
            //            @"d:\workspace\quicktest",
            //            "Unsub/" + "02779DA1-730A-4FAC-AB18-741231BFFB7D".ToLower() + ".txt.srt",
            //            "abc.txt",
            //            "ftpback-bhs6-85.ip-66-70-176.net",
            //            "ns557038.ip-66-70-182.net",
            //            "kerBVnPFmJ"
            //            ).GetAwaiter().GetResult();

            //    Console.WriteLine("After lowercase");
            //}
            //catch (Exception ex)
            //{
            //    Console.WriteLine("Exception lowercase - " + ex);
            //}

        }
    }
}
