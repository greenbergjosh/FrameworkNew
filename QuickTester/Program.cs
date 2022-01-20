using System.Threading.Tasks;

namespace QuickTester
{
    internal class Program
    {

        private static async Task Main()
        {
            await CliWrapperTester.Run();
            //YamlTest.Run();
            await CastedEntity.Run();
            await EdwGrammar3.Run();
            await EntityTest.Run();
            await EvaluatorTest.Run();
        }
    }
}