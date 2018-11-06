using System;
using Utility;

namespace QuickTester
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("0: " + args[0]);
            Console.WriteLine("1: " + args[1]);
            Console.WriteLine("2: " + args[2]);
            Console.WriteLine(Utility.UnixWrapper.BinarySearchSortedMd5File(args[0], args[1], args[2]).GetAwaiter().GetResult());
        }
    }
}
