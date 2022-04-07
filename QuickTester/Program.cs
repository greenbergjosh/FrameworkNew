using System.Threading.Tasks;

namespace QuickTester
{
    internal class Program
    {

        private static async Task Main()
        {
            await ClickhouseImportTest.ImportTest();
            //await EdwGrammar3.Run();
            //await EntityTest.Run();
        }
    }
}