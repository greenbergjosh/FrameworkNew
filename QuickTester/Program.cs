using System;
using System.Collections.Generic;
using System.IO;
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
        private static string Match(string s)
        {
            if (Regex.IsMatch(s, "^[0-9a-fA-F]{32}$"))
                return "md5";
            if (!string.IsNullOrEmpty(s) && !(!s.Contains("@") || (s[0] == '*') || (s[0] == '@')))
                return "plain";
            if (!string.IsNullOrEmpty(s) && s.Contains("."))
                return "dom";
            return null;
        }

        private static async Task<string> MatchFile2(string[] lines, FileInfo f)
        {
            string fileType = null;

            var aa = lines
                .Aggregate(new Tuple<List<string>, int, int>(new List<string>(), lines.Length - 1, 0), (a, b) =>
                {
                    if (!((a.Item2 == a.Item3 && a.Item3 > 2) || (a.Item2 == 2 && string.IsNullOrWhiteSpace(b))))
                        a.Item1.Add(b);
                    return new Tuple<List<string>, int, int>(a.Item1, a.Item2, a.Item3 + 1);
                }, x => x.Item1)
                .Select((line, idx) => new Tuple<string, int>(line, idx))
                .GroupBy(line => Match(line.Item1))
                .Aggregate(new Tuple<IGrouping<string, Tuple<string, int>>, int, bool>(null, 0, false), (a, b) =>
                {
                    var isHeader = a.Item2 == 1 && a.Item1.Count() == 1;
                    return new Tuple<IGrouping<string, Tuple<string, int>>, int, bool>(
                        (a.Item2 == 0 || isHeader) ? b : null, a.Item2 + 1, isHeader);
                });

            if (aa.Item3)
            {
                //Strip the header
            }

            fileType = aa.Item1.Key;
            
            return fileType;
        }

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
            CurlThinWrapper.Run();
            //var f = new FileInfo("d:\\sources\\test.txt");

            //var lines = await FileSystem.ReadLines(f.FullName, 400);

            //var r = await MatchFile2(lines, f);

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