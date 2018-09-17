using Microsoft.SqlServer.Management.Common;
using Microsoft.SqlServer.Management.Smo;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;

namespace DataLayerExtensions
{
    public static class DataTableExtensions
    {
        public static void AddDataRow(this DataTable dt, Dictionary<string, object> data)
        {
            IpJobs.DataLayer.AddDataRow(dt, data);
        }
    }
}

namespace IpJobs
{
    public class DataLayer
    {
        public static Dictionary<string, DataTable> DataTables = new Dictionary<string, DataTable>();
        public static Dictionary<int, DataLayer.InboxPass> InboxPasswords = new Dictionary<int, DataLayer.InboxPass>();

        public class InboxPass
        {
            public int Id;
            public string Networks;
            public string URL;
            public string Entity;
            public string Login;
            public string Password;
            public string AffiliateId;
            public string ApiProvider;
            public string ApiProviderVersion;
            public string ReportingApiKey;
            public string OfferApiKey;
            public string AffiliateApiKey;
            public string ReportingApiUrl;
            public string AffiliateApiUrl;
        }

        public static System.Type DeriveCLSType(Microsoft.SqlServer.Management.Smo.Column col)
        {
            Type typ = typeof(string);
            Microsoft.SqlServer.Management.Smo.SqlDataType ColType = col.DataType.SqlDataType;

            switch (ColType)
            {
                case Microsoft.SqlServer.Management.Smo.SqlDataType.BigInt:
                    typ = typeof(System.Int64);
                    break;
                case Microsoft.SqlServer.Management.Smo.SqlDataType.Bit:
                    typ = typeof(System.Boolean);
                    break;
                case Microsoft.SqlServer.Management.Smo.SqlDataType.Char:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.VarChar:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.VarCharMax:
                    typ = typeof(System.String);
                    break;
                case Microsoft.SqlServer.Management.Smo.SqlDataType.DateTime:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.SmallDateTime:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.DateTime2:
                    typ = typeof(System.DateTime);
                    break;
                case Microsoft.SqlServer.Management.Smo.SqlDataType.Decimal:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.Money:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.SmallMoney:
                    typ = typeof(System.Decimal);
                    break;
                case Microsoft.SqlServer.Management.Smo.SqlDataType.Int:
                    typ = typeof(System.Int32);
                    break;
                case Microsoft.SqlServer.Management.Smo.SqlDataType.NChar:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.NText:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.NVarChar:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.NVarCharMax:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.Text:
                    typ = typeof(System.String);
                    break;
                case Microsoft.SqlServer.Management.Smo.SqlDataType.Real:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.Numeric:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.Float:

                    typ = typeof(System.Double);
                    break;
                case Microsoft.SqlServer.Management.Smo.SqlDataType.Timestamp:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.Binary:
                    typ = typeof(System.Byte);
                    break;
                case Microsoft.SqlServer.Management.Smo.SqlDataType.TinyInt:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.SmallInt:
                    typ = typeof(System.Int16);
                    break;
                case Microsoft.SqlServer.Management.Smo.SqlDataType.UniqueIdentifier:
                    typ = typeof(System.Guid);
                    break;
                case Microsoft.SqlServer.Management.Smo.SqlDataType.UserDefinedDataType:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.UserDefinedType:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.Variant:
                case Microsoft.SqlServer.Management.Smo.SqlDataType.Image:
                    typ = typeof(Object);
                    break;
                case Microsoft.SqlServer.Management.Smo.SqlDataType.VarBinaryMax:
                    typ = typeof(byte[]);
                    break;
                default:
                    typ = typeof(System.String);
                    break;
            }

            //if (col.Nullable && typ != typeof(Object))
            //{
            //    if (typ.IsValueType)
            //        typ = typeof(Nullable<>).MakeGenericType(typ);
            //}

            return typ;
        }
        
        static void PopulateFixedType(string select, Dictionary<string, Guid> col, string connectionString)
        {
            SqlConnection cn = new SqlConnection(connectionString);
            cn.Open();

            SqlDataReader sdr;
            SqlCommand cmd = cn.CreateCommand();
            cmd.CommandText = select;
            cmd.CommandType = CommandType.StoredProcedure;
            sdr = cmd.ExecuteReader();
            while (sdr.Read())
            {
                col.Add((string)sdr["Name"], (Guid)sdr["Id"]);
            }

            cn.Close();
        }        

        static void PopulateInboxPass(string connectionString)
        {
            SqlConnection cn = new SqlConnection(connectionString);

            try
            {
                cn.Open();

                SqlDataReader sdr;
                SqlCommand cmd = cn.CreateCommand();
                cmd.CommandText = "[IpReportDownloadJobs].[InboxPassSelect]";
                cmd.CommandType = CommandType.StoredProcedure;
                sdr = cmd.ExecuteReader();
                while (sdr.Read())
                {
                    InboxPasswords.Add((int)sdr["Id"], new DataLayer.InboxPass()
                    {
                        Id = (int)sdr["Id"],
                        Networks = sdr["Networks"] != DBNull.Value ? (string)(sdr["Networks"]) : "",
                        URL = sdr["URL"] != DBNull.Value ? (string)(sdr["URL"]) : "",
                        Entity = sdr["Entity"] != DBNull.Value ? (string)(sdr["Entity"]) : "",
                        Login = sdr["Login"] != DBNull.Value ? (string)(sdr["Login"]) : "",
                        Password = sdr["Password"] != DBNull.Value ? (string)(sdr["Password"]) : "",
                        AffiliateId = sdr["AffiliateId"] != DBNull.Value ? (string)(sdr["AffiliateId"]) : "",
                        ApiProvider = sdr["ApiProvider"] != DBNull.Value ? (string)(sdr["ApiProvider"]) : "",
                        ApiProviderVersion = sdr["ApiProviderVersion"] != DBNull.Value ? (string)(sdr["ApiProviderVersion"]) : "",
                        ReportingApiKey = sdr["ReportingApiKey"] != DBNull.Value ? (string)(sdr["ReportingApiKey"]) : "",
                        OfferApiKey = sdr["OfferApiKey"] != DBNull.Value ? (string)(sdr["OfferApiKey"]) : "",
                        AffiliateApiKey = sdr["AffiliateApiKey"] != DBNull.Value ? (string)(sdr["AffiliateApiKey"]) : "",
                        ReportingApiUrl = sdr["ReportingApiUrl"] != DBNull.Value ? (string)(sdr["ReportingApiUrl"]) : "",
                        AffiliateApiUrl = sdr["AffiliateApiUrl"] != DBNull.Value ? (string)(sdr["AffiliateApiUrl"]) : ""
                    });
                }
            }
            catch (Exception ex)
            {
                DataLayer.InsertErrorLogSync(connectionString, 100, "IpJobs", "PopulateInboxPass", "Exception", ex.ToString());
            }
            finally
            {
                if (cn != null) cn.Close();
            }
        }

        public static async Task<Tuple<DateTime?, int?>> GetMostRecentMissedDay(string connectionString, int inboxPassId, string reportJobName, DateTime endDate)
        {
            SqlConnection cn = new SqlConnection(connectionString);

            try
            {
                cn.Open();

                SqlDataReader sdr;
                SqlCommand cmd = cn.CreateCommand();
                cmd.CommandText = "[IpReportDownloadJobs].[GetMostRecentMissedDay]";
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add(new SqlParameter("InboxPassId", inboxPassId));
                cmd.Parameters.Add(new SqlParameter("EndDate", endDate));
                cmd.Parameters.Add(new SqlParameter("ReportJobName", reportJobName));
                cmd.CommandTimeout = 120;
                sdr = await cmd.ExecuteReaderAsync();
                if (sdr.Read())
                {
                    DateTime? maxDay = (sdr[0] == DBNull.Value) ? null : (DateTime?)sdr[0];
                    int? maxId = (sdr[1] == DBNull.Value) ? null : (int?)sdr[1];
                    return new Tuple<DateTime?, int?>(maxDay, maxId);
                }
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 100, "IpJobs", "GetMostRecentMissedDay", "Exception", 
                    $"{inboxPassId}::{reportJobName}::{endDate.ToString()}::{ex.ToString()}");
            }
            finally
            {
                if (cn != null) cn.Close();
            }

            return new Tuple<DateTime?, int?>(null, null);
        }

        public static async Task<Tuple<DateTime?, int?>> GetMostRecentMissedHour(string connectionString, int inboxPassId, string reportJobName, DateTime endDate)
        {
            SqlConnection cn = new SqlConnection(connectionString);

            try
            {
                cn.Open();

                SqlDataReader sdr;
                SqlCommand cmd = cn.CreateCommand();
                cmd.CommandText = "[IpReportDownloadJobs].[GetMostRecentMissedHour]";
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add(new SqlParameter("InboxPassId", inboxPassId));
                cmd.Parameters.Add(new SqlParameter("EndDate", endDate));
                cmd.Parameters.Add(new SqlParameter("ReportJobName", reportJobName));
                cmd.CommandTimeout = 120;
                sdr = await cmd.ExecuteReaderAsync();
                while (sdr.Read())
                {
                    DateTime? maxHour = (sdr[0] == DBNull.Value) ? null : (DateTime?)sdr[0];
                    int? maxId = (sdr[1] == DBNull.Value) ? null : (int?)sdr[1];
                    return new Tuple<DateTime?, int?>(maxHour, maxId);
                }
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 100, "IpJobs", "GetMostRecentMissedHour", "Exception",
                    $"{inboxPassId}::{reportJobName}::{endDate.ToString()}::{ex.ToString()}");
            }
            finally
            {
                if (cn != null) cn.Close();
            }

            return new Tuple<DateTime?, int?>(null, null);
        }

        public static async Task MoveJobStatusRecordToRetryTable(string evtConnectionString, int id)
        {
            SqlConnection cn = new SqlConnection(evtConnectionString);
            try
            {
                cn.Open();
                SqlCommand cmd = cn.CreateCommand();
                cmd.CommandText = "[IpReportDownloadJobs].[MoveJobStatusRecordToRetryTable]";
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add(new SqlParameter("Id", id));
                cmd.CommandTimeout = 120;
                await cmd.ExecuteNonQueryAsync();
            }            
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(evtConnectionString, 100, "IpJobs", "MoveJobStatusRecordToRetryTable", "Exception", $"{id}::{ex.ToString()}");
            }
            finally
            {
                if (cn != null) cn.Close();
            }
        }

        public static async Task SetMinimumMissedDay(string connectionString, int inboxPassId, string reportJobName, DateTime endDate)
        {
            SqlConnection cn = new SqlConnection(connectionString);

            try
            {
                cn.Open();

                SqlCommand cmd = cn.CreateCommand();
                cmd.CommandText = "[IpReportDownloadJobs].[SetMinimumMissedDay]";
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add(new SqlParameter("InboxPassId", inboxPassId));
                cmd.Parameters.Add(new SqlParameter("EndDate", endDate));
                cmd.Parameters.Add(new SqlParameter("ReportJobName", reportJobName));
                cmd.CommandTimeout = 120;
                await cmd.ExecuteNonQueryAsync();                
            } 
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 100, "IpJobs", "SetMinimumMissedDay", "Exception",
                    $"{inboxPassId}::{reportJobName}::{endDate.ToString()}::{ex.ToString()}");
            }
            finally
            {
                if (cn != null) cn.Close();
            }
        }

        public static async Task SetMinimumMissedHour(string connectionString, int inboxPassId, string reportJobName, DateTime endDate)
        {
            SqlConnection cn = new SqlConnection(connectionString);
            try
            {
                cn.Open();
                SqlCommand cmd = cn.CreateCommand();
                cmd.CommandText = "[IpReportDownloadJobs].[SetMinimumMissedHour]";
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add(new SqlParameter("InboxPassId", inboxPassId));
                cmd.Parameters.Add(new SqlParameter("EndDate", endDate));
                cmd.Parameters.Add(new SqlParameter("ReportJobName", reportJobName));
                cmd.CommandTimeout = 120;
                await cmd.ExecuteReaderAsync();
            }            
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 100, "IpJobs", "SetMinimumMissedDay", "Exception",
                    $"{inboxPassId}::{reportJobName}::{endDate.ToString()}::{ex.ToString()}");
            }
            finally
            {
                if (cn != null) cn.Close();
            };
        }

        public static void CreateDataTables(string cfgConnectionString, string evtConnectionString)
        {
            Server server = new Server(new ServerConnection(new SqlConnection(evtConnectionString)));
            SqlConnectionStringBuilder connectionStringBuilder = new SqlConnectionStringBuilder(evtConnectionString);

            Database db = new Database(server, connectionStringBuilder.InitialCatalog);
            db.Refresh();
            db.Tables.Refresh(true);
            Table tbReportData = db.Tables["ReportData", "IpReportDownloadJobs"];
            DataTables.Add(tbReportData.Name, new DataTable());

            foreach (Column column in tbReportData.Columns)
            {
                DataTables[tbReportData.Name].Columns.Add(column.Name, DeriveCLSType(column));
            }
            
            PopulateInboxPass(cfgConnectionString);
        }

        public static DataRow CreateDataRow(DataTable dt, Dictionary<string, object> data)
        {
            DataRow dr = dt.NewRow();
            foreach (var kvp in data)
                dr[kvp.Key] = kvp.Value ?? (object)DBNull.Value;
            foreach (var col in dt.Columns.Cast<DataColumn>())
                if (!data.ContainsKey(col.ColumnName)) dr[col.ColumnName] = (object)DBNull.Value;

            return dr;
        }

        public static void AddDataRow(DataTable dt, Dictionary<string, object> data)
        {
            dt.Rows.Add(CreateDataRow(dt, data));
        }

        public static async Task InsertIpJobStatus(string evtConnectionString, string reportJobName, DateTime reportStartTime,
            DateTime reportEndTime, string reportUrl, DateTime jobStartTime, DateTime jobEndTime, int recordCount,
            string outputFileName, int inboxPassId, string errorOutput, bool failed, Guid runId, Guid jobId)
        {
            SqlConnection cn = new SqlConnection(evtConnectionString);
            try
            {
                cn.Open();
                SqlCommand cmd = cn.CreateCommand();
                cmd.CommandText = "[IpReportDownloadJobs].[InsertIpJobStatus]";
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add(new SqlParameter("ReportJobName", reportJobName));
                cmd.Parameters.Add(new SqlParameter("ReportStartTime", reportStartTime));
                cmd.Parameters.Add(new SqlParameter("ReportEndTime", reportEndTime));
                cmd.Parameters.Add(new SqlParameter("ReportUrl", reportUrl));
                cmd.Parameters.Add(new SqlParameter("JobStartTime", jobStartTime));
                cmd.Parameters.Add(new SqlParameter("JobEndTime", jobEndTime));
                cmd.Parameters.Add(new SqlParameter("RecordCount", recordCount));
                cmd.Parameters.Add(new SqlParameter("OutputFileName", outputFileName));
                cmd.Parameters.Add(new SqlParameter("InboxPassId", inboxPassId));
                cmd.Parameters.Add(new SqlParameter("ErrorOutput", errorOutput));
                cmd.Parameters.Add(new SqlParameter("Failed", failed));
                cmd.Parameters.Add(new SqlParameter("JobId", jobId));
                cmd.Parameters.Add(new SqlParameter("RunId", runId));                
                cmd.CommandTimeout = 120;
                await cmd.ExecuteNonQueryAsync();
            }            
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(evtConnectionString, 100, "IpJobs", "InsertIpJobStatus", "Exception", ex.ToString());
            }
            finally
            {
                if (cn != null) cn.Close();
            }
        }

        public static async Task InsertReportData(string evtConnectionString, DataTable dtReportData)
        {
            SqlConnection cn = new SqlConnection(evtConnectionString);
            try
            {
                cn.Open();
                SqlCommand cmd = cn.CreateCommand();
                cmd.CommandText = "[IpReportDownloadJobs].[InsertReportData]";
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add(new SqlParameter("@Report", dtReportData));
                cmd.CommandTimeout = 120;
                await cmd.ExecuteNonQueryAsync();
            }            
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(evtConnectionString, 100, "IpJobs", "InsertReportData", "Exception", ex.ToString());
            }
            finally
            {
                if (cn != null) cn.Close();
            };
        }        

        public static void ParseClickBoothClickXml(DataTable dt, Guid jobId, int inboxPassId, string reportJobName, XmlNodeList clickNodes)
        {
            DataRow dr = null;           

            foreach (XmlNode clickNode in clickNodes)
            {
                dr = dt.NewRow();
                dr["job_id"] = jobId;
                dr["InboxPassId"] = inboxPassId;
                dr["report_type"] = reportJobName;

                XmlNode sClickIdNode = clickNode.SelectSingleNode("click_id");
                if (sClickIdNode != null && sClickIdNode.InnerText != null)
                {
                    dr["sclick_id"] = sClickIdNode.InnerText;
                }

                XmlNode dateNode = clickNode.SelectSingleNode("date");
                DateTime date;
                if (dateNode != null && DateTime.TryParse(dateNode.InnerText, out date))
                {
                    dr["click_date"] = date;
                }

                XmlNode offerIdNode = clickNode.SelectSingleNode("offer_id");
                int offerId;
                if (offerIdNode != null && int.TryParse(offerIdNode.InnerText, out offerId))
                {
                    dr["offer_id"] = offerId;
                }

                XmlNode offerNameNode = clickNode.SelectSingleNode("offer_name");
                if (offerNameNode != null && offerNameNode.InnerText != null)
                {
                    dr["offer_name"] = offerNameNode.InnerText;
                }

                XmlNode linkIdNode = clickNode.SelectSingleNode("link_id");
                int linkId;
                if (linkIdNode != null && int.TryParse(linkIdNode.InnerText, out linkId))
                {
                    dr["link_id"] = linkId;
                }

                XmlNode subId1Node = clickNode.SelectSingleNode("subid_1");
                if (subId1Node != null && subId1Node.InnerText != null)
                {
                    dr["sub_id_1"] = subId1Node.InnerText;
                }

                XmlNode subId2Node = clickNode.SelectSingleNode("subid_2");
                if (subId2Node != null && subId2Node.InnerText != null)
                {
                    dr["sub_id_2"] = subId2Node.InnerText;
                }

                XmlNode subId3Node = clickNode.SelectSingleNode("subid_3");
                if (subId3Node != null && subId3Node.InnerText != null)
                {
                    dr["sub_id_3"] = subId3Node.InnerText;
                }

                XmlNode subId4Node = clickNode.SelectSingleNode("subid_4");
                if (subId4Node != null && subId4Node.InnerText != null)
                {
                    dr["sub_id_4"] = subId4Node.InnerText;
                }

                XmlNode subId5Node = clickNode.SelectSingleNode("subid_5");
                if (subId5Node != null && subId5Node.InnerText != null)
                {
                    dr["sub_id_5"] = subId5Node.InnerText;
                }

                XmlNode ipNode = clickNode.SelectSingleNode("ip_address");
                if (ipNode != null && ipNode.InnerText != null)
                {
                    dr["click_ip_address"] = ipNode.InnerText;
                }

                dt.Rows.Add(dr);
            }
        }

        public static void ParseClickBoothConversionXml(DataTable dt, Guid jobId, int inboxPassId, string reportJobName, XmlNodeList conversionNodes)
        {
            DataRow dr = null;

            foreach (XmlNode clickNode in conversionNodes)
            {
                dr = dt.NewRow();
                dr["job_id"] = jobId;
                dr["InboxPassId"] = inboxPassId;
                dr["report_type"] = reportJobName;

                XmlNode sConversionIdNode = clickNode.SelectSingleNode("conversion_id");
                if (sConversionIdNode != null && sConversionIdNode.InnerText != null)
                {
                    dr["sconversion_id"] = sConversionIdNode.InnerText;
                }

                XmlNode dateNode = clickNode.SelectSingleNode("date");
                DateTime date;
                if (dateNode != null && DateTime.TryParse(dateNode.InnerText, out date))
                {
                    dr["click_date"] = date;
                }

                XmlNode offerIdNode = clickNode.SelectSingleNode("offer_id");
                int offerId;
                if (offerIdNode != null && int.TryParse(offerIdNode.InnerText, out offerId))
                {
                    dr["offer_id"] = offerId;
                }

                XmlNode offerNameNode = clickNode.SelectSingleNode("offer_name");
                if (offerNameNode != null && offerNameNode.InnerText != null)
                {
                    dr["offer_name"] = offerNameNode.InnerText;
                }

                XmlNode campaignIdNode = clickNode.SelectSingleNode("campaign_id");
                int campaignId;
                if (campaignIdNode != null && int.TryParse(campaignIdNode.InnerText, out campaignId))
                {
                    dr["campaign_id"] = campaignId;
                }

                XmlNode subId1Node = clickNode.SelectSingleNode("subid_1");
                if (subId1Node != null && subId1Node.InnerText != null)
                {
                    dr["sub_id_1"] = subId1Node.InnerText;
                }

                XmlNode subId2Node = clickNode.SelectSingleNode("subid_2");
                if (subId2Node != null && subId2Node.InnerText != null)
                {
                    dr["sub_id_2"] = subId2Node.InnerText;
                }

                XmlNode subId3Node = clickNode.SelectSingleNode("subid_3");
                if (subId3Node != null && subId3Node.InnerText != null)
                {
                    dr["sub_id_3"] = subId3Node.InnerText;
                }

                XmlNode subId4Node = clickNode.SelectSingleNode("subid_4");
                if (subId4Node != null && subId4Node.InnerText != null)
                {
                    dr["sub_id_4"] = subId4Node.InnerText;
                }

                XmlNode subId5Node = clickNode.SelectSingleNode("subid_5");
                if (subId5Node != null && subId5Node.InnerText != null)
                {
                    dr["sub_id_5"] = subId5Node.InnerText;
                }

                XmlNode revenueNode = clickNode.SelectSingleNode("revenue");
                decimal revenue;
                if (revenueNode != null && decimal.TryParse(revenueNode.InnerText, out revenue))
                {
                    dr["order_total_amount"] = revenue;
                }
                
                XmlNode dispositionNode = clickNode.SelectSingleNode("disposition");
                if (dispositionNode != null && dispositionNode.InnerText != null)
                {
                    dr["disposition"] = dispositionNode.InnerText;
                }

                XmlNode currencySymbolNode = clickNode.SelectSingleNode("currency_symbol");
                if (currencySymbolNode != null && currencySymbolNode.InnerText != null)
                {
                    dr["currency_symbol"] = currencySymbolNode.InnerText;
                }

                dt.Rows.Add(dr);
            }
        }               

        public static DataRow HitPathCsvReportDataRow(DataTable dt, Guid jobId, int inboxPassId, string apiProviderVersion, string[] data, string reportJobName)
        {
            DataRow dr = null;

            if (apiProviderVersion != "multi" && data.Length == 7)
            {
                dr = dt.NewRow();
                dr["job_id"] = jobId;
                dr["InboxPassId"] = inboxPassId;
                dr["report_type"] = reportJobName;

                int campaignId;
                dr["campaign_id"] = Int32.TryParse(data[0], out campaignId) ? campaignId : -1;
                DateTime clickDate;
                dr["click_date"] = DateTime.TryParse(data[1], out clickDate) ? (object)clickDate : DBNull.Value;
                dr["sub_id_1"] = data[2];
                dr["sub_id_2"] = data[3];
                dr["sub_id_3"] = data[4];
                if (reportJobName == "click")
                    dr["click_ip_address"] = data[5]; 
                else if (reportJobName == "sale")
                    dr["conversion_ip_address"] = data[5];
                Decimal amount;
                dr["paid_amount"] = Decimal.TryParse(data[6], out amount) ? amount : 0.0M;
            } 
            else if (apiProviderVersion == "multi" && data.Length == 9)
            {
                dr = dt.NewRow();
                dr["job_id"] = jobId;
                dr["InboxPassId"] = inboxPassId;
                dr["report_type"] = reportJobName;

                int campaignId;
                dr["campaign_id"] = Int32.TryParse(data[0], out campaignId) ? campaignId : -1;
                DateTime clickDate;
                dr["click_date"] = DateTime.TryParse(data[1], out clickDate) ? (object)clickDate : DBNull.Value;
                dr["sub_id_1"] = data[2];
                dr["sub_id_2"] = data[3];
                dr["sub_id_3"] = data[4];
                if (reportJobName == "click")
                    dr["click_ip_address"] = data[5];
                else if (reportJobName == "sale")
                    dr["conversion_ip_address"] = data[5];
                Decimal amount;
                dr["paid_amount"] = Decimal.TryParse(data[6], out amount) ? amount : 0.0M;
                long clickid;
                dr["click_id"] = Int64.TryParse(data[7], out clickid) ? clickid : 0;
                int affiliateid;
                dr["affiliate_id"] = Int32.TryParse(data[8], out affiliateid) ? affiliateid : 0;
            }

            return dr;
        }

        public static DataRow W4CsvReportDataRow(DataTable dt, Guid jobId, int inboxPassId, string[] data, string reportJobName)
        {
            DataRow dr = null;
            
            dr = dt.NewRow();
            dr["job_id"] = jobId;
            dr["InboxPassId"] = inboxPassId;
            dr["report_type"] = reportJobName;

            int campaignId;
            dr["campaign_id"] = Int32.TryParse(data[0], out campaignId) ? campaignId : -1;
            DateTime clickDate;
            dr["click_date"] = DateTime.TryParse(data[1], out clickDate) ? (object)clickDate : DBNull.Value;
            dr["sub_id_1"] = data[2];
            dr["sub_id_2"] = data[3];
            dr["sub_id_3"] = data[4];
            if (reportJobName == "click")
                dr["click_ip_address"] = data[5];
            else if (reportJobName == "sale")
                dr["conversion_ip_address"] = data[5];
            Decimal amount;
            dr["paid_amount"] = Decimal.TryParse(data[6], out amount) ? amount : 0.0M;             

            return dr;
        }

        public static DataRow CakeClickReportDataRowV9(DataTable dt, Guid jobId, int inboxPassId, string reportJobName, IpJobs.CakeV9.click c)
        {
            DataRow dr = dt.NewRow();
            dr["job_id"] = jobId;
            dr["InboxPassId"] = inboxPassId;
            dr["report_type"] = reportJobName;

            dr["campaign_id"] = c.campaign_id;
            dr["click_date"] = c.click_date;
            dr["duplicate"] = c.duplicate;
            dr["duplicate_clicks"] = c.duplicate_clicks;
            dr["click_ip_address"] = c.ip_address;            

            if (c.offer != null)
            {
                dr["offer_id"] = c.offer.offer_id;
                dr["offer_name"] = c.offer.offer_name;
            }

            if (c.original_click_date != null) dr["original_click_date"] = c.original_click_date;
            else dr["original_click_date"] = DBNull.Value;
           
            dr["paid_action"] = c.paid_action;
            
            if (c.price != null) dr["price"] = c.price;
            else dr["price"] = DBNull.Value;

            if (c.redirect_from_offer != null)
            {
                dr["redirect_from_offer_id"] = c.redirect_from_offer.offer_id;
                dr["redirect_from_offer_name"] = c.redirect_from_offer.offer_name;
            }

            dr["request_session_id"] = c.request_session_id;
            dr["sub_id_1"] = c.subid_1;
            dr["sub_id_2"] = c.subid_2;
            dr["sub_id_3"] = c.subid_3;
            dr["sub_id_4"] = c.subid_4;
            dr["sub_id_5"] = c.subid_5;
            dr["unique_click_id"] = c.unique_click_id;

            return dr;
        }

        public static DataRow CakeConversionReportDataRowV9(DataTable dt, Guid jobId, int inboxPassId, string reportJobName, IpJobs.CakeV9.event_conversion c)
        {
            DataRow dr = dt.NewRow();
            dr["job_id"] = jobId;
            dr["InboxPassId"] = inboxPassId;
            dr["report_type"] = reportJobName;

            dr["campaign_id"] = c.campaign_id;            
            dr["creative_id"] = c.creative_id;
            dr["creative_name"] = c.creative_name;
            dr["currency_symbol"] = c.currency_symbol;
            dr["disposition"] = c.disposition;
            dr["content_disposition_type_name"] = c.disposition_type;
            dr["event_conversion_date"] = c.event_conversion_date;
            dr["macro_event_conversion_id"] = c.macro_event_conversion_id;
            if (c.micro_event_id != null) dr["micro_event_id"] = c.micro_event_id;
            else dr["micro_event_id"] = DBNull.Value;
            dr["micro_event_name"] = c.micro_event_name;
            dr["order_currency_symbol"] = c.order_currency_symbol;
            dr["order_id"] = c.order_id;
            if (c.order_total != null) dr["paid_amount"] = c.order_total;
            else dr["paid_amount"] = DBNull.Value;
            dr["payout_rule_name"] = c.payout_rule_name;
            dr["price"] = c.price;
            dr["site_offer_id"] = c.site_offer_id;
            dr["site_offer_name"] = c.site_offer_name;
            dr["storefront"] = c.storefront;
            dr["sub_id_1"] = c.subid_1;
            dr["sub_id_2"] = c.subid_2;
            dr["sub_id_3"] = c.subid_3;
            dr["sub_id_4"] = c.subid_4;
            dr["sub_id_5"] = c.subid_5;
            dr["test"] = c.test;
            
            return dr;
        }

        public static DataRow CakeClickReportDataRowV10(DataTable dt, Guid jobId, int inboxPassId, string reportJobName, IpJobs.CakeV10.click c)
        {
            DataRow dr = dt.NewRow();
            dr["job_id"] = jobId;
            dr["InboxPassId"] = inboxPassId;
            dr["report_type"] = reportJobName;

            if (c.advertiser != null)
            {
                dr["advertiser_id"] = c.advertiser.advertiser_id;
                dr["advertiser_name"] = c.advertiser.advertiser_name;
            }

            if (c.affiliate != null)
            {
                dr["affiliate_id"] = c.affiliate.affiliate_id;
                dr["affiliate_name"] = c.affiliate.affiliate_name;
            }

            if (c.brand_advertiser != null)
            {
                dr["brand_advertiser_id"] = c.brand_advertiser.brand_advertiser_id;
                dr["brand_advertiser_name"] = c.brand_advertiser.brand_advertiser_name;
            }

            if (c.browser != null)
            {
                dr["browser_id"] = c.browser.browser_id;
                dr["browser_name"] = c.browser.browser_name;

                if (c.browser.browser_version != null)
                {
                    dr["browser_version_version_id"] = c.browser.browser_version.version_id;
                    dr["browser_version_version_name"] = c.browser.browser_version.version_name;
                }

                if (c.browser.browser_version_minor != null)
                {
                    dr["browser_version_minor_version_id"] = c.browser.browser_version_minor.version_id;
                    dr["browser_version_minor_version_name"] = c.browser.browser_version_minor.version_name;
                }
            }

            if (c.campaign != null)
            {
                dr["campaign_id"] = c.campaign.campaign_id;
                dr["campaign_third_party_name"] = c.campaign.campaign_third_party_name;

                if (c.campaign.campaign_type != null)
                {
                    dr["campaign_type_id"] = c.campaign.campaign_type.campaign_type_id;
                    dr["campaign_type_name"] = c.campaign.campaign_type.campaign_type_name;
                }
            }

            if (c.channel != null)
            {
                dr["channel_id"] = c.channel.channel_id;
                dr["channel_name"] = c.channel.channel_name;
            }

            dr["click_date"] = c.click_date;
            dr["click_id"] = c.click_id;

            if (c.country != null)
            {
                dr["country_code"] = c.country.country_code;
                dr["country_name"] = c.country.country_name;
            }

            if (c.creative != null)
            {
                dr["creative_id"] = c.creative.creative_id;
                dr["creative_name"] = c.creative.creative_name;
            }

            if (c.device != null)
            {
                dr["device_id"] = c.device.device_id;
                dr["device_name"] = c.device.device_name;
            }

            dr["disposition"] = c.disposition;
            dr["duplicate"] = c.duplicate;
            dr["duplicate_clicks"] = c.duplicate_clicks;
            dr["click_ip_address"] = c.ip_address;

            if (c.isp != null)
            {
                dr["isp_id"] = c.isp.isp_id;
                dr["isp_name"] = c.isp.isp_name;
            }

            if (c.language != null)
            {
                dr["language_id"] = c.language.language_id;
                dr["language_abbr"] = c.language.language_abbr;
                dr["language_name"] = c.language.language_name;
            }

            if (c.offer != null)
            {
                dr["offer_id"] = c.offer.offer_id;
                dr["offer_name"] = c.offer.offer_name;
            }

            if (c.offer_contract != null)
            {
                dr["offer_contract_id"] = c.offer_contract.offer_contract_id;
                dr["offer_contract_name"] = c.offer_contract.offer_contract_name;
            }

            if (c.operating_system != null)
            {
                dr["operating_system_id"] = c.operating_system.operating_system_id;
                dr["operating_system_name"] = c.operating_system.operating_system_name;

                if (c.operating_system.operating_system_version != null)
                {
                    dr["operating_system_version_id"] = c.operating_system.operating_system_version.version_id;
                    dr["operating_system_version_name"] = c.operating_system.operating_system_version.version_name;
                }

                if (c.operating_system.operating_system_version_minor != null)
                {
                    dr["operating_system_version_minor_version_id"] = c.operating_system.operating_system_version_minor.version_id;
                    dr["operating_system_version_minor_version_name"] = c.operating_system.operating_system_version_minor.version_name;
                }
            }

            if (c.paid != null)
            {
                dr["paid_amount"] = c.paid.amount;
                dr["paid_currency_id"] = c.paid.currency_id;
                dr["paid_formatted_amount"] = c.paid.formatted_amount;
            }

            dr["paid_action"] = c.paid_action;

            if (c.received != null)
            {
                dr["received_amount"] = c.received.amount;
                dr["received_currency_id"] = c.received.currency_id;
                dr["received_formatted_amount"] = c.received.formatted_amount;
            }

            dr["redirect_url"] = c.redirect_url;
            dr["click_referrer_url"] = c.referrer_url;

            if (c.region != null)
            {
                dr["region_code"] = c.region.region_code;
                dr["region_name"] = c.region.region_name;
            }

            dr["request_session_id"] = c.request_session_id;
            dr["request_url"] = c.request_url;
            dr["search_term"] = c.search_term;

            if (c.site_offer != null)
            {
                dr["site_offer_id"] = c.site_offer.site_offer_id;
                dr["site_offer_name"] = c.site_offer.site_offer_name;
            }

            if (c.site_offer_contract != null)
            {
                dr["site_offer_contract_id"] = c.site_offer_contract.site_offer_contract_id;
                dr["site_offer_contract_name"] = c.site_offer_contract.site_offer_contract_name;
            }

            if (c.source_affiliate != null)
            {
                dr["source_affiliate_id"] = c.source_affiliate.source_affiliate_id;
                dr["source_affiliate_name"] = c.source_affiliate.source_affiliate_name;
            }

            dr["sub_id_1"] = c.sub_id_1;
            dr["sub_id_2"] = c.sub_id_2;
            dr["sub_id_3"] = c.sub_id_3;
            dr["sub_id_4"] = c.sub_id_4;
            dr["sub_id_5"] = c.sub_id_5;
            dr["total_clicks"] = c.total_clicks;
            dr["udid"] = c.udid;
            dr["click_user_agent"] = c.user_agent;
            dr["visitor_id"] = c.visitor_id;

            return dr;
        }

        public static DataRow CakeConversionReportDataRowV10(DataTable dt, Guid jobId, int inboxPassId, string reportJobName, IpJobs.CakeV10.conversion c)
        {
            DataRow dr = dt.NewRow();
            dr["job_id"] = jobId;
            dr["InboxPassId"] = inboxPassId;
            dr["report_type"] = reportJobName;

            if (c.advertiser != null)
            {
                dr["advertiser_id"] = c.advertiser.advertiser_id;
                dr["advertiser_name"] = c.advertiser.advertiser_name;
            }
            
            if (c.affiliate != null)
            {
                dr["affiliate_id"] = c.affiliate.affiliate_id;
                dr["affiliate_name"] = c.affiliate.affiliate_name;
            }
            
            if (c.browser != null)
            {
                dr["browser_id"] = c.browser.browser_id;
                dr["browser_name"] = c.browser.browser_name;

                if (c.browser.browser_version != null)
                {
                    dr["browser_version_version_id"] = c.browser.browser_version.version_id;
                    dr["browser_version_version_name"] = c.browser.browser_version.version_name;
                }

                if (c.browser.browser_version_minor != null)
                {
                    dr["browser_version_minor_version_id"] = c.browser.browser_version_minor.version_id;
                    dr["browser_version_minor_version_name"] = c.browser.browser_version_minor.version_name;
                }
            }

            dr["campaign_id"] = c.campaign_id;

            if (c.campaign_type != null)
            {
                dr["campaign_type_id"] = c.campaign_type.campaign_type_id;
                dr["campaign_type_name"] = c.campaign_type.campaign_type_name;
            }

            if (c.click_date != null) dr["click_date"] = c.click_date;
            else dr["click_date"] = DBNull.Value;
            if (c.click_id != null) dr["click_id"] = c.click_id;
            else dr["click_id"] = DBNull.Value;
            
            dr["click_ip_address"] = c.click_ip_address;
            dr["click_referrer_url"] = c.click_referrer_url;
            if (c.click_request_session_id != null) dr["click_request_session_id"] = c.click_request_session_id;
            else dr["click_request_session_id"] = DBNull.Value;
            dr["click_user_agent"] = c.click_user_agent;
            dr["event_conversion_date"] = c.conversion_date;
            dr["sconversion_id"] = c.conversion_id;
            dr["conversion_ip_address"] = c.conversion_ip_address;
            dr["conversion_referrer_url"] = c.conversion_referrer_url;
            dr["conversion_type"] = c.conversion_type;
            dr["conversion_user_agent"] = c.conversion_user_agent;
            
            if (c.country != null)
            {
                dr["country_code"] = c.country.country_code;
                dr["country_name"] = c.country.country_name;
            }

            if (c.creative != null)
            {
                dr["creative_id"] = c.creative.creative_id;
                dr["creative_name"] = c.creative.creative_name;
            }

            if (c.current_disposition != null)
            {
                dr["current_disposition_contact"] = c.current_disposition.contact;
                dr["current_disposition_date"] = c.current_disposition.disposition_date;
                dr["current_disposition_id"] = c.current_disposition.disposition_id;
                dr["current_disposition_name"] = c.current_disposition.disposition_name;
                if (c.current_disposition.disposition_type != null)
                {
                    dr["current_disposition_type_id"] = c.current_disposition.disposition_type.disposition_type_id;
                    dr["current_disposition_type_name"] = c.current_disposition.disposition_type.disposition_type_name;
                }
                
            }
            
            if (c.device != null)
            {
                dr["device_id"] = c.device.device_id;
                dr["device_name"] = c.device.device_name;
            }            
            
            if (c.isp != null)
            {
                dr["isp_id"] = c.isp.isp_id;
                dr["isp_name"] = c.isp.isp_name;
            }

            if (c.language != null)
            {
                dr["language_id"] = c.language.language_id;
                dr["language_abbr"] = c.language.language_abbr;
                dr["language_name"] = c.language.language_name;
            }

            if (c.last_updated != null) dr["last_updated"] = c.last_updated;
            else dr["last_updated"] = DBNull.Value;

            dr["note"] = c.note;
            
            if (c.offer != null)
            {
                dr["offer_id"] = c.offer.offer_id;
                dr["offer_name"] = c.offer.offer_name;
            }

            if (c.offer_contract != null)
            {
                dr["offer_contract_id"] = c.offer_contract.offer_contract_id;
                dr["offer_contract_name"] = c.offer_contract.offer_contract_name;
            }
            
            if (c.operating_system != null)
            {
                dr["operating_system_id"] = c.operating_system.operating_system_id;
                dr["operating_system_name"] = c.operating_system.operating_system_name;

                if (c.operating_system.operating_system_version != null)
                {
                    dr["operating_system_version_id"] = c.operating_system.operating_system_version.version_id;
                    dr["operating_system_version_name"] = c.operating_system.operating_system_version.version_name;
                }

                if (c.operating_system.operating_system_version_minor != null)
                {
                    dr["operating_system_version_minor_version_id"] = c.operating_system.operating_system_version_minor.version_id;
                    dr["operating_system_version_minor_version_name"] = c.operating_system.operating_system_version_minor.version_name;
                }
            }
            
            if (c.order_total != null)
            {
                dr["order_total_amount"] = c.order_total.amount;
                dr["order_total_currency_id"] = c.order_total.currency_id;
                dr["order_total_formatted_amount"] = c.order_total.formatted_amount;
            }
            
            if (c.paid != null)
            {
                dr["paid_amount"] = c.paid.amount;
                dr["paid_currency_id"] = c.paid.currency_id;
                dr["paid_formatted_amount"] = c.paid.formatted_amount;
            }

            dr["payout_rule_name"] = c.payout_rule_name;
            dr["pixel_dropped"] = c.pixel_dropped;
            
            if (c.received != null)
            {
                dr["received_amount"] = c.received.amount;
                dr["received_currency_id"] = c.received.currency_id;
                dr["received_formatted_amount"] = c.received.formatted_amount;
            }

            if (c.region != null)
            {
                dr["region_code"] = c.region.region_code;
                dr["region_name"] = c.region.region_name;
            }
            
            dr["request_session_id"] = c.request_session_id;
            dr["returned"] = c.returned;            
            dr["search_term"] = c.search_term;
            dr["step_reached"] = c.step_reached;
            dr["storefront"] = c.storefront;           

            dr["sub_id_1"] = c.sub_id_1;
            dr["sub_id_2"] = c.sub_id_2;
            dr["sub_id_3"] = c.sub_id_3;
            dr["sub_id_4"] = c.sub_id_4;
            dr["sub_id_5"] = c.sub_id_5;

            dr["suppressed"] = c.suppressed;
            dr["test"] = c.test;
            dr["transaction_id"] = c.transaction_id;            
            dr["visitor_id"] = c.visitor_id;

            return dr;
        }

        public static async Task InsertErrorLog(string evtConnectionString, int severity, string process, string method, string descriptor, string message)
        {
            SqlConnection cn = new SqlConnection(evtConnectionString);
            cn.Open();
            SqlCommand cmd = cn.CreateCommand();
            cmd.CommandText = "[ErrorLog].[InsertErrorLog]";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(new SqlParameter("Severity", severity));
            cmd.Parameters.Add(new SqlParameter("Process", process));
            cmd.Parameters.Add(new SqlParameter("Method", method));
            cmd.Parameters.Add(new SqlParameter("Descriptor", descriptor));
            cmd.Parameters.Add(new SqlParameter("Message", message));

            cmd.CommandTimeout = 120;
            await cmd.ExecuteNonQueryAsync();
            cn.Close();
        }

        public static void InsertErrorLogSync(string evtConnectionString, int severity, string process, string method, string descriptor, string message)
        {
            SqlConnection cn = new SqlConnection(evtConnectionString);
            cn.Open();
            SqlCommand cmd = cn.CreateCommand();
            cmd.CommandText = "[ErrorLog].[InsertErrorLog]";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(new SqlParameter("Severity", severity));
            cmd.Parameters.Add(new SqlParameter("Process", process));
            cmd.Parameters.Add(new SqlParameter("Method", method));
            cmd.Parameters.Add(new SqlParameter("Descriptor", descriptor));
            cmd.Parameters.Add(new SqlParameter("Message", message));

            cmd.CommandTimeout = 120;
            cmd.ExecuteNonQuery();
            cn.Close();
        }
    }
}
