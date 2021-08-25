using System.Threading.Tasks;

namespace QuickTester
{
    internal class Program
    {
        private async static Task Main(string[] _args)
        {
            await ClickhouseImportTest.ImportTest();
        }
    }
}