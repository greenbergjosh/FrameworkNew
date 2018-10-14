using System;

namespace QuickTester
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Before uppercase");

            try
            {
                Utility.ProtocolClient.DownloadFileFtp(
                        @"d:\workspace\quicktest",
                        "Unsub/" + "02779DA1-730A-4FAC-AB18-741231BFFB7D" + ".txt.srt",
                        "abc.txt",
                        "ftpback-bhs6-85.ip-66-70-176.net",
                        "ns557038.ip-66-70-182.net",
                        "kerBVnPFmJ"
                        ).GetAwaiter().GetResult();

                Console.WriteLine("After uppercase");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception uppercase - " + ex);
            }

            Console.WriteLine("Before lowercase");

            try
            {
                Utility.ProtocolClient.DownloadFileFtp(
                        @"d:\workspace\quicktest",
                        "Unsub/" + "02779DA1-730A-4FAC-AB18-741231BFFB7D".ToLower() + ".txt.srt",
                        "abc.txt",
                        "ftpback-bhs6-85.ip-66-70-176.net",
                        "ns557038.ip-66-70-182.net",
                        "kerBVnPFmJ"
                        ).GetAwaiter().GetResult();

                Console.WriteLine("After lowercase");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception lowercase - " + ex);
            }

        }
    }
}
