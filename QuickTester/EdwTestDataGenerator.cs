using System;
using System.Collections.Generic;
using System.Linq;
using Npgsql;
using Utility.EDW.Reporting;

namespace QuickTester
{
    static class EdwTestDataGenerator
    {
        public static void GenerateTestData()
        {
            var connectionString = "Server=warehouse1.data.techopg.local;Port=5432;Database=edw;User Id=master_app;Password=91cd8896-fb5f-48c1-8799-c6e4dccb027c;Application Name='Edw Test Data Generator';";

            using var connection = new NpgsqlConnection(connectionString);
            connection.Open();

            var rs1ConfigId = Guid.Parse("709cf774-88f5-42d8-8f55-08d5cee342b4");
            var rs2ConfigId = Guid.Parse("395fe415-095f-418b-97a6-dd6a8f9752db");

            var startDate = DateTime.Parse("10/27/2020");

            var dates = Enumerable.Range(0, 3).Select(i => startDate.AddDays(i));

            var hours = Enumerable.Range(13, 4);

            var subCampaigns = Enumerable.Range(1, 10);

            var ages = Enumerable.Range(30, 5);

            var random = new Random();

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

                            var rss = new Dictionary<Guid, (Guid rsId, DateTime rsTimestamp)>
                            {
                                [rs1ConfigId] = (rs1Id, targetDate),
                                [rs2ConfigId] = (rs2Id, targetDate)
                            };

                            var aggregationTtl = TimeSpan.FromHours(random.Next(48));

                            var satisfactionTtl = TimeSpan.FromHours(random.Next(6));

                            var e = new EdwBulkEvent();
                            e.AddReportingSequence(rs1Id, targetDate, new { s = subCampaign }, rs1ConfigId, aggregationTtl); // file export type = RS1

                            e.AddCheckedReportingSequence(rs2Id, targetDate, new { s = subCampaign }, rs2ConfigId, aggregationTtl, satisfactionTtl); // file export type = RS2 - 1

                            e.AddEvent(eventGuids[2], targetDate, rss, new { et = "GPImpression", p1 = 1, p4 = 4, p6 = 6, p8 = 8 }, aggregationTtl);

                            e.AddEvent(eventGuids[3], targetDate, rss, new { et = "PImpression", p2 = 2, p5 = 5, p7 = 7, p8 = 80 }, aggregationTtl);

                            e.AddEvent(eventGuids[4], targetDate, rss, new { et = "Impression", p3 = 3, p6 = 60, p7 = 70, p8 = 800 }, new[] { (eventGuids[3], targetDate), (eventGuids[2], targetDate) }, aggregationTtl);

                            e.AddEvent(eventGuids[5], targetDate, rss, new { et = "GPClick", q1 = 1, q4 = 4, q5 = 5, q7 = 7 }, aggregationTtl);

                            e.AddEvent(eventGuids[6], targetDate, rss, new { et = "PClick", q2 = 2, q4 = 40, q6 = 6, q7 = 70 }, aggregationTtl);

                            e.AddEvent(eventGuids[7], targetDate, rss, new { et = "Click", q3 = 3, q5 = 50, q6 = 60, q7 = 700 }, new Dictionary<string, (Guid eventId, DateTime eventTimestamp)> { ["bob"] = (eventGuids[5], targetDate), ["tom"] = (eventGuids[6], targetDate) }, aggregationTtl);

                            e.AddEvent(eventGuids[8], targetDate, rss, new { et = "Survey", age }, aggregationTtl);

                            e.AddCheckedReportingSequenceDetail(rs2Id, targetDate, targetDate, new { age }, rs2ConfigId, satisfactionTtl); // file export type = RS2 - 1

                            e.AddEvent(eventGuids[9], targetDate, rss, new { et = "Action" }, aggregationTtl);

                            InsertEdwPayload(connection, e);
                        }
                    }
                }
            }

            connection.Close();
        }

        private static void InsertEdwPayload(NpgsqlConnection connection, EdwBulkEvent edwBulkEvent, int timeout = 120)
        {
            using var cmd = new NpgsqlCommand($"SELECT staging.submit_bulk_payload(@Payload)", connection) { CommandTimeout = timeout };
            cmd.Parameters.AddWithValue("@Payload", NpgsqlTypes.NpgsqlDbType.Jsonb, edwBulkEvent.ToString());
            cmd.Parameters.Add(new NpgsqlParameter("@Return", NpgsqlTypes.NpgsqlDbType.Boolean)).Direction = System.Data.ParameterDirection.Output;
            cmd.CommandTimeout = timeout;
            cmd.ExecuteNonQuery();

            var result = cmd.Parameters["@Return"].Value;
            if (result?.ToString() != "200 ok")
            {
                throw new Exception(result?.ToString());
            }
        }
    }
}
