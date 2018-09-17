using Microsoft.SqlServer.Management.Common;
using Microsoft.SqlServer.Management.Smo;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;
using Newtonsoft.Json.Serialization;
using System.Text;
using System.IO;
using Newtonsoft.Json;

namespace DataLayerExtensions
{
    public static class DataTableExtensions
    {
        public static void AddDataRow(this DataTable dt, Dictionary<string, object> data)
        {
            IndiaLiveFeedFtpLib.DataLayer.AddDataRow(dt, data);
        }
    }
}

namespace IndiaLiveFeedFtpLib
{
    public class DataLayer
    { 
        public class SuppressionFileType
        {
            public byte Id;
            public string Name;
            public string Pattern;            
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
                    typ = typeof(System.Byte[]);
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
      
        public static Dictionary<string, DataTable> CreateDataTables(string cfgConnectionString, string evtConnectionString)
        {
            Dictionary<string, DataTable> DataTables = new Dictionary<string, DataTable>();

            Server server = new Server(new ServerConnection(new SqlConnection(evtConnectionString)));
            SqlConnectionStringBuilder connectionStringBuilder = new SqlConnectionStringBuilder(evtConnectionString);

            Database db = new Database(server, connectionStringBuilder.InitialCatalog);
            db.Refresh();
            db.Tables.Refresh(true);

            List<Table> tables = new List<Table>(); 
                       
            //Table tbNetwork = db.Tables["OpenSignal", "TowerData"];            
            //DataTables.Add(tbNetwork.Name, new DataTable());
            //tables.Add(tbNetwork);            

            foreach (Table table in tables)
            {
                foreach (Column column in table.Columns)
                {
                    DataTables[table.Name].Columns.Add(column.Name, DeriveCLSType(column));
                }
            } 

            return DataTables;
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

        public static async Task ExecuteNonQueryAsyncSqlString(string connectionString, string sqlString)
        {
            SqlConnection cn = new SqlConnection(connectionString);
            cn.Open();
            SqlCommand cmd = new SqlCommand(sqlString, cn);
            cmd.CommandTimeout = 120;

            try
            {
                await cmd.ExecuteNonQueryAsync().ConfigureAwait(continueOnCapturedContext: false); 
            }
            finally
            {
                cn.Close();
            }
        }

        public static async Task<DateTime> GetMaxEndDayProvidedToThirdParty(string connectionString, string host, int port, string username)
        {
            DateTime ret = new DateTime(1900, 1, 1);
            SqlConnection cn = new SqlConnection(connectionString);
            cn.Open();

            SqlDataReader sdr;
            SqlCommand cmd = cn.CreateCommand();
            cmd.CommandText = "DailyGlobalSuppressionFtp.GetMaxEndDayProvidedToThirdParty";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("Host", host));
            cmd.Parameters.Add(new SqlParameter("Port", port));
            cmd.Parameters.Add(new SqlParameter("Username", username));

            cmd.CommandTimeout = 120;
            try
            {
                sdr = await cmd.ExecuteReaderAsync().ConfigureAwait(continueOnCapturedContext: false);
                if (sdr.Read()) ret = (DateTime)sdr[0];
            }
            finally
            {
                cn.Close();
            }

            return ret;
        }

        public static async Task<DateTime> GetMaxDateFtpFileProcessed(string connectionString)
        {
            DateTime ret = new DateTime(1900, 1, 1);
            SqlConnection cn = new SqlConnection(connectionString);
            cn.Open();

            SqlDataReader sdr;
            SqlCommand cmd = cn.CreateCommand();
            cmd.CommandText = "DailyGlobalSuppressionFtp.GetMaxDateFtpFileProcessed";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.CommandTimeout = 120;
            try
            {
                sdr = await cmd.ExecuteReaderAsync().ConfigureAwait(continueOnCapturedContext: false);
                if (sdr.Read()) ret = (DateTime)sdr[0];
            }
            finally
            {
                cn.Close();
            }

            return ret;
        }

        public static async Task InsertThirdPartyExportLog(string connectionString, DateTime dateDataWasProvidedToThirdParty,
            DateTime startDayProvidedToThirdParty, DateTime endDayProvidedToThirdParty, string host, int port, string username, int delayInDays)
        {
            SqlConnection cn = new SqlConnection(connectionString);
            cn.Open();
            SqlCommand cmd = cn.CreateCommand();
            cmd.CommandText = "[DailyGlobalSuppressionFtp].[InsertThirdPartyExportLog]";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(new SqlParameter("DateDataWasProvidedToThirdParty", dateDataWasProvidedToThirdParty));
            cmd.Parameters.Add(new SqlParameter("StartDayProvidedToThirdParty", startDayProvidedToThirdParty));
            cmd.Parameters.Add(new SqlParameter("EndDayProvidedToThirdParty", endDayProvidedToThirdParty));
            cmd.Parameters.Add(new SqlParameter("Host", host));
            cmd.Parameters.Add(new SqlParameter("Port", port));
            cmd.Parameters.Add(new SqlParameter("Username", username));
            cmd.Parameters.Add(new SqlParameter("DelayInDays", delayInDays));

            cmd.CommandTimeout = 120;
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(continueOnCapturedContext: false);
            cn.Close();
        }

        public static async Task<Dictionary<byte, DataLayer.SuppressionFileType>> PopulateSuppressionFileType(string connectionString)
        {
            Dictionary<byte, DataLayer.SuppressionFileType> suppressionFileTypes = new Dictionary<byte, DataLayer.SuppressionFileType>();
            SqlConnection cn = new SqlConnection(connectionString);

            try
            {
                cn.Open();

                SqlDataReader sdr;
                SqlCommand cmd = cn.CreateCommand();
                cmd.CommandText = "[DailyGlobalSuppressionFtp].[SuppressionFileTypeSelect]";
                cmd.CommandType = CommandType.StoredProcedure;
                sdr = await cmd.ExecuteReaderAsync().ConfigureAwait(continueOnCapturedContext: false);
                while (sdr.Read())
                {
                    suppressionFileTypes.Add((byte)sdr["Id"], new DataLayer.SuppressionFileType()
                    {
                        Id = (byte)sdr["Id"],
                        Name = sdr["Name"] != DBNull.Value ? (string)(sdr["Name"]) : "",
                        Pattern = sdr["Pattern"] != DBNull.Value ? (string)(sdr["Pattern"]) : ""
                    });
                }
            }
            catch (Exception ex)
            {
                DataLayer.InsertErrorLogSync(connectionString, 100, "DailyGlobalSuppressionFtpService", "PopulateSuppressionFileType", "Exception", ex.ToString());
            }
            finally
            {
                if (cn != null) cn.Close();
            }

            return suppressionFileTypes;
        }

        public static async Task<bool> AlreadyDownloaded(string connectionString, string fileName, string fileList, DateTime fileDate, bool isErrorFile)
        {
            bool alreadyExists = false;
            SqlConnection cn = new SqlConnection(connectionString);
            cn.Open();

            SqlDataReader sdr;
            SqlCommand cmd = cn.CreateCommand();
            cmd.CommandText = "IndiaLiveFeed.AlreadyDownloaded";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("FileName", fileName));
            cmd.Parameters.Add(new SqlParameter("FileList", fileList));
            cmd.Parameters.Add(new SqlParameter("FileDate", fileDate));
            cmd.Parameters.Add(new SqlParameter("IsErrorFile", isErrorFile));

            cmd.CommandTimeout = 120;
            try
            {
                sdr = await cmd.ExecuteReaderAsync().ConfigureAwait(continueOnCapturedContext: false); 
                if (sdr.Read()) alreadyExists = (int)sdr[0] == 1 ? true : false;                
            }
            finally
            {
                cn.Close();
            }

            return alreadyExists;
        }

        public static async Task InsertProcessedFtpFile(string connectionString, string listName, string fileName, DateTime fileDate, bool isErrorFile,
            DateTime startDate, DateTime endDate, long recordsInFile)
        {
            SqlConnection cn = new SqlConnection(connectionString);
            cn.Open();
            SqlCommand cmd = cn.CreateCommand();
            cmd.CommandText = "[IndiaLiveFeed].[InsertProcessedFtpFile]";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(new SqlParameter("FileList", listName));
            cmd.Parameters.Add(new SqlParameter("FileName", fileName));
            cmd.Parameters.Add(new SqlParameter("FileDate", fileDate));
            cmd.Parameters.Add(new SqlParameter("IsErrorFile", isErrorFile));
            cmd.Parameters.Add(new SqlParameter("JobStartDate", startDate));
            cmd.Parameters.Add(new SqlParameter("JobEndDate", endDate));
            cmd.Parameters.Add(new SqlParameter("RecordsInFile", recordsInFile));

            cmd.CommandTimeout = 120;
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(continueOnCapturedContext: false);
            cn.Close();
        }        

        public static async Task<Dictionary<string, string>> GetBasicConfig(string connectionString, string applicationName)
        {
            Dictionary<string, string> basicConfig = new Dictionary<string, string>();

            SqlConnection cn = new SqlConnection(connectionString);
            cn.Open();

            SqlDataReader sdr;
            SqlCommand cmd = cn.CreateCommand();
            cmd.CommandText = "BasicConfig.BasicConfigSelect";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("ApplicationName", applicationName));

            cmd.CommandTimeout = 120;
            try
            {
                sdr = await cmd.ExecuteReaderAsync().ConfigureAwait(continueOnCapturedContext: false);
                while (sdr.Read())
                {
                    basicConfig.Add((string)sdr["VariableName"], sdr["VariableValue"] != DBNull.Value ? (string)(sdr["VariableValue"]) : "");
                }
            }
            finally
            {
                cn.Close();
            }

            return basicConfig;
        }

        public static async Task InsertErrorLog(string connectionString, int severity, string process, string method, string descriptor, string message)
        {
            try
            {
                SqlConnection cn = new SqlConnection(connectionString);
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
                await cmd.ExecuteNonQueryAsync().ConfigureAwait(continueOnCapturedContext:false);
                cn.Close();
            }
            catch (Exception ex)
            {
                int i = 1;
            }
            
        }

        public static void InsertErrorLogSync(string connectionString, int severity, string process, string method, string descriptor, string message)
        {
            SqlConnection cn = new SqlConnection(connectionString);
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
