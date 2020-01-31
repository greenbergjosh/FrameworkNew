using System;
using System.Threading.Tasks;

namespace QuickTester
{
    internal class Program
    {
        private static async Task Main(string[] _args)
        {
            //await DataFlowTester.TestDynamicDataFlow();
            //await DataFlowTester.TestDynamicBlockCreator();
            //await DataFlowTester.TestRoslyn();
            await DataFlowTester.TestDynamicDataflow();

            Console.WriteLine("Complete");
            Console.ReadLine();
        }
    }
}