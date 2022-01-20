using System;
using System.Text.Json;
using System.Threading.Tasks;
using EdwRollupLib;
using Utility;
using Utility.DataLayer;

namespace QuickTester
{
    internal class ClickhouseImportTest
    {
        public static async Task ImportTest()
        {
            var fw = await FrameworkWrapper.Create();

            var config = await fw.Entity.EvalE("config://f4de787b-2bd6-443d-9e57-e3930bb86a8c");

            var cacheResult = await Data.CallFn("appCache", "appCacheGet", JsonSerializer.Serialize(new
            {
                cacheScopeId = "d046030e-ea51-4647-a18d-447ef14a682a",
                x1 = "NextStartDate"
            }));

            DateTime nextStartDate = default;
            await foreach (var entry in cacheResult.EvalL("result"))
            {
                nextStartDate = DateTime.Parse(await entry.EvalS("payload")).Date;
                break;
            }

            if (nextStartDate == default)
            {
                throw new Exception("Unable to read next start date");
            }

            var startDate = nextStartDate;

            var maxDaysPerExecution = 10;
            var daysProcessed = 0;
            var lastDate = DateTime.Parse("05/24/2021");//DateTime.Now.Date;

            await fw.Log("Nightly Clickhouse Import - LBM", $"StartDate: {startDate}");

            while (startDate < lastDate && daysProcessed < maxDaysPerExecution)
            {
                var endDate = startDate.AddDays(1);

                await (await ClickhouseImport.Create(config, fw)).RunAsync(startDate, endDate);

                _ = await Data.CallFn("appCache", "appCacheSet", JsonSerializer.Serialize(new
                {
                    cacheScopeId = "d046030e-ea51-4647-a18d-447ef14a682a",
                    x1 = "NextStartDate",
                    payload = endDate,
                    expires = DateTime.Now.AddDays(30)
                }));

                startDate = endDate;

                daysProcessed++;
            }
        }
    }
}