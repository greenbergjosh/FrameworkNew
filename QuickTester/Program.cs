using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Utility;
using Utility.LongRunningWorkflow;

namespace QuickTester
{
    internal class Program
    {
        private async static Task Main(string[] _args)
        {
            await ClickhouseImportTest.ImportTest();
            return;
            //var ge = JsonWrapper.GenericEntityFromFile(@"json.txt").GetAwaiter().GetResult();
            //string q = ClickhouseQueryGenerator.generateClickhouseQuery(ge);
            //Console.WriteLine(q);
            //EdwTestDataGenerator.GenerateTestData();

            var fw = new FrameworkWrapper();

            var signalWriter = new SignalWriter();
            signalWriter.AddSignal("LRW Test", new { a = 1, b = 2, c = "this is c" });
            //signalWriter.AddSignal("signal2", new { a = 10, b = 22, c = new { subA = 1, subB = 30 } });

            Console.WriteLine(signalWriter.ToString());

            await fw.LrwWriter.Write(signalWriter);

            var threadId = Guid.NewGuid();
            var apartmentId = Guid.NewGuid();
            var exclusive = false;
            var payloadRunnerEntityId = Guid.Parse("800de8cb-2867-4866-9f09-30976a260b48");
            var payload = new
            {
                a = "This is a payload for the runner",
                b = 10
            };

            var waitWriter = new WaitWriter(threadId, apartmentId, exclusive, payloadRunnerEntityId, payload);
            waitWriter.AddWait(new WaitOne
            {
                Discriminator = "LRW Test",
                Payload = new
                {
                    a = 1,
                    b = "",
                    c = new
                    {
                        d = 0
                    }
                }
            });
            //waitWriter.AddWait(new WaitAll("all1",
            //    new WaitOne
            //    {
            //        Name = "all1-1",
            //        Discriminator = "d1",
            //        LookbackPeriod = "1h",
            //        Payload = new { p = "This is a payload" }
            //    },
            //    new WaitOne
            //    {
            //        Name = "all1-2",
            //        Discriminator = "d2",
            //        Payload = new { p = "This is a payload 2" }
            //    }
            //));
            //waitWriter.AddWait(new WaitAll("all2",
            //    new WaitTimedOne
            //    {
            //        Name = "all2-1",
            //        Discriminator = "d3",
            //        LookbackPeriod = "2h",
            //        Payload = new { p = "This is a payload 3" },
            //        RaiseAt = DateTime.UtcNow.AddDays(4),
            //        RaisePayload = new { a = "Raise payload", b = 1 }
            //    },
            //    new WaitOne
            //    {
            //        Name = "all2-2",
            //        Discriminator = "d4",
            //        LookbackPeriod = "3h",
            //        Payload = new { p = "This is a payload 4" }
            //    }
            //));
            //waitWriter.AddWait(new WaitAny("any1",
            //    new WaitTimedOne
            //    {
            //        Name = "any1-1",
            //        Discriminator = "d5",
            //        Payload = new { p = "This is a payload 5" },
            //        RaiseAt = DateTime.UtcNow.AddDays(6),
            //        RaisePayload = new { a = "Raise payload 2", b = 2 }
            //    },
            //    new WaitOne
            //    {
            //        Name = "any1-2",
            //        Discriminator = "d6",
            //        LookbackPeriod = "3h",
            //        Payload = new { p = "This is a payload 6" }
            //    }
            //));
            //waitWriter.AddWait(new WaitAny("any2",
            //    new WaitTimedOne
            //    {
            //        Name = "any2-1",
            //        Discriminator = "d7",
            //        Payload = new { p = "This is a payload 7" },
            //        RaiseAt = DateTime.UtcNow.AddDays(9),
            //        RaisePayload = new { a = "Raise payload 3", b = 3 }
            //    },
            //    new WaitAll("all3",
            //        new WaitOne
            //        {
            //            Name = "any2-all-1",
            //            Discriminator = "d8",
            //            Payload = new { p = "This is a payload 8" }
            //        },
            //        new WaitOne
            //        {
            //            Name = "any2-all-2",
            //            Discriminator = "d9",
            //            LookbackPeriod = "3h",
            //            Payload = new { p = "This is a payload 9" }
            //        }
            //    )
            //));

            Console.WriteLine(waitWriter.ToString());

            await fw.LrwWriter.Write(waitWriter);
        }
    }
}