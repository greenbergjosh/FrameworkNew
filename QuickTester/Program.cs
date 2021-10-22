using System.Threading.Tasks;

namespace QuickTester
{
    internal class Program
    {

        private static async Task Main()
        {
            await EdwGrammar.GenerateSql();
            await EntityTest.Run();
        }
    }
}