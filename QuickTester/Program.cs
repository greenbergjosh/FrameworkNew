using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utility;
using Utility.EDW.Reporting;

namespace QuickTester
{
    internal class Program
    {

        private static async Task Main()
        {
            await  EdwGrammar.GenerateSql();
            await EntityTest.Run();
        }
    }
}