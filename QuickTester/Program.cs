using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Channels;
using System.Threading.Tasks;
using Utility;
using Utility.Mta;
using Utility.Mta.Pmta;
using Jw = Utility.JsonWrapper;
using Ps = Utility.ProcessWrapper;
using Random = Utility.Crypto.Random;

namespace QuickTester
{
    internal class Program
    {
        private static async Task Main(string[] _args)
        {
            await DataFlowTester.TestDynamicDataFlow();
            //await DataFlowTester.TestDynamicBlockCreator();
        }
    }
}