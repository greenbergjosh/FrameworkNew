using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
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
        // If you're looking for something that was in here before, I moved everything into individual static classes in the project. Sorry for the convenience. - Alberto
        private static async Task Main(string[] _args)
        {
            try
            {
                DataFlowTester.ActionTester().GetAwaiter().GetResult();

            }
            catch (Exception ex)
            {
                Console.WriteLine("Here");
            }
            
            int stop = 1;

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