using Microsoft.SqlServer.Management.Smo;
using DtsRuntime = Microsoft.SqlServer.Dts.Runtime;
using Microsoft.SqlServer.Dts.Pipeline.Wrapper;
//using Renci.SshNet;
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
using System.IO.Compression;

namespace NewLighthouseFtpLib
{
    public class NewLighthouseFtpTasks
    {
        public static async Task DoImport(string connectionString, string localPath, string host, int port, string userName, string password)
        {
            Dictionary<byte, DataLayer.FileType> fileTypes = await DataLayer.PopulateFileType(connectionString).ConfigureAwait(continueOnCapturedContext: false); 

            foreach (KeyValuePair<byte, DataLayer.FileType> fileType in fileTypes)
            {
                await DoImportPerType(connectionString, localPath, fileType.Value.Id, fileType.Value.Pattern, host, port, userName, password)
                    .ConfigureAwait(continueOnCapturedContext: false);
            }

            await DataLayer.InsertIntoContactAndDataByEmail(connectionString);
        }

        public static async Task DoImportPerType(string connectionString, string localPath, byte suppressionFileTypeId, string pattern, string host, int port, string userName, string password)
        {
            DateTime jobStartDate = DateTime.Now;
            List<string> files = await DoDownload(connectionString, localPath, pattern, suppressionFileTypeId, host, port, userName, password)
                .ConfigureAwait(continueOnCapturedContext: false);

            //List<string> files = Directory.EnumerateFiles(localPath).Where((x)=>x.EndsWith(".zip")).ToList();

            foreach (string fname in files)
            {
                try
                {
                    FileInfo fi = new FileInfo(fname);
                    if (fi.Length == 0)
                    {
                        fi.Delete();
                        continue;
                    }
                    string dirName = fi.DirectoryName;

                    DateTime baseFileDate = new DateTime(1900, 1, 1);
                    string baseFileName = String.Empty;
                    string[] nameAndExt = fi.Name.Split(new char[] { '.' });
                    if (nameAndExt == null || nameAndExt.Length != 2 || (nameAndExt[1] != "zip"))
                    {
                        await DataLayer.InsertErrorLog(connectionString, 100, "NewLighthouseFtpService", "DoImport", "Invalid File Name",
                            $"DoImport nameAndExt: fname={fname}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}");
                        continue;
                    }
                    else
                    {
                        string[] nameAndDate = nameAndExt[0].Split(new char[] { '_' });
                        if (nameAndDate == null || (nameAndDate.Length != 2 && nameAndDate.Length != 3))
                        {
                            await DataLayer.InsertErrorLog(connectionString, 100, "NewLighthouseFtpService", "DoImport", "Invalid File Name",
                                $"DoImport idAndDate: fname={fname}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}")
                                .ConfigureAwait(continueOnCapturedContext: false);
                            continue;
                        }                        
                        baseFileDate = DateTime.ParseExact(nameAndDate[1], "yyyyMMdd", CultureInfo.InvariantCulture);
                        baseFileName = fi.Name;
                    }

                    bool dedup = true;
                    string unzippedFileName = String.Empty;
                    if (nameAndExt[1] == "zip")
                    {
                        Utility.UnzipZip(fi);
                        unzippedFileName = nameAndExt[0] + ".csv";
                    }
                    else
                    {
                        unzippedFileName = fi.Name;
                        dedup = false;
                    }

                    string unzippedFullFileName = dirName + "\\" + unzippedFileName;
                    FileInfo uzfi = new FileInfo(unzippedFullFileName);

                    int fileLineCount = File.ReadLines(unzippedFullFileName).Count();
                    bool imported = await ImportData(connectionString, localPath, dirName, uzfi.Name, baseFileDate, suppressionFileTypeId, dedup);
                    if (imported)
                    {
                        await DataLayer.InsertProcessedFtpFile(connectionString, suppressionFileTypeId, baseFileName, baseFileDate, jobStartDate, DateTime.Now, fileLineCount, -1)
                            .ConfigureAwait(continueOnCapturedContext: false);
                    }
                    else
                    {
                        await DataLayer.InsertErrorLog(connectionString, 100, "NewLighthouseFtpService", "DoImport", "Failed to import",
                                $"DoImport Failed to import: fname={fname}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}")
                                .ConfigureAwait(continueOnCapturedContext: false);
                    }

                    try
                    {
                        if (nameAndExt[1] == "zip")  File.Delete(dirName + @"\" + fi.Name);
                        File.Delete(dirName + @"\" + uzfi.Name);
                        //await DeleteFileFromFtpServer(fi.Name, host, port, userName, password).ConfigureAwait(continueOnCapturedContext: false);  // Considered complete even if delete fails
                    }
                    catch (Exception ex)
                    {
                        await DataLayer.InsertErrorLog(connectionString, 100, "NewLighthouseFtpService", "DoImport", "Exception",
                                $"DoImport Failed to delete from ftp server: fname={fname}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}::ex={ex.ToString()}")
                                .ConfigureAwait(continueOnCapturedContext: false);
                    }                    
                }
                catch (Exception ex)
                {
                    await DataLayer.InsertErrorLog(connectionString, 100, "NewLighthouseFtpService", "DoImport", "Exception",
                            $"DoImport Exception processing file: fname={fname}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}::ex={ex.ToString()}")
                            .ConfigureAwait(continueOnCapturedContext: false);
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
                endDate = today.AddDays(-delayInDays+1);

                // The ftps must all be completed prior to this end day
                if ((endDate <= lastFtpProcessed) && (startDate < endDate))
                {
                    // New data to be provided
                    string destinationFile = $@"NewLighthouse_{today.ToString("yyyyMMdd")}.txt";
                    string sourceFile = $@"{baseDir}\{destinationFile}";
                    await ExportData(connectionString, baseDir, sourceFile, startDate, endDate).ConfigureAwait(continueOnCapturedContext: false);
                    await UploadFile(sourceFile, destinationFile, host, userName, password).ConfigureAwait(continueOnCapturedContext: false);
                    await DataLayer.InsertThirdPartyExportLog(connectionString, DateTime.Now, startDate, endDate, host, port, userName, delayInDays)
                        .ConfigureAwait(continueOnCapturedContext: false);
                    File.Delete(sourceFile);

                    await DataLayer.InsertErrorLog(connectionString, 1, "NewLighthouseFtpService", "DoExport", "Data Exported",
                        $@"DoExport: host={host}::port={port.ToString()}::userName={userName}::delay={delayInDays.ToString()}
                           ::today={today.ToString()}::lastFtpProcessed={lastFtpProcessed.ToString()}::lastEndDayProvided={lastEndDayProvided.ToString()}
                           ::startDate={startDate.ToString()}::endDate={endDate.ToString()}").ConfigureAwait(continueOnCapturedContext: false);
                } 
                else
                {
                    // No new data to be provided
                    await DataLayer.InsertErrorLog(connectionString, 1, "NewLighthouseFtpService", "DoExport", "No new data",
                        $@"DoExport: host={host}::port={port.ToString()}::userName={userName}::delay={delayInDays.ToString()}
                           ::today={today.ToString()}::lastFtpProcessed={lastFtpProcessed.ToString()}::lastEndDayProvided={lastEndDayProvided.ToString()}")
                           .ConfigureAwait(continueOnCapturedContext: false);
                }
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 100, "NewLighthouseFtpService", "DoExport", "Exception",
                        $"DoExport Exception: host={host}::port={port.ToString()}::userName={userName}::ex={ex.ToString()}")
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
                response = (FtpWebResponse)(await request.GetResponseAsync().ConfigureAwait(continueOnCapturedContext: false));
                response.Close();
            }
            finally
            {
                if (response != null) response.Close();
            }
        }

        public static async Task<List<string>> DoDownload(string connectionString, string localPath, string pattern, byte fileTypeId, string host, int port, string userName, string password)
        {
            FtpWebResponse response = null;
            StreamReader reader = null;
            List<string> fileNames = new List<string>();

            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(new Uri(@"ftp://" + host + @"/"));
                request.Method = WebRequestMethods.Ftp.ListDirectory;
                request.Credentials = new NetworkCredential(userName, password);
                response = (FtpWebResponse)(await request.GetResponseAsync().ConfigureAwait(continueOnCapturedContext: false));

                Stream responseStream = response.GetResponseStream();
                reader = new StreamReader(responseStream);
                //string listing = reader.ReadToEnd();

                List<string> files = new List<string>();

                string line = await reader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                while (!string.IsNullOrEmpty(line))
                {                    
                    files.Add(line);
                    line = await reader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                }

                var tasks = new List<Task>();

                //int i = 0;
                foreach (var file in files)
                {
                    //if (i < 1)
                    //{
                    bool shouldDownload = await ShouldDownload(connectionString, fileTypeId, file, pattern).ConfigureAwait(continueOnCapturedContext: false);
                    if (shouldDownload)
                    {
                        tasks.Add(DownloadFile(localPath, file, file, host, userName, password));
                        fileNames.Add(localPath + "\\" + file);
                        //i++;
                    }
                    //}                    
                }

                await Task.WhenAll(tasks).ConfigureAwait(continueOnCapturedContext: false);
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 1, "NewLighthouseFtpService", "DoDownload", "Exception",
                        $@"ShouldDownload: localpath={localPath}::pattern={pattern}::fileTypeId={fileTypeId}::host={host}::port={port.ToString()}::userName={userName}::{ex.ToString()}")
                        .ConfigureAwait(continueOnCapturedContext: false);
            }
            finally
            {
                if (reader != null) reader.Close();
                if (response != null) response.Close();
            }

            return fileNames;
        }

        static async Task<bool> ShouldDownload(string connectionString, byte fileTypeId, string fileName, string pattern)
        {
            bool ret = false;
            if (Regex.Match(fileName, pattern).Success)
            {
                bool alreadyDownloaded = await DataLayer.AlreadyDownloaded(connectionString, fileName, fileTypeId).ConfigureAwait(continueOnCapturedContext: false);
                if (alreadyDownloaded)
                {
                    await DataLayer.InsertErrorLog(connectionString, 1, "NewLighthouseFtpService", "ShouldDownload", "Already downloaded",
                        $@"ShouldDownload: filename={fileName}::pattern={pattern}").ConfigureAwait(continueOnCapturedContext: false);
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
                response = (FtpWebResponse)(await request.GetResponseAsync().ConfigureAwait(continueOnCapturedContext: false));
                Stream responseStream = response.GetResponseStream();
                await responseStream.CopyToAsync(f).ConfigureAwait(continueOnCapturedContext: false);
            }
            finally
            {
                if (f != null) f.Close();
                if (response != null) response.Close();
            }
        }

        public static async Task UploadFile(string sourceFile, string destinationFile, string host, string userName, string password)
        {
            FileStream f = null;
            try
            {
                f = File.OpenRead(sourceFile);
                FtpWebRequest request = (FtpWebRequest)FtpWebRequest.Create(new Uri(@"ftp://" + host + @"/" + destinationFile));
                request.Method = WebRequestMethods.Ftp.UploadFile;
                request.Credentials = new System.Net.NetworkCredential(userName, password);
                request.UseBinary = false;
                Stream rs = await request.GetRequestStreamAsync().ConfigureAwait(continueOnCapturedContext: false);
                await f.CopyToAsync(rs).ConfigureAwait(continueOnCapturedContext: false);
            }
            finally
            {
                if (f != null) f.Close();
            }
        }

        public static async Task<bool> ImportData(string connectionString, string baseDir, string path, string fileName, DateTime fileDate, byte fileTypeId, bool dedup)
        {
            bool success = true;
            Table tb = null;
            DateTime jobStartTime = DateTime.Now;

            try
            {
                await DataLayer.InsertErrorLog(connectionString, 1, "NewLighthouseFtpService", "ImportData", "Informational",
                        $"ImportData: path={path}::fileName={fileName}::fileDate={fileDate.ToString()}::fileTypeId={fileTypeId.ToString()}")
                        .ConfigureAwait(continueOnCapturedContext: false);

                // Create temporary table with Guid-based name            
                Server srv = new Server();
                Database db = srv.Databases["dataMail"];
                tb = new Table(db, "DeltaInsert" + Guid.NewGuid().ToString());
                Column dataColHashedEmail = new Column(tb, "HashedEmail", DataType.VarChar(1000));
                dataColHashedEmail.Collation = "Latin1_General_CI_AS";
                dataColHashedEmail.Nullable = true;
                tb.Columns.Add(dataColHashedEmail);
                Column dataColIpAddress = new Column(tb, "IpAddress", DataType.VarChar(1000));
                dataColIpAddress.Collation = "Latin1_General_CI_AS";
                dataColIpAddress.Nullable = true;
                tb.Columns.Add(dataColIpAddress);
                Column dataColDomain = new Column(tb, "Domain", DataType.VarChar(1000));
                dataColDomain.Collation = "Latin1_General_CI_AS";
                dataColDomain.Nullable = true;
                tb.Columns.Add(dataColDomain);
                Column dataColRecordDate = new Column(tb, "RecordDate", DataType.VarChar(1000));
                dataColRecordDate.Collation = "Latin1_General_CI_AS";
                dataColRecordDate.Nullable = true;
                tb.Columns.Add(dataColRecordDate);
                tb.Create();

                // Use SSIS to load data into temporary table
                // Could modify the XML directly which might be faster, and certainly easier
                string pkg = $@"{baseDir}\NewLighthouseFtpImport.dtsx";
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
                if (!dedup)
                {
                    sqlString = $@"INSERT INTO [NewLighthouseFtp].[DataRecords]
                    (
                        HashedEmail,
                        IpAddress,
                        Domain,
                        RecordDate,
                        FileDate,
                        FileTypeId                     
                    )
                    SELECT
                        HashedEmail,
                        IpAddress,
                        Domain,
                        RecordDate, 
                        '{fileDate.ToString()}',
                        {fileTypeId.ToString()}                                          
                    FROM {tb.ToString()}";
                }
                else
                {
                    sqlString = $@"INSERT INTO [NewLighthouseFtp].[DataRecords]
                    (
                        HashedEmail,
                        IpAddress,
                        Domain,
                        RecordDate,
                        FileDate,
                        FileTypeId                     
                    )
                    SELECT
                        HashedEmail,
                        IpAddress,
                        Domain,
                        RecordDate, 
                        '{fileDate.ToString()}',
                        {fileTypeId.ToString()}    
                    FROM
                    (
                    SELECT
                        HashedEmail,
                        IpAddress,
                        Domain,
                        MIN(RecordDate) RecordDate
                    FROM {tb.ToString()}
                    GROUP BY HashedEmail, IpAddress, Domain
                    ) T";
                }                

                if (sqlString != String.Empty)
                {
                    await DataLayer.ExecuteNonQueryAsyncSqlString(connectionString, sqlString).ConfigureAwait(continueOnCapturedContext: false);
                }
            }
            catch (Exception ex)
            {
                success = false;
                await DataLayer.InsertErrorLog(connectionString, 100, "NewLighthouseFtpService", "ImportData", "Exception",
                             $"ImportData: path={path}::fileName={fileName}::fileDate={fileDate.ToString()}::fileTypeId={fileTypeId.ToString()}::{ex.ToString()}")
                             .ConfigureAwait(continueOnCapturedContext: false);
            }
            finally
            {
                // Drop temporary table
                tb.Drop();
            }

            return success;
        }

        public static async Task ExportData(string connectionString, string baseDir, string destinationFile, DateTime startDate, DateTime endDate)
        {
            DateTime jobStartTime = DateTime.Now;

            try
            {
                await DataLayer.InsertErrorLog(connectionString, 1, "NewLighthouseFtpService", "ExportData", "Informational",
                        $"ExportData: destinationFile={destinationFile}::startDate={startDate}::endDate={endDate}")
                        .ConfigureAwait(continueOnCapturedContext: false);

                string pkg = $@"{baseDir}\NewLighthouseFtpExport.dtsx";
                DtsRuntime.Application app = new DtsRuntime.Application();
                DtsRuntime.Package p = app.LoadPackage(pkg, null);
                p.Variables["User::StartDate"].Value = startDate;
                p.Variables["User::EndDate"].Value = endDate;
                p.Variables["User::FileName"].Value = destinationFile;

                p.Execute();                
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 100, "NewLighthouseFtpService", "ExportData", "Exception",
                             $"ExportData: destinationFile={destinationFile}::startDate={startDate}::endDate={endDate}::{ex.ToString()}")
                             .ConfigureAwait(continueOnCapturedContext: false);
            }            
        }
    }    
}
