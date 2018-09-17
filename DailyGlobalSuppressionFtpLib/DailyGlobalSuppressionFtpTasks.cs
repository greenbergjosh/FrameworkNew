using Microsoft.SqlServer.Management.Smo;
using DtsRuntime = Microsoft.SqlServer.Dts.Runtime;
using Microsoft.SqlServer.Dts.Pipeline.Wrapper;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Globalization;
using System.Diagnostics;
using System.Net;
using System.Text.RegularExpressions;

namespace DailyGlobalSuppressionFtpLib
{
    public class DailyGlobalSuppressionFtpTasks
    {

        public static async Task DoImport(string connectionString, string localPath, string host, int port, string userName, string password)
        {
            Dictionary<byte, DataLayer.SuppressionFileType> fileTypes = await DataLayer.PopulateSuppressionFileType(connectionString);

            foreach (KeyValuePair<byte, DataLayer.SuppressionFileType> fileType in fileTypes)
            {
                await DoImportPerType(connectionString, localPath, fileType.Value.Id, fileType.Value.Pattern, host, port, userName, password);
            }

            await DataLayer.InsertIntoContactAndDataByEmail(connectionString);
        }

        public static async Task DoImportPerType(string connectionString, string localPath, byte suppressionFileTypeId, string pattern, string host, int port, string userName, string password)
        {
            DateTime jobStartDate = DateTime.Now;
            List<string> files = await DoDownload(connectionString, localPath, pattern, suppressionFileTypeId, host, port, userName, password);
            
            foreach (string fname in files)
            {
                try
                {
                    FileInfo fi = new FileInfo(fname);
                    string dirName = fi.DirectoryName;

                    DateTime baseFileDate = new DateTime(1900, 1, 1);
                    string baseFileName = String.Empty;
                    string[] nameAndExt = fi.Name.Split(new char[] { '.' });
                    if (nameAndExt == null || nameAndExt.Length != 2 || nameAndExt[1] != "txt" )
                    {
                        await DataLayer.InsertErrorLog(connectionString, 100, "DailyGlobalSuppressionFtpImporter", "DoImport", "Invalid File Name",
                            $"DoImport nameAndExt: fname={fname}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}");
                        continue;
                    }
                    else
                    {
                        string[] idAndDate = nameAndExt[0].Split(new char[] { '_' });
                        if (idAndDate == null || idAndDate.Length != 2)
                        {
                            await DataLayer.InsertErrorLog(connectionString, 100, "DailyGlobalSuppressionFtpImporter", "DoImport", "Invalid File Name",
                                $"DoImport idAndDate: fname={fname}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}");
                            continue;
                        }                        
                        baseFileDate = DateTime.ParseExact(idAndDate[1], "yyyyMMdd", CultureInfo.InvariantCulture);
                        baseFileName = fi.Name;
                    } 
                    
                    int fileLineCount = File.ReadLines(dirName + @"\" + fi.Name).Count();
                    bool imported = await ImportData(connectionString, localPath, dirName, fi.Name, baseFileDate, suppressionFileTypeId);
                    if (imported)
                    {
                        await DataLayer.InsertProcessedFtpFile(connectionString, suppressionFileTypeId, baseFileName, baseFileDate, jobStartDate, DateTime.Now, fileLineCount, -1);
                    }
                    else
                    {
                        await DataLayer.InsertErrorLog(connectionString, 100, "DailyGlobalSuppressionFtpImporter", "DoImport", "Failed to import",
                                $"DoImport Failed to import: fname={fname}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}");
                    }
                       
                    try
                    {
                        File.Delete(dirName + @"\" + fi.Name);
                        //await DeleteFileFromFtpServer(fi.Name, host, port, userName, password);  // Considered complete even if delete fails
                    }
                    catch (Exception ex)
                    {
                        await DataLayer.InsertErrorLog(connectionString, 100, "DailyGlobalSuppressionFtpImporter", "DoImport", "Exception",
                                $"DoImport Failed to delete from ftp server: fname={fname}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}::ex={ex.ToString()}");
                    }                    
                }
                catch (Exception ex)
                {
                    await DataLayer.InsertErrorLog(connectionString, 100, "DailyGlobalSuppressionFtpImporter", "DoImport", "Exception",
                            $"DoImport Exception processing file: fname={fname}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}::ex={ex.ToString()}");
                }
            }
        }

        public static async Task DoExport(string connectionString, string baseDir, string host, int port, string userName, string password, int delayInDays)
        {
            DateTime jobStartDate = DateTime.Now;

            DateTime startDate = new DateTime(1900, 1, 1);
            DateTime endDate = new DateTime(1900, 1, 1);

            try
            {
                DateTime tmpDate = DateTime.Now;
                DateTime today = new DateTime(tmpDate.Year, tmpDate.Month, tmpDate.Day);
                DateTime lastFtpProcessed = await DataLayer.GetMaxDateFtpFileProcessed(connectionString).ConfigureAwait(continueOnCapturedContext: false);
                DateTime lastEndDayProvided = await DataLayer.GetMaxEndDayProvidedToThirdParty(connectionString, host, port, userName)
                    .ConfigureAwait(continueOnCapturedContext: false);  // day not yet processed

                // This runs every hour. We can get the day in which we are currently running - today.
                // We don't want to give out data earlier than (today - delayInDays)

                // We want our start day to be the lastEndDay
                startDate = lastEndDayProvided;

                // We want our end day to be 
                endDate = today.AddDays(-delayInDays + 1);

                // The ftps must all be completed prior to this end day
                if ((endDate <= lastFtpProcessed) && (startDate < endDate))
                {
                    // New data to be provided
                    string destinationFile = $@"DailyGlobalSuppression_{today.ToString("yyyyMMdd")}.txt";
                    string sourceFile = $@"{baseDir}\{destinationFile}";
                    await ExportData(connectionString, baseDir, sourceFile, startDate, endDate).ConfigureAwait(continueOnCapturedContext: false);
                    await UploadFile(sourceFile, destinationFile, host, userName, password).ConfigureAwait(continueOnCapturedContext: false);
                    await DataLayer.InsertThirdPartyExportLog(connectionString, DateTime.Now, startDate, endDate, host, port, userName, delayInDays)
                        .ConfigureAwait(continueOnCapturedContext: false);
                    File.Delete(sourceFile);

                    await DataLayer.InsertErrorLog(connectionString, 1, "DailyGlobalSuppressionFtpService", "DoExport", "Data Exported",
                        $@"DoExport: host={host}::port={port.ToString()}::userName={userName}::delay={delayInDays.ToString()}
                           ::today={today.ToString()}::lastFtpProcessed={lastFtpProcessed.ToString()}::lastEndDayProvided={lastEndDayProvided.ToString()}
                           ::startDate={startDate.ToString()}::endDate={endDate.ToString()}").ConfigureAwait(continueOnCapturedContext: false);
                }
                else
                {
                    // No new data to be provided
                    await DataLayer.InsertErrorLog(connectionString, 1, "DailyGlobalSuppressionFtpService", "DoExport", "No new data",
                        $@"DoExport: host={host}::port={port.ToString()}::userName={userName}::delay={delayInDays.ToString()}
                           ::today={today.ToString()}::lastFtpProcessed={lastFtpProcessed.ToString()}::lastEndDayProvided={lastEndDayProvided.ToString()}")
                           .ConfigureAwait(continueOnCapturedContext: false);
                }
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 100, "DailyGlobalSuppressionFtpService", "DoExport", "Exception",
                        $"DoExport Exception: host={host}::port={port.ToString()}::userName={userName}::ex={ex.ToString()}")
                        .ConfigureAwait(continueOnCapturedContext: false);
            }
        }

        //public static async Task UploadFile(string sourceFile, string destinationFile, string host, string userName, string password)
        //{
        //    FileStream f = null;
        //    try
        //    {
        //        f = File.OpenRead(sourceFile);
        //        FtpWebRequest request = (FtpWebRequest)FtpWebRequest.Create(new Uri(@"ftp://" + host + @"/" + destinationFile));
        //        request.Method = WebRequestMethods.Ftp.UploadFile;
        //        request.Credentials = new System.Net.NetworkCredential(userName, password);
        //        request.UseBinary = false;
        //        Stream rs = await request.GetRequestStreamAsync().ConfigureAwait(continueOnCapturedContext: false);
        //        await f.CopyToAsync(rs).ConfigureAwait(continueOnCapturedContext: false);
        //    }
        //    finally
        //    {
        //        if (f != null) f.Close();
        //    }
        //}

        private static async Task UploadFile(string sourceFile, string targetFile, string host, string userName, string password)
        {
            FtpWebRequest ftpReq = null;
            try
            {
                string filename = "ftp://" + host + "//" + targetFile;
                ftpReq = (FtpWebRequest)WebRequest.Create(filename);
                ftpReq.UseBinary = true;
                ftpReq.Method = WebRequestMethods.Ftp.UploadFile;
                ftpReq.Credentials = new NetworkCredential(userName, password);

                byte[] b = File.ReadAllBytes(sourceFile);

                ftpReq.ContentLength = b.Length;
                using (Stream s = ftpReq.GetRequestStream())
                {
                    await s.WriteAsync(b, 0, b.Length);
                }

                FtpWebResponse ftpResp = (FtpWebResponse)(await ftpReq.GetResponseAsync());

                if (ftpResp != null)
                {
                    string s = ftpResp.StatusDescription;
                }
            }
            catch (Exception ex)
            {
                string s = ex.ToString();
            }
        }

        public static async Task ExportData(string connectionString, string baseDir, string destinationFile, DateTime startDate, DateTime endDate)
        {
            DateTime jobStartTime = DateTime.Now;

            try
            {
                await DataLayer.InsertErrorLog(connectionString, 1, "DailyGlobalSuppressionFtpService", "ExportData", "Informational",
                        $"ExportData: destinationFile={destinationFile}::startDate={startDate}::endDate={endDate}")
                        .ConfigureAwait(continueOnCapturedContext: false);

                string pkg = $@"{baseDir}\DailyGlobalSuppressionFtpExport.dtsx";
                DtsRuntime.Application app = new DtsRuntime.Application();
                DtsRuntime.Package p = app.LoadPackage(pkg, null);
                p.Variables["User::StartDate"].Value = startDate;
                p.Variables["User::EndDate"].Value = endDate;
                p.Variables["User::FileName"].Value = destinationFile;

                p.Execute();
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 100, "DailyGlobalSuppressionFtpService", "ExportData", "Exception",
                             $"ExportData: destinationFile={destinationFile}::startDate={startDate}::endDate={endDate}::{ex.ToString()}")
                             .ConfigureAwait(continueOnCapturedContext: false);
            }
        }

        public static async Task DeleteFileFromFtpServer(string remoteFile, string host, int port, string userName, string password)
        {
            FtpWebResponse response = null;

            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(new Uri(@"ftp://" + host + @"//" + remoteFile));
                request.Method = WebRequestMethods.Ftp.DeleteFile;
                request.Credentials = new NetworkCredential(userName, password);
                response = (FtpWebResponse)(await request.GetResponseAsync());
                response.Close();
            }
            finally
            {
                if (response != null) response.Close();
            }            
        }

        public static async Task<List<string>> DoDownload(string connectionString, string localPath, string pattern, byte suppressionFileTypeId, string host, int port, string userName, string password)
        {
            FtpWebResponse response = null;
            StreamReader reader = null;
            List<string> fileNames = new List<string>();

            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(new Uri(@"ftp://" + host + @"/"));
                request.Method = WebRequestMethods.Ftp.ListDirectoryDetails;  // WebRequestMethods.Ftp.ListDirectory would be more efficient here
                request.Credentials = new NetworkCredential(userName, password);
                response = (FtpWebResponse)(await request.GetResponseAsync());

                Stream responseStream = response.GetResponseStream();
                reader = new StreamReader(responseStream);
                //string listing = reader.ReadToEnd();

                List<string> files = new List<string>();

                string line = await reader.ReadLineAsync();
                while (!string.IsNullOrEmpty(line))
                {
                    string regex =
                        @"^" +                          //# Start of line
                        @"(?<dir>[\-ld])" +             //# File size          
                        @"(?<permission>[\-rwx]{9})" +  //# Whitespace          \n
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<filecode>\d+)" +
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<owner>\w+)" +
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<group>\w+)" +
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<size>\d+)" +
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<month>\w{3})" +            //# Month (3 letters)   \n
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<day>\d{1,2})" +            //# Day (1 or 2 digits) \n
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<timeyear>[\d:]{4,5})" +    //# Time or year        \n
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<filename>(.*))" +          //# Filename            \n
                        @"$";                           //# End of line

                    var split = new Regex(regex).Match(line);
                    string dir = split.Groups["dir"].ToString();
                    string filename = split.Groups["filename"].ToString();
                    bool isDirectory = !string.IsNullOrWhiteSpace(dir) && dir.Equals("d", StringComparison.OrdinalIgnoreCase);
                    files.Add(filename);
                    line = await reader.ReadLineAsync();
                }

                var tasks = new List<Task>();

                //int i = 0;
                foreach (var file in files)
                {
                    //if (i < 1)
                    //{
                    bool shouldDownload = await ShouldDownload(connectionString, suppressionFileTypeId, file, pattern);
                    if (shouldDownload)
                    {
                        tasks.Add(DownloadFile(localPath, file, file, host, userName, password));
                        fileNames.Add(localPath + "\\" + file);
                        //i++;
                    }
                    //}                    
                }

                await Task.WhenAll(tasks);
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 1, "DailyGlobalSuppressionFtpImporter", "DoDownload", "Exception",
                        $@"ShouldDownload: localpath={localPath}::pattern={pattern}::suppressionFileTypeId={suppressionFileTypeId}::host={host}::port={port.ToString()}::userName={userName}::{ex.ToString()}");
            }
            finally
            {
                if (reader != null) reader.Close();
                if (response != null) response.Close();
            }            

            return fileNames;
        }

        static async Task<bool> ShouldDownload(string connectionString, byte suppressionFileTypeId, string fileName, string pattern)
        {
            bool ret = false;
            if (Regex.Match(fileName, pattern).Success)
            {
                bool alreadyDownloaded = await DataLayer.AlreadyDownloaded(connectionString, fileName, suppressionFileTypeId);
                if (alreadyDownloaded)
                {
                    await DataLayer.InsertErrorLog(connectionString, 1, "DailyGlobalSuppressionFtpImporter", "ShouldDownload", "Already downloaded",
                        $@"ShouldDownload: filename={fileName}::pattern={pattern}");
                }
                else
                {
                    ret = true;
                } 
            }
            return ret;
        } 

        public static async Task DownloadFile(string baseDir, string sourceFile, string destinationFile, string host, string userName, string password)
        { 
            FileStream f = null;
            FtpWebResponse response = null;
            try
            {
                f = File.OpenWrite(baseDir + @"\" + destinationFile);
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(new Uri(@"ftp://" + host + @"//" + destinationFile));
                request.Method = WebRequestMethods.Ftp.DownloadFile; 
                request.Credentials = new NetworkCredential(userName, password);
                request.UseBinary = false;
                response = (FtpWebResponse) (await request.GetResponseAsync());
                Stream responseStream = response.GetResponseStream();
                await responseStream.CopyToAsync(f);                
            }
            finally
            {
                if (f != null) f.Close();
                if (response != null) response.Close();
            }
        }
        
        public static async Task<bool> ImportData(string connectionString, string baseDir, string path, string fileName, DateTime fileDate, byte suppressionFileTypeId)
        {
            bool success = true;
            Table tb = null;
            DateTime jobStartTime = DateTime.Now;

            try
            {
                await DataLayer.InsertErrorLog(connectionString, 1, "DailyGlobalSuppressionFtpImporter", "ImportData", "Informational",
                        $"ImportData: path={path}::fileName={fileName}::fileDate={fileDate.ToString()}::suppressionFileTypeId={suppressionFileTypeId.ToString()}");                

                // Create temporary table with Guid-based name            
                Server srv = new Server();
                Database db = srv.Databases["dataMail"];
                tb = new Table(db, "DeltaInsert" + Guid.NewGuid().ToString());
                Column dataCol = new Column(tb, "DataColumn", DataType.VarChar(1000));
                dataCol.Collation = "Latin1_General_CI_AS";
                dataCol.Nullable = true;
                tb.Columns.Add(dataCol);                
                tb.Create();

                // Use SSIS to load data into temporary table
                // Could modify the XML directly which might be faster, and certainly easier
                string pkg = $@"{baseDir}\DailyGlobalSuppressionImport.dtsx";
                DtsRuntime.Application app = new DtsRuntime.Application();
                DtsRuntime.Package p = app.LoadPackage(pkg, null);
                DtsRuntime.Executable e = p.Executables[0];
                DtsRuntime.TaskHost thMainPipe = e as DtsRuntime.TaskHost;
                MainPipe dataFlowTask = thMainPipe.InnerObject as MainPipe;
                dataFlowTask.ComponentMetaDataCollection["OLE DB Destination"].CustomPropertyCollection["OpenRowset"].Value = tb.ToString();
                p.Connections["DeltaFileConnectionManager"].ConnectionString = $@"{baseDir}\{fileName}";
                p.Execute();

                // Run merge job into appropriate destination table
                string sqlString = String.Empty;
                
                sqlString = $@"INSERT INTO [DailyGlobalSuppressionFtp].[DataRecords]
                (
                    DataColumn,
                    FileDate,
                    SuppressionFileTypeId                     
                )
                SELECT
                    DataColumn, 
                    '{fileDate.ToString()}',
                    {suppressionFileTypeId.ToString()}                                          
                FROM {tb.ToString()}";                

                if (sqlString != String.Empty)
                {
                    await DataLayer.ExecuteNonQueryAsyncSqlString(connectionString, sqlString);
                }
            }
            catch (Exception ex)
            {
                success = false;
                await DataLayer.InsertErrorLog(connectionString, 100, "DailyGlobalSuppressionFtpImporter", "ImportData", "Exception",
                             $"ImportData: path={path}::fileName={fileName}::fileDate={fileDate.ToString()}::suppressionFileTypeId={suppressionFileTypeId.ToString()}::{ex.ToString()}");
            }
            finally
            {
                // Drop temporary table
                tb.Drop();
            }

            return success;           
        }        
    }    
}
