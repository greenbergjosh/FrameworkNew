using GenericEntity;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Data.SqlClient;
using System.IO;

namespace QuickTester
{
    class Program
    {
        static void Main(string[] args)
        {
            string dir = "\\\\ftpback-bhs6-85.ip-66-70-176.net\\ns557038.ip-66-70-182.net\\Unsub";
            string fname = "d1c4608e-3ab9-449a-9088-b72dbd1a9829.txt.srt";
            string dfileName = "c:\\workspace\\copyofd1c.txt";
            new FileInfo(dir + "\\" + fname)
                                .CopyTo(dfileName);

            //string someFile = @"C:\somefolder\somefile.txt";
            //string directory = Path.GetDirectoryName(someFile);

            //foreach (var file in Directory.GetFiles(directory))
            //{
            //    File.Delete(file);
            //}

            string baseDir = "c:\\Workspace";
            DirectoryInfo di = new DirectoryInfo(baseDir);
            FileInfo[] fi = di.GetFiles(dfileName);
            if (fi.Length == 1)
            {
                Console.Write("Copied file to : " + dfileName);
            }
            else
            {
                Console.Write("Could not find file in cache: " + fname);
            }

            //DirectoryInfo sourceDir = new DirectoryInfo(dir);
            //FileInfo[] files = sourceDir.GetFiles("*.srt", SearchOption.TopDirectoryOnly);
            //foreach (var file in files)
            //{
            //    Console.WriteLine(file);
            //}

            //string ConnectionString = "Data Source=66.70.182.182;Initial Catalog=Unsub;Persist Security Info=True;User ID=GlobalConfigUser;Password=Global!User1";

            //string general = SqlWrapper.SqlServerProviderEntry(ConnectionString, "SelectConfig", "", "")
            //    .GetAwaiter().GetResult();
            //IGenericEntity gc = new GenericEntityJson();
            //var gcstate = ((JArray)JsonConvert.DeserializeObject(general))[0];
            //gc.InitializeEntity(null, null, gcstate);

            //bool CallLocalLoadUnsubFiles = gc.GetB("Config/CallLocalLoadUnsubFiles");
            //bool UseLocalNetworkFile = gc.GetB("Config/UseLocalNetworkFile");

            //Console.WriteLine("CallLocalLoadUnsubFiles: " + CallLocalLoadUnsubFiles.ToString());
            //Console.WriteLine("UseLocalNetworkFile: " + UseLocalNetworkFile.ToString());
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
