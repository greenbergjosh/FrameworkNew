using System.Threading.Tasks;

namespace QuickTester
{
    internal class Program
    {

        private static Task Main()
        {
            return EdwGrammar.GenerateSql();
            //return EntityTest.Run();
        }
    }
}