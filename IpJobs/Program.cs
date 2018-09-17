using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Specialized;
using System.Data;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Http;
using System.ServiceModel;
using System.Xml;

namespace IpJobs
{
    class Program
    {
        static string cfgConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";
        static string evtConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";

        static void Main(string[] args)
        {
            try
            {
                Guid runId = Guid.NewGuid();
                DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "IpJobs", "Main", "Starting...", $"");

                if (args.Length < 2 || args[0] == null || args[0] == "" ||
                    args[1] == null || args[1] == "")
                {
                    DataLayer.InsertErrorLogSync(cfgConnectionString, 100, "IpJobs", "Main", "Inadequate args", "");
                }
                else
                {
                    string apiProvider = args[0];
                    string reportJobName = args[1];
                    DataLayer.CreateDataTables(cfgConnectionString, evtConnectionString);
                    DataLayer.InsertErrorLogSync(cfgConnectionString, 1, "IpJobs", "Main", "Arguments", $"{apiProvider}::{reportJobName}");

                    switch (apiProvider.ToLower())
                    {
                        case "cake":
                            DoCakeRuns(runId, reportJobName).GetAwaiter().GetResult();
                            break;
                        case "hitpath":
                            DoHitPathRuns(runId, reportJobName).GetAwaiter().GetResult();
                            break;
                        case "clickbooth":
                            DoClickBoothRuns(runId, reportJobName).GetAwaiter().GetResult();
                            break;
                        case "w4":
                            DoW4Runs(runId, reportJobName).GetAwaiter().GetResult();
                            break;
                        default:
                            DataLayer.InsertErrorLogSync(cfgConnectionString, 100, "IpJobs", "Main", "Invalid args", $"{apiProvider}::{reportJobName}");
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                DataLayer.InsertErrorLogSync(cfgConnectionString, 100, "IpJobs", "Main", "Exception", $"{ex.ToString()}");
            }            
        }

        public static void TestGetMaxmimumMissedDay(string reportJobName)
        {
            Tuple<DateTime?, int?> max = DataLayer.GetMostRecentMissedDay(cfgConnectionString, 46, reportJobName, DateTime.Today.AddDays(-2)).GetAwaiter().GetResult();
        }

        public static void SetAllowDBNull(DataTable dt)
        {
            foreach (DataColumn col in dt.Columns) col.AllowDBNull = true;
        }

        private static async Task DoCakeRuns(Guid runId, string reportJobName)
        {
            try
            {
                DateTime now = DateTime.Now;

                if (now.Hour >= 7 && now.Hour <= 18)
                {
                    // Standard jobs run from 7am to 6pm
                    DateTime baseTime = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0);
                    DateTime yesterday = baseTime.AddDays(-1);
                    DateTime firstStartTime = yesterday.AddHours(2 * (now.Hour - 7));
                    List<Tuple<DateTime, DateTime>> intervals = new List<Tuple<DateTime, DateTime>>();
                    intervals.Add(new Tuple<DateTime, DateTime>(firstStartTime, firstStartTime.AddHours(1)));
                    intervals.Add(new Tuple<DateTime, DateTime>(firstStartTime.AddHours(1), firstStartTime.AddHours(2)));

                    foreach (var interval in intervals)
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "DoCakeRuns", "Call CakeRuns 7-18", $"{interval.Item1.ToString()}::{interval.Item2.ToString()}");
                        await CakeRuns(runId, reportJobName, interval.Item1, interval.Item2);
                    }
                }
                else
                {
                    // Run missed/catch-up jobs
                    DateTime endDate = DateTime.Now;
                    if (now.Hour >= 19 && now.Hour <= 23)
                    {
                        endDate = new DateTime(now.Year, now.Month, now.Day, 18, 0, 0);
                        endDate = endDate.AddDays(-1);
                        await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "DoCakeRuns", "Call CakeMissedRuns 19-23", $"{endDate.ToString()}");
                        await CakeMissedRuns(runId, reportJobName, endDate);
                    }
                    else if (now.Hour >= 0 && now.Hour <= 6)
                    {
                        endDate = new DateTime(now.Year, now.Month, now.Day, 18, 0, 0);
                        endDate = endDate.AddDays(-2);
                        await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "DoCakeRuns", "Call CakeMissedRuns 0-6", $"{endDate.ToString()}");
                        await CakeMissedRuns(runId, reportJobName, endDate);
                    }
                    else
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoCakeRuns", "Unused interval", "");
                    }
                }
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "DoCakeRuns", "Exception", $"{ex.ToString()}");
            }            
        }

        private static async Task CakeRuns(Guid runId, string reportJobName, DateTime startRangeForHour, DateTime endRangeForHour)
        {
            try
            {
                foreach (var inboxPass in DataLayer.InboxPasswords.Values)
                {
                    if (inboxPass.ApiProvider == "Cake" && (inboxPass.ReportingApiKey != "" && inboxPass.ReportingApiKey != null))
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "CakeRuns", "Calling CakeRun",
                            $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForHour.ToString()}::{endRangeForHour.ToString()}");
                        await CakeRun(runId, reportJobName, inboxPass, startRangeForHour, endRangeForHour);
                    }
                }
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "CakeRuns", "Exception", $"{ex.ToString()}");
            }            
        }


        private static async Task CakeMissedRuns(Guid runId, string reportJobName, DateTime endDate)
        {
            Tuple<DateTime?, int?> missedStartTime;

            foreach (var inboxPass in DataLayer.InboxPasswords.Values)
            {
                if (inboxPass.ApiProvider == "Cake" && (inboxPass.ReportingApiKey != "" && inboxPass.ReportingApiKey != null))
                {
                    try
                    {
                        missedStartTime = await DataLayer.GetMostRecentMissedHour(evtConnectionString, inboxPass.Id, reportJobName, endDate);
                        
                        if (missedStartTime.Item1 != null)
                        {
                            if (missedStartTime.Item2 != null)
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "CakeMissedRuns", "Moving job status record to retry table (1)",
                                    $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.AddHours(1).ToString()}::{missedStartTime.Item2.Value.ToString()}");
                                await DataLayer.MoveJobStatusRecordToRetryTable(evtConnectionString, missedStartTime.Item2.Value);
                            }
                            else
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "CakeMissedRuns", "missedStartTime.Item2 is null (1)",
                                    $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.AddHours(1).ToString()}");
                            }

                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "CakeMissedRuns", "Calling CakeRun 1",
                                $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.AddHours(1).ToString()}");

                            await CakeRun(runId, reportJobName, inboxPass, missedStartTime.Item1.Value, missedStartTime.Item1.Value.AddHours(1));

                            missedStartTime = await DataLayer.GetMostRecentMissedHour(evtConnectionString, inboxPass.Id, reportJobName, endDate);
                            if (missedStartTime != null)
                            {
                                if (missedStartTime.Item2 != null)
                                {
                                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "CakeMissedRuns", "Moving job status record to retry table (2)",
                                        $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.AddHours(1).ToString()}::{missedStartTime.Item2.Value.ToString()}");
                                    await DataLayer.MoveJobStatusRecordToRetryTable(evtConnectionString, missedStartTime.Item2.Value);
                                }
                                else
                                {
                                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "CakeMissedRuns", "missedStartTime.Item2 is null (2)",
                                        $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.AddHours(1).ToString()}");
                                }

                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "CakeMissedRuns", "Calling CakeRun 2",
                                    $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.AddHours(1).ToString()}");

                                await CakeRun(runId, reportJobName, inboxPass, missedStartTime.Item1.Value, missedStartTime.Item1.Value.AddHours(1));
                            }                            
                        }
                        else
                        {
                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "CakeMissedRuns", "missedStartTime.Item1 (1) == null",
                                $"{runId.ToString()}::{reportJobName}::{endDate.ToString()}");
                        }
                        await DataLayer.SetMinimumMissedHour(evtConnectionString, inboxPass.Id, reportJobName, endDate);
                    }
                    catch (Exception ex)
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "CakeMissedRuns", "Exception", ex.ToString());
                    }
                }
            }
        }

        private static async Task CakeRun(Guid runId, string reportJobName, DataLayer.InboxPass inboxPass, DateTime startRangeForHour, DateTime endRangeForHour)
        {
            DateTime jobStartTime = DateTime.Now;
            DateTime jobEndTime = DateTime.Now;            

            try
            {
                DataTable dtClickReportData = DataLayer.DataTables["ReportData"].Clone();
                DataTable dtConversionReportData = DataLayer.DataTables["ReportData"].Clone();
                SetAllowDBNull(dtClickReportData);

                if (inboxPass.ApiProviderVersion == "v9")
                {
                    using (var client = new CakeV9.reportsSoapClient("reportsSoap1"))
                    {
                        client.Endpoint.Address = new EndpointAddress(inboxPass.ReportingApiUrl);

                        if (reportJobName == "click")
                        {
                            Guid jobId = Guid.NewGuid();
                            try
                            {                                
                                jobStartTime = DateTime.Now;
                                var clicks = client.Clicks(inboxPass.ReportingApiKey, Int32.Parse(inboxPass.AffiliateId), startRangeForHour, endRangeForHour, 0, 0, false, 0, 0);
                                jobEndTime = DateTime.Now;

                                if (clicks.success)
                                {
                                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "CakeRun", "Cake V9 Success",
                                        $"{reportJobName}::{startRangeForHour.ToString()}::{endRangeForHour.ToString()}::{inboxPass.Id.ToString()}::{jobId.ToString()}::{runId.ToString()}");

                                    foreach (var c in clicks.clicks)
                                    {
                                        dtClickReportData.Rows.Add(DataLayer.CakeClickReportDataRowV9(dtClickReportData, jobId, inboxPass.Id, reportJobName, c));
                                    }

                                    await DataLayer.InsertReportData(evtConnectionString, dtClickReportData);
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForHour, endRangeForHour,
                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, clicks.clicks.Count(), "", inboxPass.Id, "", false, runId, jobId);
                                }
                                else
                                {
                                    await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "CakeRun", "Cake V9 Fail",
                                        $"{reportJobName}::{startRangeForHour.ToString()}::{endRangeForHour.ToString()}::{inboxPass.Id.ToString()}::{jobId.ToString()}::{runId.ToString()}");
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForHour, endRangeForHour,
                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, clicks.message, true, runId, jobId);
                                }
                            }
                            catch (Exception ex)
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "CakeRun", "Exception V9",
                                    $"{reportJobName}::{startRangeForHour.ToString()}::{endRangeForHour.ToString()}::{inboxPass.Id.ToString()}::{runId.ToString()}::{jobId.ToString()}::{ex.ToString()}");
                                await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForHour, endRangeForHour,
                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, ex.ToString(), true, runId, jobId);
                            }
                        }
                        
                        if (reportJobName == "sale")
                        {
                            Guid jobId = Guid.NewGuid();
                            try
                            {
                                jobStartTime = DateTime.Now;
                                var conversions = client.EventConversions(inboxPass.ReportingApiKey, Int32.Parse(inboxPass.AffiliateId), startRangeForHour, endRangeForHour, 0, 0, "", CakeV9.event_type.all, true, 0, 0);
                                jobEndTime = DateTime.Now;

                                if (conversions.success)
                                {
                                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "CakeRun", "Cake V9 Success",
                                        $"{reportJobName}::{startRangeForHour.ToString()}::{endRangeForHour.ToString()}::{inboxPass.Id.ToString()}::{jobId.ToString()}::{runId.ToString()}");

                                    foreach (var ec in conversions.event_conversions)
                                    {
                                        dtConversionReportData.Rows.Add(DataLayer.CakeConversionReportDataRowV9(dtConversionReportData, jobId, inboxPass.Id, reportJobName, ec));
                                    }

                                    await DataLayer.InsertReportData(evtConnectionString, dtConversionReportData);
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForHour, endRangeForHour,
                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, conversions.event_conversions.Count(), "", inboxPass.Id, "", false, runId, jobId);
                                }
                                else
                                {
                                    await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "CakeRun", "Cake V9 Fail",
                                        $"{reportJobName}::{startRangeForHour.ToString()}::{endRangeForHour.ToString()}::{inboxPass.Id.ToString()}::{jobId.ToString()}::{runId.ToString()}");
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForHour, endRangeForHour,
                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, conversions.message, true, runId, jobId);
                                }
                            }
                            catch (Exception ex)
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "CakeRun", "Exception V9",
                                    $"{reportJobName}::{startRangeForHour.ToString()}::{endRangeForHour.ToString()}::{inboxPass.Id.ToString()}::{runId.ToString()}::{jobId.ToString()}::{ex.ToString()}");
                                await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForHour, endRangeForHour,
                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, ex.ToString(), true, runId, jobId);
                            }
                        }                        
                    }
                }
                else if (inboxPass.ApiProviderVersion == "v10")
                {
                    using (var client = new CakeV10.reportsSoapClient("reportsSoap"))
                    {
                        client.Endpoint.Address = new EndpointAddress(inboxPass.ReportingApiUrl);

                        if (reportJobName == "click")
                        {
                            Guid jobId = Guid.NewGuid();
                            try
                            {
                                jobStartTime = DateTime.Now;
                                var clicks = client.Clicks(inboxPass.ReportingApiKey, startRangeForHour, endRangeForHour, Int32.Parse(inboxPass.AffiliateId),
                                    0, 0, 0, 0, 0, false, false, 0, 0);
                                jobEndTime = DateTime.Now;

                                if (clicks.success)
                                {
                                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "CakeRun", "Cake V10 Success",
                                        $"{reportJobName}::{startRangeForHour.ToString()}::{endRangeForHour.ToString()}::{inboxPass.Id.ToString()}::{jobId.ToString()}::{runId.ToString()}");

                                    foreach (var c in clicks.clicks)
                                    {
                                        dtClickReportData.Rows.Add(DataLayer.CakeClickReportDataRowV10(dtClickReportData, jobId, inboxPass.Id, reportJobName, c));
                                    }

                                    await DataLayer.InsertReportData(evtConnectionString, dtClickReportData);
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForHour, endRangeForHour,
                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, clicks.clicks.Count(), "", inboxPass.Id, "", false, runId, jobId);
                                }
                                else
                                {
                                    await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "CakeRun", "Cake V10 Fail",
                                        $"{reportJobName}::{startRangeForHour.ToString()}::{endRangeForHour.ToString()}::{inboxPass.Id.ToString()}::{jobId.ToString()}::{runId.ToString()}");
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForHour, endRangeForHour,
                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, clicks.message, true, runId, jobId);
                                }
                            }
                            catch (Exception ex)
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "CakeRun", "Exception V10",
                                    $"{reportJobName}::{startRangeForHour.ToString()}::{endRangeForHour.ToString()}::{inboxPass.Id.ToString()}::{runId.ToString()}::{jobId.ToString()}::{ex.ToString()}");
                                await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForHour, endRangeForHour,
                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, ex.ToString(), true, runId, jobId);                                
                            }
                        }
                        
                        if (reportJobName == "sale")
                        {
                            Guid jobId = Guid.NewGuid();
                            try
                            {
                                jobStartTime = DateTime.Now;
                                var conversions = client.Conversions(inboxPass.ReportingApiKey, startRangeForHour, endRangeForHour, Int32.Parse(inboxPass.AffiliateId),
                                    0, 0, 0, 0, false, 0, 0, CakeV10.ConversionsSortFields.conversion_date, false);
                                jobEndTime = DateTime.Now;

                                if (conversions.success)
                                {
                                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "CakeRun", "Cake V10 Success",
                                        $"{reportJobName}::{startRangeForHour.ToString()}::{endRangeForHour.ToString()}::{inboxPass.Id.ToString()}::{jobId.ToString()}::{runId.ToString()}");

                                    foreach (var c in conversions.conversions)
                                    {
                                        dtConversionReportData.Rows.Add(DataLayer.CakeConversionReportDataRowV10(dtConversionReportData, jobId, inboxPass.Id, reportJobName, c));
                                    }

                                    await DataLayer.InsertReportData(evtConnectionString, dtConversionReportData);
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForHour, endRangeForHour,
                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, conversions.conversions.Count(), "", inboxPass.Id, "", false, runId, jobId);
                                }
                                else
                                {
                                    await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "CakeRun", "Cake V10 Fail",
                                        $"{reportJobName}::{startRangeForHour.ToString()}::{endRangeForHour.ToString()}::{inboxPass.Id.ToString()}::{jobId.ToString()}::{runId.ToString()}");
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForHour, endRangeForHour,
                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, conversions.message, true, runId, jobId);
                                }
                            }
                            catch (Exception ex)
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "CakeRun", "Exception V10",
                                    $"{reportJobName}::{startRangeForHour.ToString()}::{endRangeForHour.ToString()}::{inboxPass.Id.ToString()}::{runId.ToString()}::{jobId.ToString()}::{ex.ToString()}");
                                await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForHour, endRangeForHour,
                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, ex.ToString(), true, runId, jobId);                                
                            }
                        }                        
                    }
                }
                else
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "CakeRun", "Cake Not V9 or V10",
                        $"{reportJobName}::{startRangeForHour.ToString()}::{endRangeForHour.ToString()}::{inboxPass.Id.ToString()}::{runId.ToString()}");
                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForHour, endRangeForHour,
                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "The CAKE reporting URL was neither V9 or V10", true, runId, Guid.Empty);
                }
            }
            catch (Exception e)
            {
                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "CakeRun", "Exception", 
                    $"{reportJobName}::{startRangeForHour.ToString()}::{endRangeForHour.ToString()}::{inboxPass.Id.ToString()}::{runId.ToString()}::{e.ToString()}");
                await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForHour, endRangeForHour,
                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, e.ToString(), true, runId, Guid.Empty);                
            }
        }

        private static int HitPathCsvToDataTable(string csv, DataTable dtr, Guid jobId, int inboxPassId, string apiProviderVersion, string reportJobName, out int badCount)
        {
            badCount = 0;
            int count = 0;

            try
            { 
                string[] tableData = csv.Split("\n".ToCharArray(), StringSplitOptions.RemoveEmptyEntries);

                foreach (var st in tableData.Skip(1))
                {
                    if (st != null && st != "")
                    {
                        DataRow dr = DataLayer.HitPathCsvReportDataRow(dtr, jobId, inboxPassId, apiProviderVersion, st.Split(",".ToCharArray()), reportJobName);
                        if (dr != null)
                        {
                            dtr.Rows.Add(dr);
                            count++;
                        }
                        else
                        {
                            badCount++;
                        }
                    }
                    else
                    {
                        badCount++;
                    }
                }                
            }
            catch (Exception ex)
            {
                DataLayer.InsertErrorLogSync(cfgConnectionString, 100, "IpJobs", "HitPathCsvToDataTable", "Exception",
                    $"{reportJobName}::{inboxPassId.ToString()}::{jobId.ToString()}::{ex.ToString()}");
            }

            return count;
        }        

        private static async Task DoHitPathRuns(Guid runId, string reportJobName)
        {
            DateTime now = DateTime.Now;
            DateTime baseTime = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0);

            try
            {
                if (now.Hour == 14)
                {                    
                    DateTime yesterday = baseTime.AddDays(-1);
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoHitPathRuns", "Calling HitPathRuns =14",
                        $"{reportJobName}::{runId.ToString()}::{yesterday.ToString()}");
                    await HitPathRuns(runId, reportJobName, yesterday, yesterday);
                }
                else if (now.Hour < 14 && now.Hour % 2 == 0)
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoHitPathRuns", "Calling HitPathMissedRuns <14",
                        $"{reportJobName}::{runId.ToString()}::{baseTime.AddDays(-2).ToString()}");
                    await HitPathMissedRuns(runId, reportJobName, baseTime.AddDays(-2));
                }
                else if (now.Hour > 14 && now.Hour % 2 == 0)
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoHitPathRuns", "Calling HitPathMissedRuns >14",
                        $"{reportJobName}::{runId.ToString()}::{baseTime.AddDays(-1).ToString()}");
                    await HitPathMissedRuns(runId, reportJobName, baseTime.AddDays(-1));
                }
                else
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoHitPathRuns", "Unused interval", 
                        $"{reportJobName}::{runId.ToString()}");
                }
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "DoHitPathRuns", "Exception",
                    $"{reportJobName}::{runId.ToString()}::{ex.ToString()}");
            }            
        }        

        private static async Task HitPathRuns(Guid runId, string reportJobName, DateTime startRangeForDay, DateTime endRangeForDay)
        {
            try
            {
                foreach (var inboxPass in DataLayer.InboxPasswords.Values)
                {
                    if (inboxPass.ApiProvider == "HitPath" && (inboxPass.ReportingApiKey != "" && inboxPass.ReportingApiKey != null))
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "HitPathRuns", "Calling HitPathRun",
                            $"{reportJobName}::{runId.ToString()}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                        await HitPathRun(runId, reportJobName, inboxPass, startRangeForDay, endRangeForDay);
                    }
                }
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "HitPathRuns", "Exception",
                    $"{reportJobName}::{runId.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}::{ex.ToString()}");
            }            
        }


        private static async Task HitPathMissedRuns(Guid runId, string reportJobName, DateTime endDate)
        {
            Tuple<DateTime?, int?> missedStartTime;

            foreach (var inboxPass in DataLayer.InboxPasswords.Values)
            {
                if (inboxPass.ApiProvider == "HitPath" && (inboxPass.ReportingApiKey != "" && inboxPass.ReportingApiKey != null))
                {
                    try
                    {
                        missedStartTime = await DataLayer.GetMostRecentMissedDay(evtConnectionString, inboxPass.Id, reportJobName, endDate);
                        if (missedStartTime.Item1 != null)
                        {
                            if (missedStartTime.Item2 != null)
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "HitPathMissedRuns", "Moving job status record to retry table",
                                    $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item2.Value.ToString()}");
                                await DataLayer.MoveJobStatusRecordToRetryTable(evtConnectionString, missedStartTime.Item2.Value);
                            }
                            else
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "HitPathMissedRuns", "missedStartTime.Item2 is null",
                                    $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.ToString()}");
                            }

                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "HitPathMissedRuns", "Calling HitPathRun",
                                $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.ToString()}");

                            await HitPathRun(runId, reportJobName, inboxPass, missedStartTime.Item1.Value, missedStartTime.Item1.Value);                            
                        }
                        await DataLayer.SetMinimumMissedDay(evtConnectionString, inboxPass.Id, reportJobName, endDate);
                    }
                    catch (Exception ex)
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "HitPathMissedRuns", "Exception", 
                            $"{runId.ToString()}::{reportJobName}::{endDate.ToString()}::{ex.ToString()}");
                    }
                }
            }
        }        

        private static async Task TestHitPathRun(Guid runId, string reportJobName)
        {
            DateTime now = DateTime.Now;
            DateTime baseTime = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0);
            DateTime yesterday = baseTime.AddDays(-1);
            DataLayer.CreateDataTables(cfgConnectionString, evtConnectionString);
            DataLayer.InboxPass inboxPass = DataLayer.InboxPasswords[46];
            //await HitPathRun(runId, reportJobName, inboxPass, yesterday, yesterday);
            await HitPathMissedRuns(runId, reportJobName, yesterday);
        }

        private static async Task HitPathRun(Guid runId, string reportJobName, DataLayer.InboxPass inboxPass, DateTime startRangeForDay, DateTime endRangeForDay)
        {
            DateTime jobStartTime = DateTime.Now;
            DateTime jobEndTime = DateTime.Now;           

            if (reportJobName == "click")
            {
                Guid jobId = Guid.NewGuid();
                try
                {
                    HttpClient client = new HttpClient();
                    client.Timeout = new TimeSpan(0, 10, 0);
                    client.BaseAddress = new Uri(inboxPass.ReportingApiUrl);

                    DataTable dtReportData = DataLayer.DataTables["ReportData"].Clone();
                    SetAllowDBNull(dtReportData);

                    string rqst = "?key=" + inboxPass.ReportingApiKey + "&type=clicks&start=" + System.Web.HttpUtility.UrlEncode(startRangeForDay.ToShortDateString())
                        + "&end=" + System.Web.HttpUtility.UrlEncode(endRangeForDay.ToShortDateString()) + "&all_details=true&nozip=1";

                    jobStartTime = DateTime.Now;
                    HttpResponseMessage response = await client.GetAsync(rqst);
                    jobEndTime = DateTime.Now;

                    if (response.IsSuccessStatusCode)
                    {
                        string responseBody = await response.Content.ReadAsStringAsync();
                        int badCount = 0;
                        int count = HitPathCsvToDataTable(responseBody, dtReportData, jobId, inboxPass.Id, inboxPass.ApiProviderVersion, reportJobName, out badCount);

                        if (badCount > 0)
                        {
                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "HitPathRun", "badCount>0",
                                $"{runId.ToString()}::{jobId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}::{badCount.ToString()}");

                            string errorMsg = "BadCount = " + badCount;
                            await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, errorMsg, true, runId, jobId);
                        }
                        else
                        {
                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "HitPathRun", "Success",
                                $"{runId.ToString()}::{jobId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");

                            await DataLayer.InsertReportData(evtConnectionString, dtReportData);
                            await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, count, "", inboxPass.Id, "", false, runId, jobId);
                        }                       
                    }
                    else
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "HitPathRun", "Fail",
                                $"{runId.ToString()}::{jobId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");

                        await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, response.ReasonPhrase, true, runId, jobId);
                    }
                }
                catch (Exception e)
                {                    
                    await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "HitPathRun", "Exception",
                            $"{runId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}::{e.ToString()}");

                    jobEndTime = DateTime.Now;
                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, e.ToString(), true, runId, jobId);
                }
            }
            
            if (reportJobName == "sale")
            {
                Guid jobId = Guid.NewGuid();
                try
                {
                    HttpClient client = new HttpClient();
                    client.BaseAddress = new Uri(inboxPass.ReportingApiUrl);

                    DataTable dtReportData = DataLayer.DataTables["ReportData"].Clone();
                    SetAllowDBNull(dtReportData);

                    string rqst = "?key=" + inboxPass.ReportingApiKey + "&type=sales&start=" + System.Web.HttpUtility.UrlEncode(startRangeForDay.ToShortDateString())
                        + "&end=" + System.Web.HttpUtility.UrlEncode(endRangeForDay.ToShortDateString()) + "&all_details=true&nozip=1";

                    jobStartTime = DateTime.Now;
                    HttpResponseMessage response = await client.GetAsync(rqst);
                    jobEndTime = DateTime.Now;

                    if (response.IsSuccessStatusCode)
                    {
                        string responseBody = await response.Content.ReadAsStringAsync();
                        int badCount = 0;
                        int count = HitPathCsvToDataTable(responseBody, dtReportData, jobId, inboxPass.Id, inboxPass.ApiProviderVersion, reportJobName, out badCount);

                        if (badCount > 0)
                        {
                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "HitPathRun", "badCount>0",
                               $"{runId.ToString()}::{jobId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}::{badCount.ToString()}");

                            string errorMsg = "BadCount = " + badCount;
                            await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, errorMsg, true, runId, jobId);
                        }
                        else
                        {
                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "HitPathRun", "Success",
                               $"{runId.ToString()}::{jobId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");

                            await DataLayer.InsertReportData(evtConnectionString, dtReportData);
                            await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, count, "", inboxPass.Id, "", false, runId, jobId);
                        }                        
                    }
                    else
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "HitPathRun", "Fail",
                                $"{runId.ToString()}::{jobId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");

                        await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, response.ReasonPhrase, true, runId, jobId);
                    }
                }
                catch (Exception e)
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "HitPathRun", "Exception",
                            $"{runId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}::{e.ToString()}");

                    jobEndTime = DateTime.Now;
                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, e.ToString(), true, runId, jobId);
                    
                }
            }            
        }

        private static async Task DoClickBoothRuns(Guid runId, string reportJobName)
        {
            DateTime now = DateTime.Now;
            DateTime baseTime = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0);

            try
            {
                if (now.Hour == 7)
                {
                    // Standard job runs at 7am
                    DateTime yesterday = baseTime.AddDays(-1);

                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoClickBoothRuns", "Calling ClickBoothRuns =7",
                        $"{reportJobName}::{runId.ToString()}::{yesterday.ToString()}");

                    await ClickBoothRuns(runId, reportJobName, yesterday, yesterday);
                }
                else if (now.Hour < 7 && now.Hour % 2 == 0)
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoClickBoothRuns", "Calling ClickBoothMissedRuns <7",
                        $"{reportJobName}::{runId.ToString()}::{baseTime.AddDays(-2).ToString()}");

                    await ClickBoothMissedRuns(runId, reportJobName, baseTime.AddDays(-2));
                }
                else if (now.Hour > 7 && now.Hour % 2 == 0)
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoClickBoothRuns", "Calling ClickBoothMissedRuns >7",
                        $"{reportJobName}::{runId.ToString()}::{baseTime.AddDays(-2).ToString()}");

                    await ClickBoothMissedRuns(runId, reportJobName, baseTime.AddDays(-1));
                }
                else
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "DoClickBoothRuns", "Unused interval",
                        $"{reportJobName}::{runId.ToString()}");
                }
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "DoClickBoothRuns", "Exception",
                            $"{runId.ToString()}::{reportJobName}::{ex.ToString()}");

            }            
        }

        private static async Task ClickBoothRuns(Guid runId, string reportJobName, DateTime startRangeForDay, DateTime endRangeForDay)
        {
            try
            {
                foreach (var inboxPass in DataLayer.InboxPasswords.Values)
                {
                    if (inboxPass.ApiProvider == "ClickBooth" && (inboxPass.ReportingApiKey != "" && inboxPass.ReportingApiKey != null))
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRuns", "Calling ClickBoothRun",
                            $"{reportJobName}::{runId.ToString()}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                        await ClickBoothRun(runId, reportJobName, inboxPass, startRangeForDay, endRangeForDay);
                    }
                }
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "ClickBoothRuns", "Exception",
                    $"{runId.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}::{ex.ToString()}");
            }            
        }

        private static async Task ClickBoothMissedRuns(Guid runId, string reportJobName, DateTime endDate)
        {
            Tuple<DateTime?, int?> missedStartTime;

            foreach (var inboxPass in DataLayer.InboxPasswords.Values)
            {
                if (inboxPass.ApiProvider == "ClickBooth" && (inboxPass.ReportingApiKey != "" && inboxPass.ReportingApiKey != null))
                {
                    try
                    {
                        missedStartTime = await DataLayer.GetMostRecentMissedDay(evtConnectionString, inboxPass.Id, reportJobName, endDate);
                        if (missedStartTime.Item1 != null)
                        {
                            if (missedStartTime.Item2 != null)
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothMissedRuns", "Moving job status record to retry table",
                                    $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item2.Value.ToString()}");
                                await DataLayer.MoveJobStatusRecordToRetryTable(evtConnectionString, missedStartTime.Item2.Value);
                            }
                            else
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothMissedRuns", "missedStartTime.Item2 is null",
                                    $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.ToString()}");
                            }

                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothMissedRuns", "Calling ClickBoothRun",
                                $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.ToString()}");

                            await ClickBoothRun(runId, reportJobName, inboxPass, missedStartTime.Item1.Value, missedStartTime.Item1.Value);                            
                        }
                        await DataLayer.SetMinimumMissedDay(evtConnectionString, inboxPass.Id, reportJobName, endDate);
                    }
                    catch (Exception ex)
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "ClickBoothMissedRuns", "Exception",
                            $"{runId.ToString()}::{reportJobName}::{endDate.ToString()}::{ex.ToString()}");
                    }
                }
            }
        }
        
        private static async Task TestClickBoothRun(Guid runId, string reportJobName)
        {
            DateTime now = DateTime.Now;
            DateTime baseTime = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0);
            DateTime yesterday = baseTime.AddDays(-1);
            DataLayer.CreateDataTables(cfgConnectionString, evtConnectionString);
            DataLayer.InboxPass inboxPass = DataLayer.InboxPasswords[12];
            await ClickBoothRun(runId, reportJobName, inboxPass, yesterday, yesterday);
        }

        private static async Task ClickBoothRun(Guid runId, string reportJobName, DataLayer.InboxPass inboxPass, DateTime startRangeForDay, DateTime endRangeForDay)
        {
            DateTime jobStartTime = DateTime.Now;
            DateTime jobEndTime = DateTime.Now;

            if (reportJobName == "click")
            {
                Guid jobId = Guid.NewGuid();
                try
                {
                    DataTable dtReportData = DataLayer.DataTables["ReportData"].Clone();
                    SetAllowDBNull(dtReportData);

                    string rqst = "?get=clicks&api_key=" + inboxPass.ReportingApiKey + "&user_id=" + inboxPass.AffiliateId + "&from_date=" +
                        startRangeForDay.ToShortDateString() + "&to_date=" + endRangeForDay.ToShortDateString();

                    HttpClient client = new HttpClient();
                    client.BaseAddress = new Uri(inboxPass.ReportingApiUrl);

                    jobStartTime = DateTime.Now;
                    HttpResponseMessage response = await client.GetAsync(rqst);
                    jobEndTime = DateTime.Now;

                    if (response.IsSuccessStatusCode)
                    {
                        string responseBody = await response.Content.ReadAsStringAsync();
                        XmlDocument xml = new XmlDocument();
                        xml.LoadXml(responseBody);

                        if (xml.DocumentElement.Name == "clicks_response")
                        {
                            StringBuilder errorMsg = new StringBuilder();

                            XmlNode successNode = xml.SelectSingleNode("clicks_response/success");
                            if (successNode != null)
                            {
                                bool success;
                                if (Boolean.TryParse(successNode.InnerText, out success) && success)
                                {
                                    XmlNode countNode = xml.SelectSingleNode("clicks_response/number_of_rows");
                                    if (countNode != null)
                                    {
                                        int count;
                                        if (Int32.TryParse(countNode.InnerText, out count) && count > 0)
                                        {
                                            var clickNodes = xml.SelectNodes("clicks_response/clicks/click/click");
                                            if (clickNodes != null && clickNodes.Count > 0)
                                            {
                                                if (clickNodes.Count != count) errorMsg.Append("[Count = " + count + ", XmlCount = " + clickNodes.Count + "]");

                                                DataLayer.ParseClickBoothClickXml(dtReportData, jobId, inboxPass.Id, reportJobName, clickNodes);

                                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "Success",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");

                                                await DataLayer.InsertReportData(evtConnectionString, dtReportData);

                                                await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, count, "", inboxPass.Id, errorMsg.ToString(), false, runId, jobId);
                                            }
                                            else if (clickNodes != null && clickNodes.Count == 0)
                                            {
                                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "Zero records",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                                                await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, clickNodes.Count, "", inboxPass.Id, "Zero records", false, runId, jobId);
                                            }
                                            else
                                            {
                                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "clickNodes null or count less than 0",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                                                await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "clickNodes null or count less than 0", true, runId, jobId);
                                            }
                                        }
                                        else if (count == 0)
                                        {
                                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "Xml reported zero records",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                                            await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "Xml reported zero records", false, runId, jobId);
                                        }
                                        else
                                        {
                                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "countNode failed to parse",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                                            await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "countNode failed to parse", true, runId, jobId);
                                        }
                                    }
                                    else
                                    {
                                        await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "null countNode",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                                        await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "null countNode", true, runId, jobId);
                                    }
                                }
                                else
                                {
                                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "Failure",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");

                                    XmlNode clicksResponseNode = xml.SelectSingleNode("clicks_response");
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                   inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, clicksResponseNode.OuterXml, true, runId, jobId);
                                }
                            }
                            else
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "null successNode",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                                await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "null successNode", true, runId, jobId);
                            }
                        }
                        else
                        {
                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "xml.DocumentElement.Name != clicks_response",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                            await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id,
                                "xml.DocumentElement.Name != clicks_response [" + xml.DocumentElement.Name + "]", true, runId, jobId);
                        }
                    }
                    else
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "Response statuscode failed",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                        await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, response.ReasonPhrase, true, runId, jobId);
                    }
                }
                catch (Exception e)
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "ClickBoothRun", "Exception",
                            $"{runId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}::{e.ToString()}");
                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, e.ToString(), true, runId, jobId);
                   
                }
            }

            if (reportJobName == "sale")
            {
                Guid jobId = Guid.NewGuid();
                try
                {
                    DataTable dtReportData = DataLayer.DataTables["ReportData"].Clone();
                    SetAllowDBNull(dtReportData);

                    string rqst = "?get=conversions&api_key=" + inboxPass.ReportingApiKey + "&user_id=" + inboxPass.AffiliateId + "&from_date=" +
                        startRangeForDay.ToShortDateString() + "&to_date=" + endRangeForDay.ToShortDateString();

                    HttpClient client = new HttpClient();
                    client.BaseAddress = new Uri(inboxPass.ReportingApiUrl);

                    jobStartTime = DateTime.Now;
                    HttpResponseMessage response = await client.GetAsync(rqst);
                    jobEndTime = DateTime.Now;

                    if (response.IsSuccessStatusCode)
                    {
                        string responseBody = await response.Content.ReadAsStringAsync();
                        XmlDocument xml = new XmlDocument();
                        xml.LoadXml(responseBody);

                        if (xml.DocumentElement.Name == "conversions_response")
                        {
                            StringBuilder errorMsg = new StringBuilder();

                            XmlNode successNode = xml.SelectSingleNode("conversions_response/success");
                            if (successNode != null)
                            {
                                bool success;
                                if (Boolean.TryParse(successNode.InnerText, out success) && success)
                                {
                                    XmlNode countNode = xml.SelectSingleNode("conversions_response/number_of_rows");
                                    if (countNode != null)
                                    {
                                        int count;
                                        if (Int32.TryParse(countNode.InnerText, out count) && count > 0)
                                        {
                                            var conversionNodes = xml.SelectNodes("conversions_response/conversions/conversion/conversion");
                                            if (conversionNodes != null && conversionNodes.Count > 0)
                                            {
                                                if (conversionNodes.Count != count) errorMsg.Append("[Count = " + count + ", XmlCount = " + conversionNodes.Count + "]");

                                                DataLayer.ParseClickBoothConversionXml(dtReportData, jobId, inboxPass.Id, reportJobName, conversionNodes);

                                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "Success",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");

                                                await DataLayer.InsertReportData(evtConnectionString, dtReportData);

                                                await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, count, "", inboxPass.Id, errorMsg.ToString(), false, runId, jobId);
                                            }
                                            else if (conversionNodes != null && conversionNodes.Count == 0)
                                            {
                                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "Zero records",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                                                await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, conversionNodes.Count, "", inboxPass.Id, "Zero records", false, runId, jobId);
                                            }
                                            else
                                            {
                                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "clickNodes null or count less than 0",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                                                await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "conversionNodes null or count less than 0", true, runId, jobId);
                                            }
                                        }
                                        else if (count == 0)
                                        {
                                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "Xml reported zero records",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                                            await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "Xml reported zero records", false, runId, jobId);
                                        }
                                        else
                                        {
                                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "conversionNode failed to parse",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                                            await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "conversionNode failed to parse", true, runId, jobId);
                                        }
                                    }
                                    else
                                    {
                                        await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "null countNode",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                                        await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "null countNode", true, runId, jobId);
                                    }
                                }
                                else
                                {
                                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "Failure",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");

                                    XmlNode clicksResponseNode = xml.SelectSingleNode("clicks_response");
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                   inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, clicksResponseNode.OuterXml, true, runId, jobId);
                                }
                            }
                            else
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "null successNode",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                                await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "null successNode", true, runId, jobId);
                            }
                        }
                        else
                        {
                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "xml.DocumentElement.Name != conversions_response",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                            await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id,
                                "xml.DocumentElement.Name != conversions_response [" + xml.DocumentElement.Name + "]", true, runId, jobId);
                        }
                    }
                    else
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "ClickBoothRun", "Response statuscode failed",
                                                    $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                        await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, response.ReasonPhrase, true, runId, jobId);
                    }
                }
                catch (Exception e)
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "ClickBoothRun", "Exception",
                            $"{runId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}::{e.ToString()}");
                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, e.ToString(), true, runId, jobId);
                }
            }            
        }

        private static async Task DoW4Runs(Guid runId, string reportJobName)
        {
            DateTime now = DateTime.Now;
            DateTime baseTime = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0);

            try
            {
                if (now.Hour == 7 && reportJobName == "click")
                {
                    DateTime yesterday = baseTime.AddDays(-1);
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoW4Runs", "Calling W4ClickRuns =7",
                           $"39::{reportJobName}::{runId.ToString()}::{yesterday.ToString()}");
                    await W4ClickRuns(runId, reportJobName, yesterday, yesterday, 39);
                }
                else if (now.Hour == 8 && reportJobName == "sale")
                {
                    DateTime yesterday = baseTime.AddDays(-1);
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoW4Runs", "Calling W4ConversionRuns =8",
                           $"39::{reportJobName}::{runId.ToString()}::{yesterday.ToString()}");
                    await W4ConversionRuns(runId, reportJobName, yesterday, yesterday, 39);
                }
                else if (now.Hour == 9 && reportJobName == "click")
                {
                    DateTime yesterday = baseTime.AddDays(-1);
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoW4Runs", "Calling W4ClickRuns =9",
                           $"40::{reportJobName}::{runId.ToString()}::{yesterday.ToString()}");
                    await W4ClickRuns(runId, reportJobName, yesterday, yesterday, 40);
                }
                else if (now.Hour == 10 && reportJobName == "sale")
                {
                    DateTime yesterday = baseTime.AddDays(-1);
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoW4Runs", "Calling W4ConversionRuns =10",
                           $"40::{reportJobName}::{runId.ToString()}::{yesterday.ToString()}");
                    await W4ConversionRuns(runId, reportJobName, yesterday, yesterday, 40);
                }
                else if (now.Hour == 11 && reportJobName == "click")
                {
                    DateTime yesterday = baseTime.AddDays(-1);
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoW4Runs", "Calling W4ClickRuns =11",
                           $"41::{reportJobName}::{runId.ToString()}::{yesterday.ToString()}");
                    await W4ClickRuns(runId, reportJobName, yesterday, yesterday, 41);
                }
                else if (now.Hour == 12 && reportJobName == "sale")
                {
                    DateTime yesterday = baseTime.AddDays(-1);
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoW4Runs", "Calling W4conversionRuns =12",
                           $"41::{reportJobName}::{runId.ToString()}::{yesterday.ToString()}");
                    await W4ConversionRuns(runId, reportJobName, yesterday, yesterday, 41);
                }
                else if (now.Hour == 13 && reportJobName == "click")
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoW4Runs", "Calling W4MissedClickRuns =13",
                           $"39::{reportJobName}::{runId.ToString()}::{baseTime.AddDays(-1).ToString()}");
                    await W4MissedClickRuns(runId, reportJobName, baseTime.AddDays(-1), 39);
                }
                else if (now.Hour == 14 && reportJobName == "sale")
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoW4Runs", "Calling W4MissedConversionRuns =14",
                           $"39::{reportJobName}::{runId.ToString()}::{baseTime.AddDays(-1).ToString()}");
                    await W4MissedConversionRuns(runId, reportJobName, baseTime.AddDays(-1), 39);
                }
                else if (now.Hour == 15 && reportJobName == "click")
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoW4Runs", "Calling W4MissedClickRuns =15",
                           $"40::{reportJobName}::{runId.ToString()}::{baseTime.AddDays(-1).ToString()}");
                    await W4MissedClickRuns(runId, reportJobName, baseTime.AddDays(-1), 40);
                }
                else if (now.Hour == 16 && reportJobName == "sale")
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoW4Runs", "Calling W4MissedConversionRuns =16",
                           $"40::{reportJobName}::{runId.ToString()}::{baseTime.AddDays(-1).ToString()}");
                    await W4MissedConversionRuns(runId, reportJobName, baseTime.AddDays(-1), 40);
                }
                else if (now.Hour == 17 && reportJobName == "click")
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoW4Runs", "Calling W4MissedClickRuns =17",
                           $"41::{reportJobName}::{runId.ToString()}::{baseTime.AddDays(-1).ToString()}");
                    await W4MissedClickRuns(runId, reportJobName, baseTime.AddDays(-1), 41);
                }
                else if (now.Hour == 18 && reportJobName == "sale")
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoW4Runs", "Calling W4MissedConversionRuns =18",
                              $"41::{reportJobName}::{runId.ToString()}::{baseTime.AddDays(-1).ToString()}");
                    await W4MissedConversionRuns(runId, reportJobName, baseTime.AddDays(-1), 41);
                }
                else
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "DoW4Runs", "Unused W4 hour",
                              $"{reportJobName}::{runId.ToString()}::{baseTime.AddDays(-1).ToString()}");
                }
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "DoW4Runs", "Exception",
                            $"{runId.ToString()}::{reportJobName}::{ex.ToString()}");
            }            
        }

        private static async Task W4ClickRuns(Guid runId, string reportJobName, DateTime startRangeForDay, DateTime endRangeForDay, int inboxPassId)
        {
            try
            {
                foreach (var inboxPass in DataLayer.InboxPasswords.Values)
                {
                    if (inboxPass.ApiProvider == "W4" && (inboxPass.ReportingApiKey != "" && inboxPass.ReportingApiKey != null) && inboxPass.Id == inboxPassId)
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4ClickRuns", "Calling W4ClickRun",
                            $"{reportJobName}::{runId.ToString()}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                        await W4ClickRun(runId, reportJobName, inboxPass, startRangeForDay, endRangeForDay);
                    }
                }
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "W4ClickRuns", "Exception",
                            $"{runId.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}::{ex.ToString()}");
            }            
        }

        private static async Task W4ConversionRuns(Guid runId, string reportJobName, DateTime startRangeForDay, DateTime endRangeForDay, int inboxPassId)
        {
            try
            {
                foreach (var inboxPass in DataLayer.InboxPasswords.Values)
                {
                    if (inboxPass.ApiProvider == "W4" && (inboxPass.ReportingApiKey != "" && inboxPass.ReportingApiKey != null) && inboxPass.Id == inboxPassId)
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4ConversionRuns", "Calling W4ConversionRun",
                            $"{reportJobName}::{runId.ToString()}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");
                        await W4ConversionRun(runId, reportJobName, inboxPass, startRangeForDay, endRangeForDay);
                    }
                }
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "W4ConversionRuns", "Exception",
                            $"{runId.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}::{ex.ToString()}");
            }            
        }

        private static async Task W4MissedClickRuns(Guid runId, string reportJobName, DateTime endDate, int inboxPassId)
        {
            Tuple<DateTime?, int?> missedStartTime;

            foreach (var inboxPass in DataLayer.InboxPasswords.Values)
            {
                if (inboxPass.ApiProvider == "W4" && (inboxPass.ReportingApiKey != "" && inboxPass.ReportingApiKey != null) && inboxPass.Id == inboxPassId)
                {
                    try
                    {
                        missedStartTime = await DataLayer.GetMostRecentMissedDay(evtConnectionString, inboxPass.Id, reportJobName, endDate);
                        if (missedStartTime.Item1 != null)
                        {
                            if (missedStartTime.Item2 != null)
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4MissedClickRuns", "Moving job status record to retry table",
                                     $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item2.Value.ToString()}");
                                await DataLayer.MoveJobStatusRecordToRetryTable(evtConnectionString, missedStartTime.Item2.Value);
                            }
                            else
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4MissedClickRuns", "missedStartTime.Item2 is null",
                                    $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.ToString()}");
                            }

                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4MissedClickRuns", "Calling W4ClickRun",
                                $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.ToString()}");

                            await W4ClickRun(runId, reportJobName, inboxPass, missedStartTime.Item1.Value, missedStartTime.Item1.Value);                            
                        }
                        await DataLayer.SetMinimumMissedDay(evtConnectionString, inboxPass.Id, reportJobName, endDate);
                    }
                    catch (Exception ex)
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "W4MissedClickRuns", "Exception",
                            $"{runId.ToString()}::{reportJobName}::{endDate.ToString()}::{ex.ToString()}");
                    }
                }
            }
        }  

        private static async Task W4MissedConversionRuns(Guid runId, string reportJobName, DateTime endDate, int inboxPassId)
        {
            Tuple<DateTime?, int?> missedStartTime;

            foreach (var inboxPass in DataLayer.InboxPasswords.Values)
            {
                if (inboxPass.ApiProvider == "W4" && (inboxPass.ReportingApiKey != "" && inboxPass.ReportingApiKey != null) && inboxPass.Id == inboxPassId)
                {
                    try
                    {
                        missedStartTime = await DataLayer.GetMostRecentMissedDay(evtConnectionString, inboxPass.Id, reportJobName, endDate);
                        if (missedStartTime.Item1 != null)
                        {
                            if (missedStartTime.Item2 != null)
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4MissedConversionRuns", "Moving job status record to retry table",
                                     $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item2.Value.ToString()}");
                                await DataLayer.MoveJobStatusRecordToRetryTable(evtConnectionString, missedStartTime.Item2.Value);
                            }
                            else
                            {
                                await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4MissedConversionRuns", "missedStartTime.Item2 is null",
                                    $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.ToString()}");
                            }

                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4MissedConversionRuns", "Calling W4ConversionRun",
                                $"{runId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{missedStartTime.Item1.Value.ToString()}::{missedStartTime.Item1.Value.ToString()}");

                            await W4ConversionRun(runId, reportJobName, inboxPass, missedStartTime.Item1.Value, missedStartTime.Item1.Value);                            
                        }
                        await DataLayer.SetMinimumMissedDay(evtConnectionString, inboxPass.Id, reportJobName, endDate);
                    }
                    catch (Exception ex)
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "W4MissedConversionRuns", "Exception",
                            $"{runId.ToString()}::{reportJobName}::{endDate.ToString()}::{ex.ToString()}");
                    }
                }
            }
        }

        private static async Task TestW4ClickRun(Guid runId, string reportJobName)
        {
            DateTime now = DateTime.Now;
            DateTime baseTime = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0);
            DateTime yesterday = baseTime.AddDays(-1);
            DataLayer.CreateDataTables(cfgConnectionString, evtConnectionString);
            DataLayer.InboxPass inboxPass = DataLayer.InboxPasswords[39];
            await W4ClickRun(runId, reportJobName, inboxPass, yesterday, yesterday);
        }

        private static int W4CsvToDataTable(string csv, DataTable dtr, Guid jobId, int inboxPassId, string apiProvider, string reportJobName, out int badCount)
        {
            badCount = 0;
            int count = 0;

            try
            {
                string[] tableData = csv.Split("\n".ToCharArray(), StringSplitOptions.RemoveEmptyEntries);

                foreach (var st in tableData.Skip(1))
                {
                    if (st != null && st != "")
                    {
                        DataRow dr = DataLayer.W4CsvReportDataRow(dtr, jobId, inboxPassId, st.Split(",".ToCharArray()), reportJobName);
                        if (dr != null)
                        {
                            dtr.Rows.Add(dr);
                            count++;
                        }
                        else
                        {
                            badCount++;
                        }
                    }
                    else
                    {
                        badCount++;
                    }
                }

            }
            catch (Exception ex)
            {
                DataLayer.InsertErrorLogSync(cfgConnectionString, 100, "IpJobs", "W4CsvToDataTable", "Exception",
                    $"{reportJobName}::{inboxPassId.ToString()}::{jobId.ToString()}::{ex.ToString()}");
            }
            
            return count;
        }

        private static async Task W4ClickRun(Guid runId, string reportJobName, DataLayer.InboxPass inboxPass, DateTime startRangeForDay, DateTime endRangeForDay)
        {
            DateTime jobStartTime = DateTime.Now;
            DateTime jobEndTime = DateTime.Now;
            Guid jobId = Guid.NewGuid();
            try
            {
                HttpClientHandler handler = new HttpClientHandler()
                {
                    AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
                };

                HttpClient client = new HttpClient(handler);
                client.BaseAddress = new Uri(inboxPass.ReportingApiUrl);

                DataTable dtReportData = DataLayer.DataTables["ReportData"].Clone();
                SetAllowDBNull(dtReportData);

                string rqst = "?key=" + inboxPass.ReportingApiKey + "&type=clicks&start=" + System.Web.HttpUtility.UrlEncode(startRangeForDay.ToShortDateString())
                    + "&end=" + System.Web.HttpUtility.UrlEncode(endRangeForDay.ToShortDateString()) + "&all_details=true&format=csv";

                jobStartTime = DateTime.Now;
                HttpResponseMessage response = await client.GetAsync(rqst);
                jobEndTime = DateTime.Now;

                if (response.IsSuccessStatusCode)
                {
                    string content = await response.Content.ReadAsStringAsync();
                    if (content.Contains("Reports are available every 15 minutes"))
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4ClickRun", "Within 15 minutes",
                                     $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");

                        await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                           inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, content, true, runId, jobId);
                    }
                    else
                    {
                        var responseStream = await response.Content.ReadAsStreamAsync();

                        string responseBody = String.Empty;
                        using (var zip = new ZipArchive(responseStream, ZipArchiveMode.Read))
                        {
                            foreach (var entry in zip.Entries)
                            {
                                using (StreamReader sr = new StreamReader(entry.Open()))
                                {
                                    responseBody = sr.ReadToEnd();

                                    if (responseBody.Length > 0) break;
                                }
                            }
                        }

                        int badCount = 0;
                        int count = W4CsvToDataTable(responseBody, dtReportData, jobId, inboxPass.Id, inboxPass.ApiProvider, reportJobName, out badCount);
                        
                        if (badCount > 0)
                        {
                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4ClickRun", "badCount>0",
                                $"{runId.ToString()}::{jobId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}::{badCount.ToString()}");

                            string errorMsg = "BadCount = " + badCount;
                            await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, count, "", inboxPass.Id, errorMsg, true, runId, jobId);
                        }
                        else
                        {
                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4ClickRun", "Success",
                                $"{runId.ToString()}::{jobId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");

                            await DataLayer.InsertReportData(evtConnectionString, dtReportData);
                            await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, count, "", inboxPass.Id, "", false, runId, jobId);
                        }
                        
                    }
                }
                else
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4ClickRun", "Fail",
                                $"{runId.ToString()}::{jobId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");

                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, response.ReasonPhrase, true, runId, jobId);
                }
            }
            catch (Exception e)
            {
                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "W4ClickRun", "Exception",
                            $"{runId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}::{e.ToString()}");

                await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, e.ToString(), true, runId, jobId);
            }            
        }

        private static async Task W4ConversionRun(Guid runId, string reportJobName, DataLayer.InboxPass inboxPass, DateTime startRangeForDay, DateTime endRangeForDay)
        {
            DateTime jobStartTime = DateTime.Now;
            DateTime jobEndTime = DateTime.Now;
            Guid jobId = Guid.NewGuid();

            try
            {
                HttpClientHandler handler = new HttpClientHandler()
                {
                    AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
                };

                HttpClient client = new HttpClient(handler);
                client.BaseAddress = new Uri(inboxPass.ReportingApiUrl);

                DataTable dtReportData = DataLayer.DataTables["ReportData"].Clone();
                SetAllowDBNull(dtReportData);

                string rqst = "?key=" + inboxPass.ReportingApiKey + "&type=sales&start=" + System.Web.HttpUtility.UrlEncode(startRangeForDay.ToShortDateString())
                    + "&end=" + System.Web.HttpUtility.UrlEncode(endRangeForDay.ToShortDateString()) + "&all_details=true&format=csv";

                jobStartTime = DateTime.Now;
                HttpResponseMessage response = await client.GetAsync(rqst);
                jobEndTime = DateTime.Now;

                if (response.IsSuccessStatusCode)
                {
                    string content = await response.Content.ReadAsStringAsync();
                    if (content.Contains("Reports are available every 15 minutes"))
                    {
                        await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4ConversionRun", "Within 15 minutes",
                                     $"{runId.ToString()}::{jobId.ToString()}::{reportJobName}::{inboxPass.Id.ToString()}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");

                        await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                           inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, content, true, runId, jobId);
                    }
                    else
                    {
                        var responseStream = await response.Content.ReadAsStreamAsync();

                        string responseBody = String.Empty;
                        using (var zip = new ZipArchive(responseStream, ZipArchiveMode.Read))
                        {
                            foreach (var entry in zip.Entries)
                            {
                                using (StreamReader sr = new StreamReader(entry.Open()))
                                {
                                    responseBody = sr.ReadToEnd();

                                    if (responseBody.Length > 0) break;
                                }
                            }
                        }

                        int badCount = 0;
                        int count = W4CsvToDataTable(responseBody, dtReportData, jobId, inboxPass.Id, inboxPass.ApiProvider, reportJobName, out badCount);      

                        if (badCount > 0)
                        {
                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4ConversionRun", "badCount>0",
                                $"{runId.ToString()}::{jobId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}::{badCount.ToString()}");

                            string errorMsg = "BadCount = " + badCount;
                            await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, count, "", inboxPass.Id, errorMsg, true, runId, jobId);
                        }
                        else
                        {
                            await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4ConversionRun", "Success",
                                $"{runId.ToString()}::{jobId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");

                            await DataLayer.InsertReportData(evtConnectionString, dtReportData);
                            await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, count, "", inboxPass.Id, "", false, runId, jobId);
                        }                        
                    }
                }
                else
                {
                    await DataLayer.InsertErrorLog(cfgConnectionString, 1, "IpJobs", "W4ConversionRun", "Fail",
                               $"{runId.ToString()}::{jobId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}");

                    await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, response.ReasonPhrase, true, runId, jobId);
                }
            }
            catch (Exception e)
            {
                await DataLayer.InsertErrorLog(cfgConnectionString, 100, "IpJobs", "W4ConversionRun", "Exception",
                            $"{runId.ToString()}::{inboxPass.Id.ToString()}::{reportJobName}::{startRangeForDay.ToString()}::{endRangeForDay.ToString()}::{e.ToString()}");

                await DataLayer.InsertIpJobStatus(evtConnectionString, reportJobName, startRangeForDay, endRangeForDay,
                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, e.ToString(), true, runId, jobId);

            }
        }
    }
}
