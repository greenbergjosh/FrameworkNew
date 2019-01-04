using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Utility;
using Jw = Utility.JsonWrapper;

namespace SimpleImportExport
{
    class Program
    {
        public static FrameworkWrapper Fw;

        public static async Task Main(string[] args)
        {
            Fw = new FrameworkWrapper();
            var jobId = Guid.Parse(Fw.StartupConfiguration.GetS("Config/Jobs/" + args[1]));
            var sqlTimeoutSec = Fw.StartupConfiguration.GetS("Config/SqlTimeoutSec").ParseInt() ?? 5;
            var jobCfg = await Fw.Entities.GetEntityGe(jobId);

            if (jobCfg.GetS("Config/JobType") == "FtpImport")
            {
                string ftpHost = jobCfg.GetS("Config/FtpHost");
                string ftpUserName = jobCfg.GetS("Config/FtpUserName");
                string ftpPassword = jobCfg.GetS("Config/FtpPassword");
                string destDir = jobCfg.GetS("Config/DestinationDir");
                foreach (var ptn in jobCfg.GetL("Config/FilePatterns"))
                {
                    string filePattern = ptn.GetS("FilePattern");
                    string srcPath = ptn.GetS("SrcPath");
                    string destPath = ptn.GetS("DestPath");

                    var tasks = new List<Task>();
                    List<string> files = await Utility.ProtocolClient.FtpGetFiles(srcPath, ftpHost, ftpUserName, ftpPassword);
                    List<string> destFiles = new List<string>();
                    foreach (var file in files)
                    {
                        string shouldDownload = await SqlWrapper.SqlServerProviderEntry("SimpleImportExport",
                                   "ShouldDownload",
                                   Jw.Json(new { JobId = jobId, FileName = file }),
                                   "", sqlTimeoutSec);
                        if (shouldDownload == "1")
                        {
                            string destFile = destPath + "\\" + file;
                            destFiles.Add(destFile);
                            tasks.Add(Utility.ProtocolClient.DownloadFileFtp(srcPath, file, destFile,
                                ftpHost, ftpUserName, ftpPassword));
                        }
                    }
                    await Task.WhenAll(tasks);

                    foreach (var file in destFiles)
                    {
                        FileInfo fi = new FileInfo(file);
                        int lineCount = await Utility.UnixWrapper.LineCount(file);
                        await SqlWrapper.SqlServerProviderEntry("SimpleImportExport",
                                   "LogDownload",
                                   Jw.Json(new { JobId = jobId, FileName = file, FileSize = fi.Length, FileLineCount = lineCount }),
                                   "", sqlTimeoutSec);
                        new FileInfo(file).MoveTo(file + ".done");
                    }
                } 
            }
            else if (jobCfg.GetS("Config/JobType") == "FtpExport")
            {
                string ftpHost = jobCfg.GetS("Config/FtpHost");
                string ftpUserName = jobCfg.GetS("Config/FtpUserName");
                string ftpPassword = jobCfg.GetS("Config/FtpPassword");
                string srcDir = jobCfg.GetS("Config/SourceDir");                
                string destDir = jobCfg.GetS("Config/DestinationDir");
                List<string> patterns = new List<string>();
                foreach (var ptn in jobCfg.GetL("Config/SourcePatterns"))
                {
                    patterns.Add(ptn.GetS(""));
                }

                List<FileInfo> filesToUpload = new List<FileInfo>();
                DirectoryInfo di = new DirectoryInfo(srcDir);
                foreach (var file in di.GetFiles())
                {
                    foreach (var ptn in patterns)
                    {
                        if (Regex.Match(file.Name, ptn).Success)
                            filesToUpload.Add(file);
                    }
                }

                foreach (var file in filesToUpload)
                {
                    await ProtocolClient.UploadFile(file.FullName, file.Name, ftpHost, ftpUserName, ftpPassword);
                    await SqlWrapper.SqlServerProviderEntry("SimpleImportExport",
                                   "LogUpload",
                                   Jw.Json(new { JobId = jobId, FileName = file }),
                                   "", sqlTimeoutSec);
                    file.Delete();
                }
            }
        }
    }
}
