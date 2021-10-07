using System.Threading.Tasks;

namespace QuickTester
{
    internal class Program
    {

        private static Task Main(string[] _args)
        {
            return EntityTest.Run();
        }
    }
}