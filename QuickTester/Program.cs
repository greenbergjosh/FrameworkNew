using System.Threading.Tasks;

namespace QuickTester
{
    internal class Program
    {

        private static async Task Main()
        {
            YamlTest.Run();
            CastedEntity.Run();
            await EdwGrammar3.Run();
            await EntityTest.Run();
            await EvaluatorTest.Run();
        }
    }
}