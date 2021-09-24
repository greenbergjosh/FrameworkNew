using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utility;
using Utility.EDW.Reporting;

namespace QuickTester
{
    public static class SingletonEventTester
    {
        public static async Task Run(FrameworkWrapper fw)
        {
            var rsConfigId = Guid.Parse("0b6ef468-6655-4812-b3bf-71c06b2f065b");

            for (var i = 0; i < 20; i++)
            {
                var e = new EdwBulkEvent();
                e.AddEvent(Guid.NewGuid(), DateTime.UtcNow, new Dictionary<Guid, (Guid, DateTime)> { [rsConfigId] = (default, default) }, new
                {
                    appName = "Legacy Site",
                    pageTitle = "Global Configs - Edit Config",
                    pageUrl = "https=//admin.techopg.com/dashboard/global-config/0b6ef468-6655-4812-b3bf-71c06b2f065b/edit",
                    reportId = (string)null,
                    userEmail = "etoro@onpointglobal.com",
                    userName = "Edwin Toro"
                });

                Console.WriteLine(e);

                await fw.EdwWriter.Write(e);
            }
        }
    }
}
