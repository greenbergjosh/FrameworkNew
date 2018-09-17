using Microsoft.SqlServer.Management.Smo;
using DtsRuntime = Microsoft.SqlServer.Dts.Runtime;
using Microsoft.SqlServer.Dts.Pipeline.Wrapper;
using Renci.SshNet;
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

namespace TowerDataFtpLib
{
    public class TowerDataFtpTasks
    {  
        public static async Task DoImport(string connectionString, string localPath, string pattern, string host, int port, string userName, string password)
        {
            DateTime jobStartDate = DateTime.Now;
            List<string> files = await DoDownload(connectionString, localPath, pattern, host, port, userName, password);
            //List<string> files = new List<string>()
            //{
            //    @"D:\TowerDataFtpStore\3970_20170210.csv.gz",
            //    @"D:\TowerDataFtpStore\3970_20170220.csv.gz"
            //};

            foreach (string fname in files)
            {
                try
                {
                    FileInfo fi = new FileInfo(fname);
                    string dirName = fi.DirectoryName;

                    DateTime baseFileDate = new DateTime(1900, 1, 1);
                    string baseFileName = String.Empty;
                    string[] nameAndExt = fi.Name.Split(new char[] { '.' });
                    if (nameAndExt == null || nameAndExt.Length != 3 || nameAndExt[1] != "csv" || nameAndExt[2] != "gz")
                    {
                        await DataLayer.InsertErrorLog(connectionString, 100, "TowerDataFtpService", "DoImport", "Invalid File Name",
                            $"DoImport nameAndExt: fname={fname}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}");
                        continue;
                    }
                    else
                    {
                        string[] idAndDate = nameAndExt[0].Split(new char[] { '_' });
                        if (idAndDate == null || idAndDate.Length != 2)
                        {
                            await DataLayer.InsertErrorLog(connectionString, 100, "TowerDataFtpService", "DoImport", "Invalid File Name",
                                $"DoImport idAndDate: fname={fname}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}");
                            continue;
                        }                        
                        baseFileDate = DateTime.ParseExact(idAndDate[1], "yyyyMMdd", CultureInfo.InvariantCulture);
                        baseFileName = fi.Name;
                    }                    

                    await GUnzip(connectionString, dirName, fi.Name);
                    string unzippedFileName = nameAndExt[0] + "." + nameAndExt[1];
                    int fileLineCount = File.ReadLines(dirName + @"\" + unzippedFileName).Count();
                    await ImportData(connectionString, localPath, dirName, unzippedFileName);
                    await DataLayer.InsertProcessedFtpFile(connectionString, baseFileName, baseFileDate, jobStartDate, DateTime.Now, fileLineCount, -1);
                    try
                    {
                        File.Delete(dirName + @"\" + unzippedFileName);
                        //DeleteFileFromTowerDataServer(fi.Name, host, port, userName, password);  // Considered complete even if delete fails
                    }
                    catch (Exception ex)
                    {
                        await DataLayer.InsertErrorLog(connectionString, 100, "TowerDataFtpService", "DoImport", "Exception",
                                $"DoImport Failed to delete from TowerData server: fname={fname}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}::ex={ex.ToString()}");
                    }

                    await DataLayer.InsertIntoContactAndDataByEmail(connectionString);
                }
                catch (Exception ex)
                {
                    await DataLayer.InsertErrorLog(connectionString, 100, "TowerDataFtpService", "DoImport", "Exception",
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
                DateTime lastFtpProcessed = await DataLayer.GetMaxDateFtpFileProcessed(connectionString);
                DateTime lastEndDayProvided = await DataLayer.GetMaxEndDayProvidedToThirdParty(connectionString, host, port, userName);  // day not yet processed
                //lastEndDayProvided = new DateTime(2017, 3, 6); // Change end day to redo a run - comment write to insertthirdpartyexportlog as well
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
                    string destinationFile = $@"OpenSignalBatch_{today.ToString("yyyyMMdd")}.txt";
                    string sourceFile = $@"{baseDir}\{destinationFile}";
                    await ExportData(connectionString, baseDir, sourceFile, startDate, endDate);
                    await UploadFile(sourceFile, destinationFile, host, userName, password);
                    await DataLayer.InsertThirdPartyExportLog(connectionString, DateTime.Now, startDate, endDate, host, port, userName, delayInDays);
                    File.Delete(sourceFile);

                    await DataLayer.InsertErrorLog(connectionString, 1, "TowerDataFtpService", "DoExport", "Data Exported",
                        $@"DoExport: host={host}::port={port.ToString()}::userName={userName}::delay={delayInDays.ToString()}
                           ::today={today.ToString()}::lastFtpProcessed={lastFtpProcessed.ToString()}::lastEndDayProvided={lastEndDayProvided.ToString()}
                           ::startDate={startDate.ToString()}::endDate={endDate.ToString()}");
                } 
                else
                {
                    // No new data to be provided
                    await DataLayer.InsertErrorLog(connectionString, 1, "TowerDataFtpService", "DoExport", "No new data",
                        $@"DoExport: host={host}::port={port.ToString()}::userName={userName}::delay={delayInDays.ToString()}
                           ::today={today.ToString()}::lastFtpProcessed={lastFtpProcessed.ToString()}::lastEndDayProvided={lastEndDayProvided.ToString()}");
                }
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 100, "TowerDataFtpService", "DoExport", "Exception",
                        $"DoExport Exception: host={host}::port={port.ToString()}::userName={userName}::ex={ex.ToString()}");
            }            
        }

        public static void DeleteFileFromTowerDataServer(string remoteFile, string host, int port, string userName, string password)
        {
            SftpClient client;
            using (client = new SftpClient(host, port, userName, password))
            {
                client.Connect();
                client.DeleteFile(remoteFile);
            }
        }

        //public static async Task<List<string>> DoDownload(string connectionString, string localPath, string pattern, string host, int port, string userName, string password)
        //{
        //    SftpClient client;
        //    List<string> fileNames = new List<string>();

        //    using (client = new SftpClient(host, port, userName, password))
        //    {
        //        client.Connect();
        //        var files = client.ListDirectory("");

        //        var tasks = new List<Task>();

        //        //int i = 0;
        //        foreach (var file in files)
        //        {
        //            //if (i < 1)
        //            //{
        //            bool shouldDownload = await ShouldDownload(connectionString, file.Name, pattern);
        //            if (shouldDownload)
        //            {
        //                tasks.Add(DownloadFileAsync(client, file.FullName, localPath + "\\" + file.Name));
        //                fileNames.Add(localPath + "\\" + file.Name);
        //                //i++;
        //            }                        
        //            //}                    
        //        }

        //        await Task.WhenAll(tasks);
        //        client.Disconnect();
        //    }

        //    return fileNames;
        //}
        
        public static async Task<List<string>>DoDownload(string connectionString, string localPath, string pattern, string host, int port, string userName, string password)
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
                    bool shouldDownload = await ShouldDownload(connectionString, file, pattern).ConfigureAwait(continueOnCapturedContext: false);
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
                await DataLayer.InsertErrorLog(connectionString, 1, "TowerDataFtpService", "DoDownload", "Exception",
                        $@"ShouldDownload: localpath={localPath}::pattern={pattern}::host={host}::port={port.ToString()}::userName={userName}::{ex.ToString()}")
                        .ConfigureAwait(continueOnCapturedContext: false);
            }
            finally
            {
                if (reader != null) reader.Close();
                if (response != null) response.Close();
            }

            return fileNames;
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

        static async Task<bool> ShouldDownload(string connectionString, string fileName, string pattern)
        {
            bool ret = false;
            if (Regex.Match(fileName, pattern).Success)
            {
                bool alreadyDownloaded = await DataLayer.AlreadyDownloaded(connectionString, fileName);
                if (alreadyDownloaded)
                {
                    await DataLayer.InsertErrorLog(connectionString, 1, "TowerDataFtpService", "ShouldDownload", "Already downloaded",
                        $@"ShouldDownload: filename={fileName}::pattern={pattern}");
                }
                else
                {
                    ret = true;
                } 
            }
            return ret;
        }

        static async Task DownloadFileAsync(SftpClient client, string source, string destination)
        {
            using (var saveFile = File.OpenWrite(destination))
            {
                var task = Task.Factory.FromAsync(client.BeginDownloadFile(source, saveFile), client.EndDownloadFile);
                await task;
            }
        }

        //public static async Task UploadFile(string sourceFile, string destinationFile, string host, string userName, string password)
        //{
        //    FileStream f = null;
        //    try
        //    {
        //        //up(sourceFile, destinationFile, host, userName, password);
        //        f = File.OpenRead(sourceFile);
        //        FtpWebRequest request = (FtpWebRequest)FtpWebRequest.Create(new Uri(@"ftp://" + host + @"/" + destinationFile));
        //        request.Method = WebRequestMethods.Ftp.UploadFile;
        //        request.Credentials = new System.Net.NetworkCredential(userName, password);
        //        request.UseBinary = false;
        //        request.UsePassive = false;
        //        request.KeepAlive = true;
        //        Stream rs = await request.GetRequestStreamAsync();
        //        await f.CopyToAsync(rs);
        //    }
        //    catch (Exception ex)
        //    {
        //        string s = ex.ToString();
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

        public static async Task GUnzip(string connectionString, string path, string fileName)
        {
            DateTime jobStartTime = DateTime.Now;

            try
            {
                await DataLayer.InsertErrorLog(connectionString, 1, "TowerDataFtpService", "GUnzip", "Informational",
                        $"Gunzip: path={path}:fileName={fileName}");

                ProcessStartInfo _processStartInfo = new ProcessStartInfo();
                _processStartInfo.UseShellExecute = false;
                _processStartInfo.WorkingDirectory = path;
                _processStartInfo.FileName = "C:\\Program Files\\Git\\usr\\bin\\gzip";
                _processStartInfo.Arguments = $"-d {fileName}";
                _processStartInfo.CreateNoWindow = true;
                _processStartInfo.RedirectStandardOutput = true;
                _processStartInfo.RedirectStandardError = true;

                Process p = new Process();
                p.StartInfo = _processStartInfo;
                p.OutputDataReceived += new DataReceivedEventHandler((sender, e) => { });
                p.ErrorDataReceived += new DataReceivedEventHandler((sender, e) => { });
                p.Start();
                p.BeginOutputReadLine();
                p.BeginErrorReadLine();
                p.WaitForExit();
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 100, "TowerDataFtpService", "GUnzip", "Exception",
                            $"Gunzip: path={path}::fileName={fileName}::{ex.ToString()}");
            }            
        }

        public static async Task ImportData(string connectionString, string baseDir, string path, string fileName)
        {
            Table tb = null;
            DateTime jobStartTime = DateTime.Now;

            try
            {
                await DataLayer.InsertErrorLog(connectionString, 1, "TowerDataFtpService", "ImportData", "Informational",
                        $"ImportData: path={path}:fileName={fileName}");                

                // Create temporary table with Guid-based name            
                Server srv = new Server();
                Database db = srv.Databases["dataMail"];
                tb = new Table(db, "DeltaInsert" + Guid.NewGuid().ToString());
                Column timestampCol = new Column(tb, "OpenDate", DataType.VarChar(50));
                timestampCol.Collation = "Latin1_General_CI_AS";
                timestampCol.Nullable = true;
                tb.Columns.Add(timestampCol);
                Column md5Col = new Column(tb, "EmailMD5", DataType.VarChar(50));
                md5Col.Collation = "Latin1_General_CI_AS";
                md5Col.Nullable = true;
                tb.Columns.Add(md5Col);
                Column ipCol = new Column(tb, "IpAddress", DataType.VarChar(50));
                ipCol.Collation = "Latin1_General_CI_AS";
                ipCol.Nullable = true;
                tb.Columns.Add(ipCol); 
                tb.Create();

                // Use SSIS to load data into temporary table
                // Could modify the XML directly which might be faster, and certainly easier
                string pkg = $@"{baseDir}\TowerDataImport.dtsx";
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
                
                sqlString = $@"INSERT INTO [TowerData].[OpenSignal]
                (
                    OpenDate,
                    EmailMD5,
                    IpAddress                     
                )
                SELECT
                    OpenDate, 
                    EmailMD5,
                    IpAddress                                          
                FROM {tb.ToString()}";                

                if (sqlString != String.Empty)
                {
                    await DataLayer.ExecuteNonQueryAsyncSqlString(connectionString, sqlString);
                }
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 100, "TowerDataFtpService", "ImportData", "Exception",
                             $"ImportData: path={path}::fileName={fileName}::{ex.ToString()}");
            }
            finally
            {
                // Drop temporary table
                tb.Drop();
            }            
        }

        public static async Task ExportData(string connectionString, string baseDir, string destinationFile, DateTime startDate, DateTime endDate)
        {
            DateTime jobStartTime = DateTime.Now;

            try
            {
                await DataLayer.InsertErrorLog(connectionString, 1, "TowerDataFtpService", "ExportData", "Informational",
                        $"ExportData: destinationFile={destinationFile}::startDate={startDate}::endDate={endDate}");

                string pkg = $@"{baseDir}\TowerDataExport.dtsx";
                DtsRuntime.Application app = new DtsRuntime.Application();
                DtsRuntime.Package p = app.LoadPackage(pkg, null);
                p.Variables["User::StartDate"].Value = startDate;
                p.Variables["User::EndDate"].Value = endDate;
                p.Variables["User::FileName"].Value = destinationFile;

                p.Execute();                
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 100, "TowerDataFtpService", "ExportData", "Exception",
                             $"ExportData: destinationFile={destinationFile}::startDate={startDate}::endDate={endDate}::{ex.ToString()}");
            }            
        }
    }    
}
