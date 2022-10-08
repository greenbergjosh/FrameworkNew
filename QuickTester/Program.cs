using System.Threading.Tasks;

namespace QuickTester
{
    internal class Program
    {

        private static async Task Main()
        {
            //await EdwGrammar3.Run();
            //await EntityTest.Run();
            //await EvaluatorTest.Run();
            await RoslynWrapperTester.Run();
        }
    }
}