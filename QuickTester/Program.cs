using System.Threading.Tasks;

namespace QuickTester
{
    internal class Program
    {

        private static void Main()
        {
            //f();
            EdwGrammar.GenerateSql().GetAwaiter().GetResult();
           // await EntityTest.Run();

        }

        public static  string f()
        {
            int y = 0;
            int x = 1 / y;
            return "";
        }
    }
}