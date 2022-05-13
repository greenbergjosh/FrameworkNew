using EdwRollupLib;
using System.Threading.Tasks;
using Utility;

namespace QuickTester
{
    internal class ClickhouseImportTest
    {
        public static async Task ImportTest()
        {
            var fw = await FrameworkWrapper.Create();

            var config = await fw.Entity.EvalE("config://5eec1fc3-dc63-4f37-b374-c9ecd2ca0186");

            var import = await ClickhouseImport.Create(config, fw);

            await import.RunAsync();
        }
    }
}