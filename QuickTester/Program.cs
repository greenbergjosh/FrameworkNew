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
            //var fw = new FrameworkWrapper();

            //var rs1ConfigId = Guid.Parse("709cf774-88f5-42d8-8f55-08d5cee342b4");

            //var rss = new Dictionary<Guid, (Guid rsId, DateTime rsTimestamp)>
            //{
            //    [rs1ConfigId] = (Guid.NewGuid(), DateTime.UtcNow),
            //};

            //var e = new EdwBulkEvent();
            //e.AddReportingSequence(rss[rs1ConfigId].rsId, rss[rs1ConfigId].rsTimestamp, new { rsTest = true }, rs1ConfigId);
            //e.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rss, new { test = true });

            //await fw.EdwWriter.Write(e);
            //Console.WriteLine("Event written");
            return EntityTest.Run();
        }
    }
}