using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Channels;
using System.Threading.Tasks;
using Utility;
using Utility.Mta;
using Utility.Mta.Pmta;
using Jw = Utility.JsonWrapper;
using Ps = Utility.ProcessWrapper;
using Random = Utility.Crypto.Random;

namespace QuickTester
{
    internal class Program
    {
        //public async void Run(string path)
        //{
        //    IAsyncEnumerable<string> lines = TestAsync(new StreamReader(path));
        //    await foreach (var line in lines)
        //    {
        //        Console.WriteLine(line);
        //    }
        //}

        //private async IAsyncEnumerable<string> TestAsync(StreamReader sr)
        //{
        //    while (true)
        //    {
        //        string line = await sr.ReadLineAsync();
        //        if (line == null)
        //            break;
        //        yield return line;
        //    }
        //}

        
        // If you're looking for something that was in here before, I moved everything into individual static classes in the project. Sorry for the convenience. - Alberto
        private static async Task Main(string[] _args)
        {
            string fileType = null;
            List<string> lines = new List<string>() { "email", "bob@hotmail.com", "tom@hotmail.com", "pdfkg" };
            if (lines.Count > 2 || lines.Last().Length == 0) lines.RemoveAt(lines.Count - 1);
            var tlines = lines.Select((line, idx) => new Tuple<string, int>(line, idx));
            var grps = tlines.GroupBy(line => line.Item1.Contains('@') ? "email" : "md5");
            if (grps.Count() == 1) { fileType = grps.First().Key;  }
            else if (grps.Count() == 2) 
            {
                if (grps.First().Count() == 1 && grps.First().ToArray()[0].Item2 == 0) var ph = 1; // remove header
                fileType = grps.First().ToArray()[0].Item1;
            }

            //try
            //{
            //    DataFlowTester.ActionTester().GetAwaiter().GetResult();

            //}
            //catch (Exception ex)
            //{
            //    Console.WriteLine("Here");
            //}

            //try
            //{
            //    ChannelsTester.MultiProduceMultipleConsumers().GetAwaiter().GetResult();
            //}
            //catch (Exception ex)
            //{
            //    Console.WriteLine("Here");
            //}
            await RoslynTester.TestRoslyn();
            await DataFlowTester.TestDynamicBlockCreator();

            //var pc = ChannelsTester.CreateChannel(3, 3, channelProducer, channelConsumer);
            //await pc.Item1;
            //await pc.Item2;


            //await ChannelsTester.TestChanneler();
            //int stop = 1;

           try
            {
                const string body =
                    @"<html>
    <div>Do not be alarmed, this is only a test</div>
</html>";
                var fw = new FrameworkWrapper();
                var mta = new PmtaLibMailService(fw, "Config/QA");
                var pkg = new MailPackage(new Sender("OPG Alerts", "marco", "onpoint-delivery.com"), "abec@onpointglobal.com", $"j-001-{Random.GenerateRandomString(3, 6, Random.AsciiChars)}",
                    "PMTA Test", body, null);

                await mta.Send(pkg,"sandboxmta");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }
    }
}