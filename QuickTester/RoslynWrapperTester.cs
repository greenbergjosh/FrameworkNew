using System;
using System.IO;
using System.Threading.Tasks;
using Utility;
using Utility.Entity;
using Utility.Evaluatable;

namespace QuickTester
{
	public class RoslynWrapperTester
	{
		public class MyGlobals
        {
			public int x;
        }

		public static async Task Run()
		{
			var scriptsPath = Directory.GetCurrentDirectory();
			var rw = new RoslynWrapper<MyGlobals, int>(Path.GetFullPath(Path.Combine(scriptsPath, "scriptdebug")));

			var res1 = await rw.Evaluate(Guid.NewGuid(), "1+2", new MyGlobals { x = 3 });
			var res2 = await rw.Evaluate(Guid.NewGuid(), @"var y = 1;
System.Diagnostics.Debugger.Break();
var z = x;
return y+z;", new MyGlobals {  x = 3 });
		}
	}
}

