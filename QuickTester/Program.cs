using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utility;
using Utility.EDW.Reporting;

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