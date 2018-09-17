using System;
using System.Collections.Specialized;
using System.Data;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel;
using System.Text;
using System.Windows.Forms;
using System.Xml;

namespace CakeIntegration
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        string cfgConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";
        string evtConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";

        public static void SetAllowDBNull(DataTable dt)
        {
            foreach (DataColumn col in dt.Columns) col.AllowDBNull = true;
        }

        private async void CakeRuns()
        {
            DataLayer.CreateDataTables(cfgConnectionString, evtConnectionString);

            DateTime t1 = DateTime.Now;
            t1 = t1.AddDays(-1);
            DateTime startRangeForHour = new DateTime(t1.Year, t1.Month, t1.Day, t1.Hour, 0, 0);
            t1 = t1.AddHours(1);
            DateTime endRangeForHour = new DateTime(t1.Year, t1.Month, t1.Day, t1.Hour, 0, 0);

            DateTime jobStartTime = DateTime.Now;
            DateTime jobEndTime = DateTime.Now;            

            foreach (var inboxPass in DataLayer.InboxPasswords.Values)
            {
                try
                {
                    DataTable dtReportData = DataLayer.DataTables["ReportData"].Clone();
                    SetAllowDBNull(dtReportData);

                    if (inboxPass.ApiProvider == "Cake")
                    {
                        if (inboxPass.ReportingApiUrl.Contains("/affiliates/api/9/"))
                        {
                            using (var client = new CakeV9.reportsSoapClient("reportsSoap"))
                            {
                                client.Endpoint.Address = new EndpointAddress(inboxPass.ReportingApiUrl);

                                try
                                {
                                    jobStartTime = DateTime.Now;
                                    var clicks = client.Clicks(inboxPass.ReportingApiKey, Int32.Parse(inboxPass.AffiliateId), startRangeForHour, endRangeForHour, 0, 0, false, 0, 0);
                                    jobEndTime = DateTime.Now;

                                    if (clicks.success)
                                    {
                                        foreach (var c in clicks.clicks)
                                        {
                                            dtReportData.Rows.Add(DataLayer.CakeClickReportDataRowV9(dtReportData, inboxPass.Id, c));
                                        }

                                        await DataLayer.InsertReportData(evtConnectionString, dtReportData);
                                        await DataLayer.InsertIpJobStatus(evtConnectionString, "CakeClickV9", startRangeForHour, endRangeForHour,
                                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, clicks.clicks.Count(), "", inboxPass.Id, "");
                                    }
                                    else
                                    {
                                        // Write error message to database to signify failure
                                        await DataLayer.InsertIpJobStatus(evtConnectionString, "CakeClickV9", startRangeForHour, endRangeForHour,
                                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, clicks.message);
                                    }
                                }
                                catch (Exception ex)
                                {
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, "CakeClickV9", startRangeForHour, endRangeForHour,
                                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, ex.ToString());
                                }

                                try
                                {
                                    jobStartTime = DateTime.Now;
                                    var conversions = client.EventConversions(inboxPass.ReportingApiKey, Int32.Parse(inboxPass.AffiliateId), startRangeForHour, endRangeForHour, 0, 0, "", CakeV9.event_type.all, true, 0, 0);
                                    jobEndTime = DateTime.Now;

                                    if (conversions.success)
                                    {
                                        foreach (var ec in conversions.event_conversions)
                                        {
                                            dtReportData.Rows.Add(DataLayer.CakeConversionReportDataRowV9(dtReportData, inboxPass.Id, ec));
                                        }

                                        await DataLayer.InsertReportData(evtConnectionString, dtReportData);
                                        await DataLayer.InsertIpJobStatus(evtConnectionString, "CakeConversionV9", startRangeForHour, endRangeForHour,
                                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, conversions.event_conversions.Count(), "", inboxPass.Id, "");
                                    }
                                    else
                                    {
                                        // Write error message to database to signify failure
                                        await DataLayer.InsertIpJobStatus(evtConnectionString, "CakeConversionV9", startRangeForHour, endRangeForHour,
                                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, conversions.message);
                                    }
                                }
                                catch (Exception ex)
                                {
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, "CakeConversionV9", startRangeForHour, endRangeForHour,
                                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, ex.ToString());
                                }                                
                            }
                        }
                        else if (inboxPass.ReportingApiUrl.Contains("/api/10/"))
                        {
                            using (var client = new CakeV10.reportsSoapClient("reportsSoap1"))
                            {
                                client.Endpoint.Address = new EndpointAddress(inboxPass.ReportingApiUrl);

                                try
                                {
                                    jobStartTime = DateTime.Now;
                                    var clicks = client.Clicks(inboxPass.ReportingApiKey, startRangeForHour, endRangeForHour, Int32.Parse(inboxPass.AffiliateId),
                                        0, 0, 0, 0, 0, false, false, 0, 0);
                                    jobEndTime = DateTime.Now;

                                    if (clicks.success)
                                    {
                                        foreach (var c in clicks.clicks)
                                        {
                                            dtReportData.Rows.Add(DataLayer.CakeClickReportDataRowV10(dtReportData, inboxPass.Id, c));
                                        }

                                        await DataLayer.InsertReportData(evtConnectionString, dtReportData);
                                        await DataLayer.InsertIpJobStatus(evtConnectionString, "CakeClickV10", startRangeForHour, endRangeForHour,
                                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, clicks.clicks.Count(), "", inboxPass.Id, "");
                                    }
                                    else
                                    {
                                        // Write error message to database to signify failure
                                        await DataLayer.InsertIpJobStatus(evtConnectionString, "CakeClickV10", startRangeForHour, endRangeForHour,
                                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, clicks.message);
                                    }
                                }
                                catch (Exception ex)
                                {
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, "CakeClickV10", startRangeForHour, endRangeForHour,
                                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, ex.ToString());
                                }
                               
                                try
                                {
                                    jobStartTime = DateTime.Now;
                                    var conversions = client.Conversions(inboxPass.ReportingApiKey, startRangeForHour, endRangeForHour, Int32.Parse(inboxPass.AffiliateId),
                                        0, 0, 0, 0, false, 0, 0, CakeV10.ConversionsSortFields.conversion_date, false);
                                    jobEndTime = DateTime.Now;

                                    if (conversions.success)
                                    {
                                        foreach (var c in conversions.conversions)
                                        {
                                            dtReportData.Rows.Add(DataLayer.CakeConversionReportDataRowV10(dtReportData, inboxPass.Id, c));
                                        }

                                        await DataLayer.InsertReportData(evtConnectionString, dtReportData);
                                        await DataLayer.InsertIpJobStatus(evtConnectionString, "CakeConversionV10", startRangeForHour, endRangeForHour,
                                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, conversions.conversions.Count(), "", inboxPass.Id, "");
                                    }
                                    else
                                    {
                                        // Write error message to database to signify failure
                                        await DataLayer.InsertIpJobStatus(evtConnectionString, "CakeConversionV10", startRangeForHour, endRangeForHour,
                                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, conversions.message);
                                    }
                                }
                                catch (Exception ex)
                                {
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, "CakeConversionV10", startRangeForHour, endRangeForHour,
                                            inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, ex.ToString());
                                }
                            }
                        }
                        else
                        {
                            await DataLayer.InsertIpJobStatus(evtConnectionString, "Cake", startRangeForHour, endRangeForHour,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "The CAKE reporting URL was neither V9 or V10");
                        }
                    }
                }
                catch (Exception e)
                {
                    await DataLayer.InsertIpJobStatus(evtConnectionString, "Cake", startRangeForHour, endRangeForHour,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, e.ToString());
                }
            }
        }

        private static int CsvToDataTable(string csv, DataTable dtr, int inboxPassId, string type, out int badCount)
        {
            badCount = 0;
            int count = 0;
            
            string[] tableData = csv.Split("\n".ToCharArray(), StringSplitOptions.RemoveEmptyEntries);
            
            foreach (var st in tableData.Skip(1))
            {
                if (st != null && st != "")
                {
                    DataRow dr = DataLayer.CsvReportDataRow(dtr, inboxPassId, st.Split(",".ToCharArray()), type);
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

            return count;
        }        

        private async void HitPathRuns()
        {
            DataLayer.CreateDataTables(cfgConnectionString, evtConnectionString);

            DateTime t2 = DateTime.Now;
            t2 = t2.AddDays(-1);
            DateTime startRangeForDay = new DateTime(t2.Year, t2.Month, t2.Day, 0, 0, 0);
            t2 = t2.AddDays(1);
            DateTime endRangeForDay = new DateTime(t2.Year, t2.Month, t2.Day, 0, 0, 0);

            DateTime jobStartTime = DateTime.Now;
            DateTime jobEndTime = DateTime.Now;

            foreach (var inboxPass in DataLayer.InboxPasswords.Values)
            {
                if (inboxPass.ApiProvider == "HitPath")
                {
                    try
                    {
                        HttpClient client = new HttpClient();
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
                            int count = CsvToDataTable(responseBody, dtReportData, inboxPass.Id, "click", out badCount);
                            await DataLayer.InsertReportData(evtConnectionString, dtReportData);

                            string errorMsg = String.Empty;
                            if (badCount > 0) errorMsg = "BadCount = " + badCount; 

                            await DataLayer.InsertIpJobStatus(evtConnectionString, "HitPathClick", startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, count, "", inboxPass.Id, errorMsg);
                        }
                        else
                        {
                            await DataLayer.InsertIpJobStatus(evtConnectionString, "HitPathClick", startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, response.ReasonPhrase);
                        }
                    }
                    catch (Exception e)
                    {
                        await DataLayer.InsertIpJobStatus(evtConnectionString, "HitPathClick", startRangeForDay, endRangeForDay,
                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, e.ToString());
                    }

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
                            int count = CsvToDataTable(responseBody, dtReportData, inboxPass.Id, "conversion", out badCount);
                            await DataLayer.InsertReportData(evtConnectionString, dtReportData);

                            string errorMsg = String.Empty;
                            if (badCount > 0) errorMsg = "BadCount = " + badCount;

                            await DataLayer.InsertIpJobStatus(evtConnectionString, "HitPathSale", startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, count, "", inboxPass.Id, errorMsg);
                        }
                        else
                        {
                            await DataLayer.InsertIpJobStatus(evtConnectionString, "HitPathSale", startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, response.ReasonPhrase);
                        }
                    }
                    catch (Exception e)
                    {
                        await DataLayer.InsertIpJobStatus(evtConnectionString, "HitPathClick", startRangeForDay, endRangeForDay,
                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, e.ToString());
                    }
                }
            }
        }        

        private async void ClickBoothRuns()
        {
            DataLayer.CreateDataTables(cfgConnectionString, evtConnectionString);

            DateTime t2 = DateTime.Now;
            t2 = t2.AddDays(-1);
            DateTime startRangeForDay = new DateTime(t2.Year, t2.Month, t2.Day, 0, 0, 0);
            DateTime endRangeForDay = startRangeForDay;

            DateTime jobStartTime = DateTime.Now;
            DateTime jobEndTime = DateTime.Now;

            foreach (var inboxPass in DataLayer.InboxPasswords.Values)
            {
                if (inboxPass.ApiProvider == "ClickBooth" && (inboxPass.ReportingApiKey != "" && inboxPass.ReportingApiKey != null))
                {
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

                                                    DataLayer.ParseClickBoothClickXml(dtReportData, inboxPass.Id, clickNodes);

                                                    await DataLayer.InsertReportData(evtConnectionString, dtReportData);

                                                    await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothClick", startRangeForDay, endRangeForDay,
                                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, count, "", inboxPass.Id, errorMsg.ToString());
                                                }
                                                else if (clickNodes != null && clickNodes.Count == 0)
                                                {
                                                    await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothClick", startRangeForDay, endRangeForDay,
                                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, clickNodes.Count, "", inboxPass.Id, "");
                                                }
                                                else
                                                {
                                                    await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothClick", startRangeForDay, endRangeForDay,
                                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "clickNodes null or count less than 0");
                                                }
                                            }
                                            else
                                            {
                                                await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothClick", startRangeForDay, endRangeForDay,
                                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "countNode failed to parse or count 0");
                                            }
                                        }
                                        else
                                        {
                                            await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothClick", startRangeForDay, endRangeForDay,
                                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "null countNode");
                                        }
                                    }
                                    else
                                    {
                                        XmlNode clicksResponseNode = xml.SelectSingleNode("clicks_response");
                                        await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothClick", startRangeForDay, endRangeForDay,
                                                       inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, clicksResponseNode.OuterXml);
                                    }
                                }
                                else
                                {
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothClick", startRangeForDay, endRangeForDay,
                                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "null successNode");
                                }
                            }
                            else
                            {
                                await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothClick", startRangeForDay, endRangeForDay,
                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, 
                                    "xml.DocumentElement.Name != clicks_response [" + xml.DocumentElement.Name +"]");
                            }
                        }
                        else
                        {
                            await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothClick", startRangeForDay, endRangeForDay,
                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, response.ReasonPhrase);
                        }
                    }
                    catch (Exception e)
                    {
                        await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothClick", startRangeForDay, endRangeForDay,
                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, e.ToString());
                    }

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
                                                var conversionNodes = xml.SelectNodes("conversions_response/conversions/conversion");
                                                if (conversionNodes != null && conversionNodes.Count > 0)
                                                {
                                                    if (conversionNodes.Count != count) errorMsg.Append("[Count = " + count + ", XmlCount = " + conversionNodes.Count + "]");

                                                    DataLayer.ParseClickBoothConversionXml(dtReportData, inboxPass.Id, conversionNodes);

                                                    await DataLayer.InsertReportData(evtConnectionString, dtReportData);

                                                    await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothConversion", startRangeForDay, endRangeForDay,
                                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, count, "", inboxPass.Id, errorMsg.ToString());
                                                }
                                                else if (conversionNodes != null && conversionNodes.Count == 0)
                                                {
                                                    await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothConversion", startRangeForDay, endRangeForDay,
                                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, conversionNodes.Count, "", inboxPass.Id, "");
                                                }
                                                else
                                                {
                                                    await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothConversion", startRangeForDay, endRangeForDay,
                                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "conversionNodes null or count less than 0");
                                                }
                                            }
                                            else
                                            {
                                                await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothConversion", startRangeForDay, endRangeForDay,
                                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "conversionNode failed to parse or count 0");
                                            }
                                        }
                                        else
                                        {
                                            await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothConversion", startRangeForDay, endRangeForDay,
                                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "null countNode");
                                        }
                                    }
                                    else
                                    {
                                        XmlNode clicksResponseNode = xml.SelectSingleNode("clicks_response");
                                        await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothConversion", startRangeForDay, endRangeForDay,
                                                       inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, clicksResponseNode.OuterXml);
                                    }
                                }
                                else
                                {
                                    await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothConversion", startRangeForDay, endRangeForDay,
                                                        inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, "null successNode");
                                }
                            }
                            else
                            {
                                await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothConversion", startRangeForDay, endRangeForDay,
                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id,
                                    "xml.DocumentElement.Name != conversions_response [" + xml.DocumentElement.Name + "]");
                            }
                        }
                        else
                        {
                            await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothConversion", startRangeForDay, endRangeForDay,
                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, response.ReasonPhrase);
                        }
                    }
                    catch (Exception e)
                    {
                        await DataLayer.InsertIpJobStatus(evtConnectionString, "ClickBoothConversion", startRangeForDay, endRangeForDay,
                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, e.ToString());
                    }
                }
            }
        }        

        private async void W4Runs()
        {
            DataLayer.CreateDataTables(cfgConnectionString, evtConnectionString);

            DateTime t2 = DateTime.Now;
            t2 = t2.AddDays(-1);
            DateTime startRangeForDay = new DateTime(t2.Year, t2.Month, t2.Day, 0, 0, 0);
            DateTime endRangeForDay = startRangeForDay;

            DateTime jobStartTime = DateTime.Now;
            DateTime jobEndTime = DateTime.Now;

            foreach (var inboxPass in DataLayer.InboxPasswords.Values)
            {
                if (inboxPass.ApiProvider == "W4" && (inboxPass.ReportingApiKey != "" && inboxPass.ReportingApiKey != null) && inboxPass.Id == 39)
                {
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
                                await DataLayer.InsertIpJobStatus(evtConnectionString, "W4Click", startRangeForDay, endRangeForDay,
                                   inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, content);
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
                                int count = CsvToDataTable(responseBody, dtReportData, inboxPass.Id, "click", out badCount);
                                await DataLayer.InsertReportData(evtConnectionString, dtReportData);

                                string errorMsg = String.Empty;
                                if (badCount > 0) errorMsg = "BadCount = " + badCount;

                                await DataLayer.InsertIpJobStatus(evtConnectionString, "W4Click", startRangeForDay, endRangeForDay,
                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, count, "", inboxPass.Id, errorMsg);
                            }
                        }
                        else
                        {
                            await DataLayer.InsertIpJobStatus(evtConnectionString, "W4Click", startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, response.ReasonPhrase);
                        }
                    }
                    catch (Exception e)
                    {
                        await DataLayer.InsertIpJobStatus(evtConnectionString, "W4Click", startRangeForDay, endRangeForDay,
                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, e.ToString());
                    }

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
                                await DataLayer.InsertIpJobStatus(evtConnectionString, "W4Conversion", startRangeForDay, endRangeForDay,
                                   inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, content);
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
                                int count = CsvToDataTable(responseBody, dtReportData, inboxPass.Id, "conversion", out badCount);
                                await DataLayer.InsertReportData(evtConnectionString, dtReportData);

                                string errorMsg = String.Empty;
                                if (badCount > 0) errorMsg = "BadCount = " + badCount;

                                await DataLayer.InsertIpJobStatus(evtConnectionString, "W4Conversion", startRangeForDay, endRangeForDay,
                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, count, "", inboxPass.Id, errorMsg);
                            }                                
                        }
                        else
                        {
                            await DataLayer.InsertIpJobStatus(evtConnectionString, "W4Conversion", startRangeForDay, endRangeForDay,
                                inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, response.ReasonPhrase);
                        }
                    }
                    catch (Exception e)
                    {
                        await DataLayer.InsertIpJobStatus(evtConnectionString, "W4Conversion", startRangeForDay, endRangeForDay,
                                    inboxPass.ReportingApiUrl, jobStartTime, jobEndTime, 0, "", inboxPass.Id, e.ToString());
                    }
                }
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
        }

        private void button2_Click(object sender, EventArgs e)
        {
            
        }

        private void button3_Click(object sender, EventArgs e)
        {
           
        }

        private void button4_Click(object sender, EventArgs e)
        {
            CakeRuns();
        }

        private void button5_Click(object sender, EventArgs e)
        {
            HitPathRuns();
        }

        private void button6_Click(object sender, EventArgs e)
        {
            W4Runs();
        }

        private void button7_Click(object sender, EventArgs e)
        {
            
        }

        private void button8_Click(object sender, EventArgs e)
        {
            ClickBoothRuns();
        }
    }    
}
