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
using System.Web;

namespace IndiaLiveFeedFtpLib
{
    public class IndiaLiveFeedFtpTasks
    {

        public static async Task DoImport(string connectionString, string localPath, string host, int port, string userName, string password)
        {
            // The FileTypes in this case are lists.
            // For each list, we will dynamically create a new FileType implicitly within the ProcessedFtpFile table
            // Each list has, potentially, two files, the main file and the error file.
            // The two files are processed independently so we know if we have processed each type.

            // When we run, there will be one or more dated (yyyy-MM-dd) directories.
            // In each of those directories there will be files named as either
            //  1. <listname>
            //  2. error_log_<listname>
            // We will process each list (not directory) as an ImportType

            Tuple<Dictionary<string, List<Tuple<string, string, bool>>>, List<string>> listFiles = 
                await GetListFiles(connectionString, host, userName, password).ConfigureAwait(continueOnCapturedContext: false);

            foreach (KeyValuePair<string, List<Tuple<string, string, bool>>> listType in listFiles.Item1)
            {
                await DoImportPerType(connectionString, localPath, listType.Key, listType.Value, host, port, userName, password)
                    .ConfigureAwait(continueOnCapturedContext: false);
            }

            await DeleteOldDirectoriesFromFtpServer(connectionString, host, port, userName, password, listFiles.Item2, 7)
                                .ConfigureAwait(continueOnCapturedContext: false);
        }

        public static async Task DeleteOldDirectoriesFromFtpServer(string connectionString, string host, int port, string userName, 
            string password, List<string> dirs, int delayInDays)
        {
            FtpWebResponse response = null;
            DateTime today = DateTime.Now;
            foreach (string dir in dirs)
            {
                DateTime dirDate = DateTime.ParseExact(dir, "yyyy-MM-dd", CultureInfo.InvariantCulture);
                if (today.Subtract(dirDate).TotalDays > delayInDays)
                {
                    try
                    {
                        FtpWebRequest request = (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}/{dir}"));
                        request.Method = WebRequestMethods.Ftp.RemoveDirectory;
                        request.Credentials = new NetworkCredential(userName, password);
                        response = (FtpWebResponse)(await request.GetResponseAsync());
                        response.Close();
                    }
                    catch (Exception ex)
                    {
                        await DataLayer.InsertErrorLog(connectionString, 100, "IndiaLiveFeedFtpImporter", "DeleteOldDirectoriesFromFtpServer", "Exception",
                            $"dir={dir}::host={host}::userName={userName}::ex={ex.ToString()}").ConfigureAwait(continueOnCapturedContext: false);
                    }
                    finally
                    {
                        if (response != null) response.Close();
                    }
                }
            }            
        }

        public static async Task<Tuple<Dictionary<string, List<Tuple<string, string, bool>>>, List<string>>> GetListFiles(string connectionString, 
            string host, string userName, string password)
        {
            //Dictionary<ListName, Tuple<FileName, DirName, IsError>>
            Dictionary<string, List<Tuple<string, string, bool>>> listFiles = new Dictionary<string, List<Tuple<string, string, bool>>>();
            List<string> dirs = new List<string>();

            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}/"));
                request.Method = WebRequestMethods.Ftp.ListDirectory;
                request.Credentials = new NetworkCredential(userName, password);
                using (FtpWebResponse response = (FtpWebResponse)(await request.GetResponseAsync().ConfigureAwait(continueOnCapturedContext: false)))
                {
                    using (Stream responseStream = response.GetResponseStream())
                    {
                        using (StreamReader reader = new StreamReader(responseStream))
                        { 
                            string line = await reader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                            while (!string.IsNullOrEmpty(line))
                            {
                                dirs.Add(line);
                                line = await reader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                            }

                            foreach (string dir in dirs)
                            {
                                FtpWebRequest fileRequest = (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}/{dir}/"));
                                fileRequest.Method = WebRequestMethods.Ftp.ListDirectory;
                                fileRequest.Credentials = new NetworkCredential(userName, password);
                                using (FtpWebResponse fileResponse = (FtpWebResponse)(await fileRequest.GetResponseAsync().ConfigureAwait(continueOnCapturedContext: false)))
                                {
                                    using (Stream fileResponseStream = fileResponse.GetResponseStream())
                                    {
                                        using (StreamReader fileReader = new StreamReader(fileResponseStream))
                                        {
                                            string fileLine = await fileReader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                                            while (!string.IsNullOrEmpty(fileLine))
                                            {
                                                bool isErrorFile = false;
                                                string listName = fileLine;
                                                if (fileLine.Equals("error_log_")) listName = "__unknownlist__";
                                                else if (fileLine.StartsWith("error_log_")) { listName = listName.Substring(10); isErrorFile = true; }
                                                if (!listFiles.ContainsKey(listName))
                                                {
                                                    listFiles.Add(listName, new List<Tuple<string, string, bool>> {
                                                        new Tuple<string, string, bool>(fileLine, dir, isErrorFile) });
                                                }
                                                else
                                                {
                                                    listFiles[listName].Add(new Tuple<string, string, bool>(fileLine, dir, isErrorFile));
                                                }

                                                fileLine = await fileReader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                                            }
                                        }                                            
                                    }                                        
                                }                                    
                            }
                        }
                    }
                }   
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 100, "IndiaLiveFeedFtpImporter", "GetListFiles", "Exception",
                        $"host={host}::userName={userName}::ex={ex.ToString()}").ConfigureAwait(continueOnCapturedContext: false);
            }            

            return new Tuple<Dictionary<string, List<Tuple<string, string, bool>>>, List<string>>(listFiles, dirs);
        }

        public class IndiaFeedDataRecord
        {
            public string FileList;
            public DateTime FileDate;
            public bool IsErrorFile;
            public string OptInSourceUrlId;
            public string OptInDateTime;
            public string OptInIp;
            public string EmailAddress;
            public string FirstName;
            public string LastName;
            public string Address1;
            public string Address2;
            public string City;
            public string State;
            public string PostalCode;
            public string Country;
            public string HomePhone;
            public string MobilePhone;
            public string Gender;
            public string DateOfBirth;
            public string ProviderName;
            public string FeedName;
            public string ReceivedTime;
            public string OptInRecordReceivedUtcDate;
            public string Unmailable;
            public string UnmailableReason;
            public string entities;
            public string Excess;
            public string FullQueryString;
        };

        public static Dictionary<string, string> FeedKeys = new Dictionary<string, string>()
        {
            {"optinsourceurlid", ""},
            {"optindatetime", ""},
            {"optinip", ""},
            {"emailaddress", ""},
            {"firstname", ""},
            {"lastname", ""},
            {"address1", ""},
            {"address2", ""},
            {"city", ""},
            {"state", ""},
            {"postalcode", ""},
            {"country", ""},
            {"homephone", ""},
            {"mobilephone", ""},
            {"gender", ""},
            {"dateofbirth", ""},
            {"providername", ""},
            {"feedname", ""},
            {"receivedtime", ""},
            {"optinrecordreceivedutcdate", ""},
            {"unmailable", ""},
            {"unmailablereason", ""},
            {"entities", ""},
            {"excess", ""},
            {"fullquerystring", ""},
        };

        public class IndiaFeedFailedDataRecord
        {
            public string FileList;
            public DateTime FileDate;
            public bool IsErrorFile;            
            public string FullQueryString;
        };

        public class IndiaFeedData
        {
            public List<IndiaFeedDataRecord> DataRecords;
            public List<IndiaFeedFailedDataRecord> FailedDataRecords;
        }

        public static async Task DoImportPerType(string connectionString, string localPath, string listName, List<Tuple<string, string, bool>> listFiles,
            string host, int port, string userName, string password)
        {
            DateTime jobStartDate = DateTime.Now;
            try
            {

                List<string> files = await DoDownload(connectionString, localPath, listName, listFiles, host, port, userName, password)
                    .ConfigureAwait(continueOnCapturedContext: false);

                foreach (var file in listFiles)
                {
                    int fileLineCount = 0;
                    string localFileName = $"{file.Item1}_{file.Item2}_{file.Item3.ToString()}.csv";
                    DateTime fileDate = DateTime.ParseExact(file.Item2, "yyyy-MM-dd", CultureInfo.InvariantCulture);

                    if (files.Contains($@"{localPath}\{localFileName}"))
                    {
                        FileInfo fi = new FileInfo($@"{localPath}\{localFileName}");
                        string dirName = fi.DirectoryName;

                        // Here is where we want to parse the actual file and then upload its contents
                        List<IndiaFeedDataRecord> recs = new List<IndiaFeedDataRecord>();
                        List<IndiaFeedFailedDataRecord> failedRecs = new List<IndiaFeedFailedDataRecord>();

                        using (StreamReader newFile = File.OpenText(fi.FullName))
                        {
                            while (!newFile.EndOfStream)
                            {
                                fileLineCount++;
                                string line = newFile.ReadLine();
                                try
                                {
                                    var qscoll = HttpUtility.ParseQueryString(line);

                                    StringBuilder sb = new StringBuilder();
                                    foreach (string key in qscoll.AllKeys)
                                    {
                                        if (!FeedKeys.ContainsKey(key.ToLower())) sb.Append($@"{key}={qscoll[key]}&");
                                    }
                                    string excess = sb.ToString().TrimEnd(new char[] { '&' });                                    

                                    recs.Add(
                                        new IndiaFeedDataRecord()
                                        {
                                            FileList = listName,
                                            FileDate = fileDate,
                                            IsErrorFile = file.Item3,
                                            OptInSourceUrlId = qscoll["OptInSourceUrlId"],
                                            OptInDateTime = qscoll["OptInDateTime"],
                                            OptInIp = qscoll["OptInIp"],
                                            EmailAddress = qscoll["EmailAddress"],
                                            FirstName = qscoll["FirstName"],
                                            LastName = qscoll["LastName"],
                                            Address1 = qscoll["Address1"],
                                            Address2 = qscoll["Address2"],
                                            City = qscoll["City"],
                                            State = qscoll["State"],
                                            PostalCode = qscoll["PostalCode"],
                                            Country = qscoll["Country"],
                                            HomePhone = qscoll["HomePhone"],
                                            MobilePhone = qscoll["MobilePhone"],
                                            Gender = qscoll["Gender"],
                                            DateOfBirth = qscoll["DateOfBirth"],
                                            ProviderName = qscoll["ProviderName"],
                                            FeedName = qscoll["FeedName"],
                                            ReceivedTime = qscoll["ReceivedTime"],
                                            OptInRecordReceivedUtcDate = qscoll["OptInRecordReceivedUtcDate"],
                                            Unmailable = qscoll["Unmailable"],
                                            UnmailableReason = qscoll["UnmailableReason"],
                                            entities = qscoll["entities"],
                                            Excess = excess,
                                            FullQueryString = line
                                    });
                                }
                                catch (Exception ex)
                                {
                                    failedRecs.Add(
                                        new IndiaFeedFailedDataRecord()
                                        {
                                            FileList = listName,
                                            FileDate = DateTime.ParseExact(file.Item2, "yyyy-MM-dd", CultureInfo.InvariantCulture),
                                            IsErrorFile = file.Item3,                                        
                                            FullQueryString = line
                                        });
                                }  
                            }
                        }                        

                        IndiaFeedData data = new IndiaFeedData()
                        {
                            DataRecords = recs,
                            FailedDataRecords = failedRecs
                        };

                        bool imported = await ImportData(connectionString, localPath, data).ConfigureAwait(continueOnCapturedContext: false);
                        if (imported)
                        {
                            await DataLayer.InsertProcessedFtpFile(connectionString, listName, file.Item1, fileDate, file.Item3, jobStartDate, DateTime.Now, fileLineCount)
                                .ConfigureAwait(continueOnCapturedContext: false);
                        }
                        else
                        {
                            await DataLayer.InsertErrorLog(connectionString, 100, "IndiaLiveFeedFtpImporter", "DoImportPerType", "Failed to import",
                                    $"DoImportPerType Failed to import: fname={file.Item1}::fdate={file.Item2}::ftype={file.Item3.ToString()}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}")
                                    .ConfigureAwait(continueOnCapturedContext: false);
                        }

                        try
                        {
                            File.Delete(dirName + @"\" + fi.Name);
                            await DeleteFileFromFtpServer($@"{file.Item2}/{file.Item1}", host, port, userName, password)
                                .ConfigureAwait(continueOnCapturedContext: false);  // Considered complete even if delete fails                            
                        }
                        catch (Exception ex)
                        {
                            await DataLayer.InsertErrorLog(connectionString, 100, "IndiaLiveFeedFtpImporter", "DoImportPerType", "Exception",
                                    $"DoImportPerType Failed to delete from ftp server: fname={file.Item1}::fdate={file.Item2}::ftype={file.Item3.ToString()}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}::ex={ex.ToString()}")
                                    .ConfigureAwait(continueOnCapturedContext: false);
                        }
                    }
                    else
                    {
                        await DataLayer.InsertErrorLog(connectionString, 100, "IndiaLiveFeedFtpImporter", "DoImportPerType", "Failed to import",
                                    $"DoImportPerType Failed to import: fname={file.Item1}::fdate={file.Item2}::ftype={file.Item3.ToString()}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}")
                                    .ConfigureAwait(continueOnCapturedContext: false);
                    }
                }           
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 100, "IndiaLiveFeedFtpImporter", "DoImportPerType", "Exception",
                        $"DoImportPerType Exception processing file: listname={listName}::localPath={localPath}::host={host}::port={port.ToString()}::userName={userName}::ex={ex.ToString()}")
                        .ConfigureAwait(continueOnCapturedContext: false);
            }
        }

        //public static async Task DoExport(string connectionString, string baseDir, string host, int port, string userName, string password, int delayInDays)
        //{
        //    DateTime jobStartDate = DateTime.Now;

        //    DateTime startDate = new DateTime(1900, 1, 1);
        //    DateTime endDate = new DateTime(1900, 1, 1);

        //    try
        //    {
        //        DateTime tmpDate = DateTime.Now;
        //        DateTime today = new DateTime(tmpDate.Year, tmpDate.Month, tmpDate.Day);
        //        DateTime lastFtpProcessed = await DataLayer.GetMaxDateFtpFileProcessed(connectionString).ConfigureAwait(continueOnCapturedContext: false);
        //        DateTime lastEndDayProvided = await DataLayer.GetMaxEndDayProvidedToThirdParty(connectionString, host, port, userName)
        //            .ConfigureAwait(continueOnCapturedContext: false);  // day not yet processed

        //        // This runs every hour. We can get the day in which we are currently running - today.
        //        // We don't want to give out data earlier than (today - delayInDays)

        //        // We want our start day to be the lastEndDay
        //        startDate = lastEndDayProvided;

        //        // We want our end day to be 
        //        endDate = today.AddDays(-delayInDays + 1);

        //        // The ftps must all be completed prior to this end day
        //        if ((endDate <= lastFtpProcessed) && (startDate < endDate))
        //        {
        //            // New data to be provided
        //            string destinationFile = $@"DailyGlobalSuppression_{today.ToString("yyyyMMdd")}.txt";
        //            string sourceFile = $@"{baseDir}\{destinationFile}";
        //            await ExportData(connectionString, baseDir, sourceFile, startDate, endDate).ConfigureAwait(continueOnCapturedContext: false);
        //            await UploadFile(sourceFile, destinationFile, host, userName, password).ConfigureAwait(continueOnCapturedContext: false);
        //            await DataLayer.InsertThirdPartyExportLog(connectionString, DateTime.Now, startDate, endDate, host, port, userName, delayInDays)
        //                .ConfigureAwait(continueOnCapturedContext: false);
        //            File.Delete(sourceFile);

        //            await DataLayer.InsertErrorLog(connectionString, 1, "DailyGlobalSuppressionFtpService", "DoExport", "Data Exported",
        //                $@"DoExport: host={host}::port={port.ToString()}::userName={userName}::delay={delayInDays.ToString()}
        //                   ::today={today.ToString()}::lastFtpProcessed={lastFtpProcessed.ToString()}::lastEndDayProvided={lastEndDayProvided.ToString()}
        //                   ::startDate={startDate.ToString()}::endDate={endDate.ToString()}").ConfigureAwait(continueOnCapturedContext: false);
        //        }
        //        else
        //        {
        //            // No new data to be provided
        //            await DataLayer.InsertErrorLog(connectionString, 1, "DailyGlobalSuppressionFtpService", "DoExport", "No new data",
        //                $@"DoExport: host={host}::port={port.ToString()}::userName={userName}::delay={delayInDays.ToString()}
        //                   ::today={today.ToString()}::lastFtpProcessed={lastFtpProcessed.ToString()}::lastEndDayProvided={lastEndDayProvided.ToString()}")
        //                   .ConfigureAwait(continueOnCapturedContext: false);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        await DataLayer.InsertErrorLog(connectionString, 100, "DailyGlobalSuppressionFtpService", "DoExport", "Exception",
        //                $"DoExport Exception: host={host}::port={port.ToString()}::userName={userName}::ex={ex.ToString()}")
        //                .ConfigureAwait(continueOnCapturedContext: false);
        //    }
        //}

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

        //public static async Task ExportData(string connectionString, string baseDir, string destinationFile, DateTime startDate, DateTime endDate)
        //{
        //    DateTime jobStartTime = DateTime.Now;

        //    try
        //    {
        //        await DataLayer.InsertErrorLog(connectionString, 1, "DailyGlobalSuppressionFtpService", "ExportData", "Informational",
        //                $"ExportData: destinationFile={destinationFile}::startDate={startDate}::endDate={endDate}")
        //                .ConfigureAwait(continueOnCapturedContext: false);

        //        string pkg = $@"{baseDir}\DailyGlobalSuppressionFtpExport.dtsx";
        //        DtsRuntime.Application app = new DtsRuntime.Application();
        //        DtsRuntime.Package p = app.LoadPackage(pkg, null);
        //        p.Variables["User::StartDate"].Value = startDate;
        //        p.Variables["User::EndDate"].Value = endDate;
        //        p.Variables["User::FileName"].Value = destinationFile;

        //        p.Execute();
        //    }
        //    catch (Exception ex)
        //    {
        //        await DataLayer.InsertErrorLog(connectionString, 100, "DailyGlobalSuppressionFtpService", "ExportData", "Exception",
        //                     $"ExportData: destinationFile={destinationFile}::startDate={startDate}::endDate={endDate}::{ex.ToString()}")
        //                     .ConfigureAwait(continueOnCapturedContext: false);
        //    }
        //}

        public static async Task DeleteFileFromFtpServer(string remoteFile, string host, int port, string userName, string password)
        {
            FtpWebResponse response = null;

            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(new Uri(@"ftp://" + host + @"/" + remoteFile));
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

        public static async Task<List<string>> DoDownload(string connectionString, string localPath,
            string listName, List<Tuple<string, string, bool>> listFiles, string host, int port, string userName, string password)
        {
            FtpWebResponse response = null;
            StreamReader reader = null;
            List<string> fileNames = new List<string>();

            try
            { 
                var tasks = new List<Task>();

                foreach (var file in listFiles)
                {
                    try
                    {
                        string localFileName = $"{file.Item1}_{file.Item2}_{file.Item3.ToString()}.csv";
                        bool shouldDownload = await ShouldDownload(connectionString, file.Item1, listName,
                            DateTime.ParseExact(file.Item2, "yyyy-MM-dd", CultureInfo.InvariantCulture), file.Item3)
                            .ConfigureAwait(continueOnCapturedContext: false);
                        if (shouldDownload)
                        {
                            tasks.Add(DownloadFile(localPath, file.Item2, file.Item1, localFileName, host, userName, password));
                            fileNames.Add(localPath + "\\" + localFileName);
                        } 
                    }
                    catch (Exception ex)
                    {
                        await DataLayer.InsertErrorLog(connectionString, 1, "IndiaLiveFeedFtpImporter", "DoDownload", "Exception",
                            $@"DoDownload Failed to Obtain File: localpath={localPath}::listName={listName}::item1={file.Item1}::item2={file.Item2}::item3={file.Item3}::host={host}::port={port.ToString()}::userName={userName}::{ex.ToString()}")
                            .ConfigureAwait(continueOnCapturedContext: false);
                    }
                                     
                }

                await Task.WhenAll(tasks).ConfigureAwait(continueOnCapturedContext: false);
            }
            catch (Exception ex)
            {
                await DataLayer.InsertErrorLog(connectionString, 1, "IndiaLiveFeedFtpImporter", "DoDownload", "Exception",
                        $@"DoDownload: localpath={localPath}::listName={listName}::host={host}::port={port.ToString()}::userName={userName}::{ex.ToString()}")
                        .ConfigureAwait(continueOnCapturedContext: false);
            }
            finally
            {
                if (reader != null) reader.Close();
                if (response != null) response.Close();
            }            

            return fileNames;
        }

        static async Task<bool> ShouldDownload(string connectionString, string fileName, string fileList, DateTime fileDate, bool isErrorFile)
        {
            bool ret = false;
            bool alreadyDownloaded = await DataLayer.AlreadyDownloaded(connectionString, fileName, fileList, fileDate, isErrorFile);
            if (alreadyDownloaded)
            {
                await DataLayer.InsertErrorLog(connectionString, 1, "IndiaLiveFeedFtpImporter", "ShouldDownload", "Already downloaded",
                    $@"ShouldDownload: filename={fileName}::fileList={fileList}::fileDate={fileDate.ToString()}::isErrorFile={isErrorFile.ToString()}")
                    .ConfigureAwait(continueOnCapturedContext: false);
            }
            else
            {
                ret = true;
            } 
            return ret;
        } 

        public static async Task DownloadFile(string baseDir, string sourceDir, string sourceFile, string destinationFile, string host, string userName, string password)
        { 
            FileStream f = null;
            FtpWebResponse response = null;
            try
            {
                f = File.OpenWrite(baseDir + @"\" + destinationFile);
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}/{sourceDir}/{sourceFile}"));
                request.Method = WebRequestMethods.Ftp.DownloadFile; 
                request.Credentials = new NetworkCredential(userName, password);
                request.UseBinary = false;
                response = (FtpWebResponse) (await request.GetResponseAsync().ConfigureAwait(continueOnCapturedContext: false));
                Stream responseStream = response.GetResponseStream();
                await responseStream.CopyToAsync(f);                
            }
            finally
            {
                if (f != null) f.Close();
                if (response != null) response.Close();
            }
        }
        
        public static async Task<bool> ImportData(string connectionString, string baseDir, IndiaFeedData data)
        {
            bool success = true;
            DtsRuntime.Package p = null;

            try
            {
                string pkg = $@"{baseDir}\IndiaFeedImport.dtsx";
                DtsRuntime.Application app = new DtsRuntime.Application();
                p = app.LoadPackage(pkg, null);
                DtsRuntime.Executable ec = p.Executables[0];
                DtsRuntime.TaskHost thMainPipe = ec as DtsRuntime.TaskHost;
                MainPipe dataFlowTask = thMainPipe.InnerObject as MainPipe;
                p.Variables["User::ExternalObject"].Value = data;
                p.Execute();               
            }
            catch (Exception ex)
            {
                success = false;
                await DataLayer.InsertErrorLog(connectionString, 100, "IndiaLiveFeedFtpImporter", "ImportData", "Exception",
                             $"ImportData: {ex.ToString()}").ConfigureAwait(continueOnCapturedContext: false);
            }
            finally
            {
                if (p!= null) p.Dispose();
                p = null;
                GC.Collect(); // recommend to garbage collection
            }         

            return success;           
        }        
    }    
}
