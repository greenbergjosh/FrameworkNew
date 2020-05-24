using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.EDW.Reporting;

namespace QuickTester
{
    static class EdwTestDataGenerator
    {
        public static void GenerateTestData()
        {
            var rs1ConfigId = Guid.Parse("709cf774-88f5-42d8-8f55-08d5cee342b4");
            var rs2ConfigId = Guid.Parse("395fe415-095f-418b-97a6-dd6a8f9752db");

            var startDate = DateTime.Parse("01/01/2020");

            var dates = Enumerable.Range(0, 3).Select(i => startDate.AddDays(i));

            var hours = Enumerable.Range(13, 4);

            var subCampaigns = Enumerable.Range(1, 10);

            var ages = Enumerable.Range(30, 5);

            var events = new List<EdwBulkEvent>();

            foreach (var date in dates)
            {
                foreach (var hour in hours)
                {
                    var targetDate = date.AddHours(hour);

                    foreach (var subCampaign in subCampaigns)
                    {
                        foreach (var age in ages)
                        {
                            var eventGuids = Enumerable.Range(1, 10).Select(_ => Guid.NewGuid()).ToArray();
                            var rs1Id = eventGuids[0];
                            var rs2Id = eventGuids[1];

                            var rss = new Dictionary<string, object>()
                            {
                                {"rs1", rs1Id },
                                {"rs2", rs2Id }
                            };

                            var e = new EdwBulkEvent();
                            e.AddRS(EdwBulkEvent.EdwType.Immediate, rs1Id, targetDate, PL.O(new { ts = targetDate, s = subCampaign }), rs1ConfigId); // file export type = RS1
                            events.Add(e);

                            e = new EdwBulkEvent();
                            e.AddRS(EdwBulkEvent.EdwType.Immediate, rs2Id, targetDate, PL.O(new { ts = targetDate, s = subCampaign }), rs2ConfigId); // file export type = RS2 - 1
                            events.Add(e);

                            e = new EdwBulkEvent();
                            e.AddEvent(eventGuids[2], targetDate, rss, null, PL.O(new { et = "GPImpression", p1 = 1, p4 = 4, p6 = 6, p8 = 8 }));
                            events.Add(e);

                            e = new EdwBulkEvent();
                            e.AddEvent(eventGuids[3], targetDate, rss, null, PL.O(new { et = "PImpression", p2 = 2, p5 = 5, p7 = 7, p8 = 80 }));
                            events.Add(e);

                            e = new EdwBulkEvent();
                            e.AddEvent(eventGuids[4], targetDate, rss, new[] { eventGuids[3].ToString(), eventGuids[2].ToString() }, PL.O(new { et = "Impression", p3 = 3, p6 = 60, p7 = 70, p8 = 800 }));
                            events.Add(e);

                            e = new EdwBulkEvent();
                            e.AddEvent(eventGuids[5], targetDate, rss, null, PL.O(new { et = "GPClick", q1 = 1, q4 = 4, q5 = 5, q7 = 7 }));
                            events.Add(e);

                            e = new EdwBulkEvent();
                            e.AddEvent(eventGuids[6], targetDate, rss, null, PL.O(new { et = "PClick", q2 = 2, q4 = 40, q6 = 6, q7 = 70 }));
                            events.Add(e);

                            e = new EdwBulkEvent();
                            e.AddEventWhepD(eventGuids[7], targetDate, rss, new Dictionary<string, object>() { { "bob", eventGuids[5] }, { "tom", eventGuids[6] } }, PL.O(new { et = "Click", q3 = 3, q5 = 50, q6 = 60, q7 = 700 }));
                            events.Add(e);

                            e = new EdwBulkEvent();
                            e.AddEvent(eventGuids[8], targetDate, rss, null, PL.O(new { et = "Survey", age }));
                            events.Add(e);

                            //e = new EdwBulkEvent();
                            // TODO: I don't know what this line means
                            //rss.add(g[1], { age: < age >})  --file export type = RS2 - 2
                            //events.Add(e);

                            e = new EdwBulkEvent();
                            e.AddEvent(eventGuids[9], targetDate, rss, null, PL.O(new { et = "Action" }));
                            events.Add(e);
                        }
                    }
                }
            }

            OneFile(events);
            FilePerEventType(events);
            RandomFiles(events);
        }

        private static void OneFile(IEnumerable<EdwBulkEvent> events)
        {
            var folder = GetFolder("OneFile");

            var file = Path.Combine(folder, "events.txt");
            File.WriteAllText(file, SerializeEdwEvents(events));
        }

        private static void FilePerEventType(IEnumerable<EdwBulkEvent> events)
        {
            var folder = GetFolder("FilePerEventType");

            foreach (var eventTypeGroup in events.GroupBy(e =>
            {
                if (e.RsTypes[EdwBulkEvent.EdwType.Immediate].Any())
                {
                    return "RS";
                }

                var payload = JObject.Parse(e.RsTypes[EdwBulkEvent.EdwType.Event][0].ps.Single(t => t.Item1 == "payload").Item2);

                return payload["et"].Value<string>();
            }))
            {
                var file = Path.Combine(folder, $"{eventTypeGroup.Key}.txt");
                File.WriteAllText(file, SerializeEdwEvents(eventTypeGroup.ToList()));
            }
        }

        private static void RandomFiles(IEnumerable<EdwBulkEvent> events)
        {
            var folder = GetFolder("RandomFiles");

            var random = new Random();

            var randomEvents = events.OrderBy(e => random.Next()).ToList();

            var fileCount = 20;

            var fileEvents = new List<List<EdwBulkEvent>>(fileCount);
            for (var i = 0; i < fileCount; i++)
            {
                fileEvents.Add(new List<EdwBulkEvent>());
            }

            foreach (var e in events)
            {
                var fileIndex = random.Next(fileCount);

                fileEvents[fileIndex].Add(e);
            }

            for (var i = 0; i < fileCount; i++)
            {
                var es = fileEvents[i];

                var file = Path.Combine(folder, $"{i}.txt");
                File.WriteAllText(file, SerializeEdwEvents(es));
            }
        }

        private static string SerializeEdwEvents(IEnumerable<EdwBulkEvent> events) => JsonConvert.SerializeObject(events.Select(e => JsonConvert.DeserializeObject(e.ToString())));

        private static string GetFolder(string folderName)
        {
            var desktop = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
            var testFolder = Path.Combine(desktop, "EdwTestCases");
            if (!Directory.Exists(testFolder))
            {
                Directory.CreateDirectory(testFolder);
            }

            var folder = Path.Combine(testFolder, folderName);
            if (!Directory.Exists(folder))
            {
                Directory.CreateDirectory(folder);
            }

            return folder;
        }
    }
}
