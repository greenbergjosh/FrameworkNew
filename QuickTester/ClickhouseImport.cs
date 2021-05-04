using System;
using System.Threading.Tasks;
using EdwRollupLib;
using Utility;

namespace QuickTester
{
    internal class ClickhouseImportTest
    {
        public static async Task ImportTest()
        {
            var fw = new FrameworkWrapper();
            var config = await fw.Entities.GetEntity(Guid.Parse("f4de787b-2bd6-443d-9e57-e3930bb86a8c"));

            var startDate = DateTime.Parse("04/29/2021");// DateTime.Now.AddDays(-1).Date;
            var endDate = startDate.AddDays(1);

            await new ClickhouseImport(config, fw).RunAsync(startDate, endDate);
        }
    }
}