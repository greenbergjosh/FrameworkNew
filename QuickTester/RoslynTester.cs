using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Utility;
using Utility.GenericEntity;

namespace QuickTester
{
    public class RoslynTester
    {
        public static string TestF1 =
                @"
                    System.Console.WriteLine(p.x1);
                    if (p.x1 > 0) await f.testf1(new {x1 = p.x1 - 1}, s);
                    """"";

        public static async Task TestRoslyn()
        {
            var scripts = new List<ScriptDescriptor>();
            var scriptsPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Scripts");
            dynamic rw = new RoslynWrapper(scripts, $@"{scriptsPath}\\debug");

            rw.CompileAndCache(new ScriptDescriptor(null, "TestF1", TestF1, false, null));

            StateWrapper sw = new StateWrapper();

            var fno = await rw.testf1(new { x1 = 5 }, sw);
        }
    }
}
