using GenericEntity;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Xml;
using Jw = Utility.JsonWrapper;
using Pw = Utility.ParallelWrapper;
using Rw = RoslynWrapper;
using Fs = Utility.FileSystem;
using Utility;
using System.Globalization;
using System.Net;
using System.Threading;
using System.Net.Http;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;

// servName = LEADME_DB, dbName=Unsub, ssisConStr="Data Source=localhost;Initial Catalog=Unsub;Provider=SQLNCLI11.1;Integrated Security=SSPI;Auto Translate=False;"
// jsonTemplateFile=SSISMd5Template.json, ssisTemplateFile=NewestPkg.xml
/*
 * {
"MadrivoUsername": "OnPointGlobal",
"MadrivoPassword": "Wynwood425", 
"MadrivoApiKey": "c93bdbccbe2dff7662f40486382dc5f9193805e41f9e610d82f338c67f9fcb58",
"MadrivoApiUrl": "http://api.midenity.com/pubapi.php",
"UnsubCentralUserName": "joshua_greenberg",
"UnsubCentralPassword": "P@ssword1"
 }
 */

namespace UnsubLib
{
    public class UnsubLib
    {
        // Set to true for debugging - always false in production
        public bool CallLocalLoadUnsubFiles;
        public bool UseLocalNetworkFile;
        public string LocalNetworkFilePath;

        public string ApplicationName;

        public string ConnectionString;
        public string ServerWorkingDirectory;
        public string ClientWorkingDirectory;
        public string SearchDirectory;
        public string ServerName;
        public string DatabaseName;
        public string SsisConnectionString;
        public string JsonTemplateFile;
        public string SsisTemplateFile;
        public string FileCacheFtpServer;
        public string FileCacheFtpUser;
        public string FileCacheFtpPassword;
        public long WorkingFileCacheSize;
        public long SearchFileCacheSize;
        public string UnsubServerUri;
        public string DtExecPath;
        public int MaxConnections;
        public int MaxParallelism;
        public string SeleniumChromeDriverPath;
        public string FileCacheFtpServerPath;

        public Rw.RoslynWrapper RosWrap;        

        public const string MD5HANDLER = "Md5Handler";
        public const string PLAINTEXTHANDLER = "PlainTextHandler";
        public const string DOMAINHANDLER = "DomainZipHandler";
        public const string UNKNOWNHANDLER = "UnknownTypeHandler";
                   
        public UnsubLib(string appName, string connectionString)
        {
            this.ApplicationName = appName;
            this.ConnectionString = connectionString;                     

            string general = SqlWrapper.SqlServerProviderEntry(this.ConnectionString, "SelectConfig", "", "")
                .GetAwaiter().GetResult();
            IGenericEntity gc = new GenericEntityJson();
            var gcstate = ((JArray)JsonConvert.DeserializeObject(general))[0];
            gc.InitializeEntity(null, null, gcstate);
            this.ServerWorkingDirectory = gc.GetS("Config/ServerWorkingDirectory");
            this.ClientWorkingDirectory = gc.GetS("Config/ClientWorkingDirectory");
            this.SearchDirectory = gc.GetS("Config/SearchDirectory");
            this.ServerName = gc.GetS("Config/ServerName");
            this.DatabaseName = gc.GetS("Config/DatabaseName");
            this.SsisConnectionString = gc.GetS("Config/SsisConnectionString");
            this.JsonTemplateFile = gc.GetS("Config/JsonTemplateFile");
            this.SsisTemplateFile = gc.GetS("Config/SsisTemplateFile");
            this.FileCacheFtpServer = gc.GetS("Config/FileCacheFtpServer");
            this.FileCacheFtpUser = gc.GetS("Config/FileCacheFtpUser");
            this.FileCacheFtpPassword = gc.GetS("Config/FileCacheFtpPassword");
            this.WorkingFileCacheSize = Int64.Parse(gc.GetS("Config/WorkingFileCacheSize"));
            this.SearchFileCacheSize = Int64.Parse(gc.GetS("Config/SearchFileCacheSize"));
            this.UnsubServerUri = gc.GetS("Config/UnsubServerUri");
            this.DtExecPath = gc.GetS("Config/DtExecPath");
            this.CallLocalLoadUnsubFiles = gc.GetB("Config/CallLocalLoadUnsubFiles");
            this.UseLocalNetworkFile = gc.GetB("Config/UseLocalNetworkFile");
            this.LocalNetworkFilePath = gc.GetS("Config/LocalNetworkFilePath");
            // for diffs and loads
            this.MaxParallelism = Int32.Parse(gc.GetS("Config/MaxParallelism"));
            // for downloads and uploads
            this.MaxConnections = Int32.Parse(gc.GetS("Config/MaxConnections"));
            this.SeleniumChromeDriverPath = gc.GetS("Config/SeleniumChromeDriverPath");
            this.FileCacheFtpServerPath = gc.GetS("Config/FileCacheFtpServerPath");

            ServicePointManager.DefaultConnectionLimit = this.MaxConnections;

            List<Rw.ScriptDescriptor> scripts = new List<Rw.ScriptDescriptor>();
            string scriptsPath = this.ServerWorkingDirectory + "\\Scripts";
            var rw = new Rw.RoslynWrapper(scripts, $@"{scriptsPath}\\debug");

            this.RosWrap = rw;
        }

        public async Task<IGenericEntity> GetNetworksAndCreateLockFiles()
        {
            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                $"GetNetworksAndCreateLockFiles", "Entry", "");

            string network = await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                    "SelectNetwork",
                    "{}",
                    "");

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                $"GetNetworksAndCreateLockFiles", "After SelectNetwork", network);

            IGenericEntity ge = new GenericEntityJson();
            var state = (JArray)JsonConvert.DeserializeObject(network);
            ge.InitializeEntity(this.RosWrap, null, state);
            List<string> fileNames = new List<string>();
            foreach (var n in ge.GetL(""))
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                    $"GetNetworksAndCreateLockFiles", "Creating lock file",
                    this.ClientWorkingDirectory + "\\Lock\\" + n.GetS("Id").ToLower() + ".lck");
                fileNames.Add(this.ClientWorkingDirectory + "\\Lock\\" + n.GetS("Id").ToLower() + ".lck");
            }

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                $"GetNetworksAndCreateLockFiles", "After parsing SelectNetwork return", "");

            await Fs.CreateEmptyFiles(fileNames);

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                $"GetNetworksAndCreateLockFiles", "After creating empty files", "");

            return ge;
        }

        public async Task CreateNetworkLockFile(IGenericEntity network)
        {
            string lckFileName = this.ClientWorkingDirectory + "\\Lock\\" + network.GetS("Id").ToLower() + ".lck";
            if (!File.Exists(lckFileName))
                await Fs.CreateEmptyFiles(new List<string>() { lckFileName });
        }

        public async Task ManualDirectory(IGenericEntity network)
        {
            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                $"ManualDirectory", "Before locking files", this.ClientWorkingDirectory + "\\Lock\\" + network.GetS("Id").ToLower() + ".lck");

            CancellationTokenSource cts = new CancellationTokenSource();
            FileStream lckFile = await Fs.WaitForFile(this.ClientWorkingDirectory + "\\Lock\\" + network.GetS("Id").ToLower() + ".lck", 1000, cts.Token);

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                $"ManualDirectory", "After locking files", "");

            try
            {
                string networkName = network.GetS("Name");
                // Handle multiple days by doing them one at a time
                DateTime now = DateTime.Now;
                string nowString = now.ToString("yyyyMMdd");

                List<DirectoryInfo> dirs = new List<DirectoryInfo>();
                DirectoryInfo di = new DirectoryInfo(this.ClientWorkingDirectory + "\\Manual");
                foreach (var dd in di.EnumerateDirectories())
                {
                    if (DateTime.ParseExact(dd.Name, "yyyyMMdd", new CultureInfo("en-US")) <=
                        DateTime.ParseExact(nowString, "yyyyMMdd", new CultureInfo("en-US")))
                    {
                        var dir = new DirectoryInfo(dd.FullName + "\\" + network.GetS("Id").ToLower());
                        if (dir.Exists) dirs.Add(dd);
                    }
                }
                dirs.Sort((dir1, dir2) =>
                    DateTime.ParseExact(dir1.Name, "yyyyMMdd", new CultureInfo("en-US"))
                    .CompareTo(DateTime.ParseExact(dir2.Name, "yyyyMMdd", new CultureInfo("en-US"))));

                foreach (var dir in dirs)
                {
                    await ManualJob(dir, network);
                }
            }
            finally
            {
                lckFile.Close();
            }
        }

        public async Task<string> ForceUnsub(IGenericEntity dtve)
        {
            string forceName = dtve.GetS("ForceName");
            string network = await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                    "SelectNetwork",
                    "{}",
                    "");
            IGenericEntity ge = new GenericEntityJson();
            var state = (JArray)JsonConvert.DeserializeObject(network);
            ge.InitializeEntity(this.RosWrap, null, state);
            List<string> fileNames = new List<string>();
            foreach (var n in ge.GetL(""))
            {
                await ForceDirectory(forceName, n);
            }

            return Jw.Json(new { Result = "Success" });
        }

        public async Task ForceDirectory(string forceDirName, IGenericEntity network)
        {
            CancellationTokenSource cts = new CancellationTokenSource();
            FileStream lckFile = await Fs.WaitForFile(this.ClientWorkingDirectory + "\\" + network.GetS("Id").ToLower() + ".lck", 1000, cts.Token);

            try
            {
                DirectoryInfo dir = new DirectoryInfo(this.ClientWorkingDirectory + "\\Force\\" + forceDirName);
                await ManualJob(dir, network);
            }
            finally
            {
                lckFile.Close();
            }
        }

        public async Task ManualJob(DirectoryInfo dir, IGenericEntity network)
        {
            DirectoryInfo cd = new DirectoryInfo(dir.FullName + "\\" + network.GetS("Id").ToLower());
            IDictionary<string, string> idtof = new Dictionary<string, string>();
            StringBuilder campaignsJson = new StringBuilder("[");
            foreach (var dd in cd.EnumerateDirectories())
            {
                // Each folder corresponds to a campaign to be processed
                string networkCampaignId = dd.Name;
                string campaignJson = await File.ReadAllTextAsync(dd.FullName + "\\" + "json.txt");
                IGenericEntity ge = new GenericEntityJson();
                var state = JsonConvert.DeserializeObject(campaignJson);
                ge.InitializeEntity(null, null, state);
                string networkCampaignName = ge.GetS("NetworkName");
                campaignsJson.Append(Jw.Json(new
                {
                    NetworkCampaignId = networkCampaignId,
                    NetworkCampaignName = networkCampaignName,
                    CampaignPayload = campaignJson
                }, new bool[] { true, true, false }));
                campaignsJson.Append(",");
                idtof.Add(networkCampaignId, dd.FullName + "\\" + "unsub.zip");
            }
            if (campaignsJson.Length > 1) campaignsJson.Remove(campaignsJson.Length - 1, 1);
            campaignsJson.Append("]");

            if (campaignsJson.Length < 2) campaignsJson = new StringBuilder("[]");
            string cmps = await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                    "MergeNetworkCampaignsManual",
                    Jw.Json(new { NetworkId = network.GetS("Id").ToLower() }),
                    campaignsJson.ToString());
            IGenericEntity cse = new GenericEntityJson();
            var cstate = JsonConvert.DeserializeObject(cmps);
            cse.InitializeEntity(null, null, cstate);

            IDictionary<string, List<IGenericEntity>> uris =
               new Dictionary<string, List<IGenericEntity>>();
            foreach (var cmp in cse.GetL(""))
            {
                string ncid = cmp.GetS("NetworkCampaignId");
                if (idtof.ContainsKey(ncid))
                {
                    string fname = idtof[ncid];
                    uris.Add(fname, new List<IGenericEntity>() { cmp });
                }
            }

            await ProcessUnsubFiles(uris, network, cse);

            //di.Delete(true);
        }

        public async Task ScheduledUnsubJob(IGenericEntity network)
        {
            CancellationTokenSource cts = new CancellationTokenSource();
            FileStream lckFile = await Fs.WaitForFile(this.ClientWorkingDirectory + "\\Lock\\" + network.GetS("Id").ToLower() + ".lck", 1000, cts.Token);
            
            try
            {
                // Get campaigns
                string networkName = network.GetS("Name");
                IGenericEntity cse = await GetCampaignsScheduledJobs(network);

                // Get uris of files to download - maintain campaign association
                IDictionary<string, List<IGenericEntity>> uris = new Dictionary<string, List<IGenericEntity>>();
                try
                {
                    uris = await GetUnsubUris(network, cse);
                }
                catch (Exception exGetUnsubUris)
                {
                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                        $"ScheduledUnsubJob::{networkName}", "GetUnsubUris", exGetUnsubUris.ToString());
                }

                await ProcessUnsubFiles(uris, network, cse);
            }
            finally
            {
                lckFile.Close();
            }
        }

        public async Task ProcessUnsubFiles(IDictionary<string, List<IGenericEntity>> uris, 
            IGenericEntity network, IGenericEntity cse)
        {
            string networkName = network.GetS("Name");

            // Download unsub files
            var unsubFiles = await DownloadUnsubFiles(uris, network);

            // Update campaigns with new unsub files
            try
            {
                await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                    "UpdateNetworkCampaignsUnsubFiles",
                    "",
                    Jw.Json("Id", "FId", unsubFiles.Item1));
            }
            catch (Exception exUpdateCampaigns)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                    $"ScheduledUnsubJob::{networkName}", "UpdateNetworkCampaignsUnsubFiles", exUpdateCampaigns.ToString());
            }

            // Generate diff list
            HashSet<Tuple<string, string>> diffs = new HashSet<Tuple<string, string>>();
            foreach (var c in cse.GetL(""))
            {
                if (unsubFiles.Item1.ContainsKey(c.GetS("Id")))
                {
                    if (!string.IsNullOrEmpty(c.GetS("MostRecentUnsubFileId")))
                    {
                        if (c.GetS("MostRecentUnsubFileId").Length == 36)
                            diffs.Add(new Tuple<string, string>(c.GetS("MostRecentUnsubFileId").ToLower(), unsubFiles.Item1[c.GetS("Id")].ToLower()));
                    }
                }
            }

            // Signal server to load domain unsub files, diff md5 unsub files
            try
            {
                await SignalUnsubServerService(diffs, unsubFiles.Item2);
            }
            catch (Exception exSignal)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                    $"ScheduledUnsubJob::{networkName}", "SignalUnsubServerService", exSignal.ToString());
            }

            // Clean unused files that have not been touched in a day and are unreferenced
            try
            {
                await CleanUnusedFiles();
            }
            catch (Exception exClean)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                    $"ScheduledUnsubJob::{networkName}", "CleanUnusedFiles", exClean.ToString());
            }
        }

        public async Task<IGenericEntity> GetCampaignsScheduledJobs(IGenericEntity network)
        {
            string networkName = network.GetS("Name");
            IGenericEntity cse = new GenericEntityJson();
            try
            {
                string campaigns = await GetNetworkCampaigns(
                    network.GetS("Id"),
                    network.GetS($"Credentials/{networkName}ApiKey"),
                    network.GetS($"Credentials/{networkName}ApiUrl"));
                var cs = (JArray)JsonConvert.DeserializeObject(campaigns);
                cse.InitializeEntity(null, null, cs);
            }
            catch (Exception exCampaigns)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                    $"ScheduledUnsubJob::{networkName}", "GetCampaigns", exCampaigns.ToString());
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                    $"ScheduledUnsubJob::{networkName}", "GetCampaignsEx", network.GetS("Id") + "::" +
                        network.GetS($"Credentials/{networkName}ApiKey") + "::" +
                        network.GetS($"Credentials/{networkName}ApiUrl"));
                throw new Exception($"Failed to get {networkName} campaigns");
            }
            return cse;
        }

        public async Task<IDictionary<string, List<IGenericEntity>>> GetUnsubUris(IGenericEntity network, IGenericEntity campaigns)
        {
            string networkName = network.GetS("Name");
            int parallelism = Int32.Parse(network.GetS("Credentials/Parallelism"));
            ConcurrentDictionary<string, List<IGenericEntity>> uris = new ConcurrentDictionary<string, List<IGenericEntity>>();
            await Pw.ForEachAsync(campaigns.GetL(""), parallelism, async c =>
            {
                try
                {
                    string uri = await GetSuppressionFileUri(
                        network,
                        c.GetS("NetworkCampaignId"),
                        parallelism);

                    if (!String.IsNullOrEmpty(uri))
                    {
                        if (uris.ContainsKey(uri)) uris[uri].Add(c);
                        else uris.TryAdd(uri, new List<IGenericEntity>() { c });
                    }
                }
                catch (Exception exCampaign)
                {
                    string campaignId = "Failed to retrieve unsubscribe Id.";
                    try { campaignId = c.GetS("NetworkCampaignId"); }
                    catch (Exception exGetC) { }

                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                        $"ScheduledUnsubJob::{networkName}", "GetSuppressionFileUri", campaignId + "::" + exCampaign.ToString());
                }
            });

            return uris;
        }

        public async Task<Tuple<ConcurrentDictionary<string, string>, ConcurrentDictionary<string, string>>> 
        DownloadUnsubFiles(IDictionary<string, List<IGenericEntity>> uris,
            IGenericEntity network)
        {
            string networkName = network.GetS("Name");
            string networkUnsubMethod = network.GetS("Credentials/UnsubMethod");
            int parallelism = Int32.Parse(network.GetS("Credentials/Parallelism"));

            var ncf = new ConcurrentDictionary<string, string>();
            var ndf = new ConcurrentDictionary<string, string>();

            await Pw.ForEachAsync(uris, parallelism, async uri =>
            {
                try
                {
                    IDictionary<string, object> cf = new Dictionary<string, object>();
                    if (networkUnsubMethod == "ScheduledUnsubJob")
                    {
                        cf = await DownloadSuppressionFiles(
                                network,
                                uri.Key);
                    }
                    else if (networkUnsubMethod == "ManualDirectory")
                    {
                        FileInfo fis = new FileInfo(uri.Key);
                        cf = await Utility.ProtocolClient.UnzipUnbuffered(uri.Key,
                                ZipTester,
                                new Dictionary<string, Func<FileInfo, Task<object>>>()
                                {
                                    { MD5HANDLER, Md5ZipHandler },
                                    { PLAINTEXTHANDLER, PlainTextHandler },
                                    { DOMAINHANDLER, DomainZipHandler },
                                    { UNKNOWNHANDLER, UnknownTypeHandler }
                                },
                                fis.DirectoryName,
                                this.ClientWorkingDirectory);
                    }                     

                    if (cf.ContainsKey(MD5HANDLER))
                    {
                        string fmd5 = cf[MD5HANDLER].ToString().ToLower();

                        await Utility.UnixWrapper.RemoveNonAsciiFromFile(this.ClientWorkingDirectory,
                            fmd5 + ".txt", fmd5 + ".txt.cln");

                        await Utility.UnixWrapper.RemoveNonMD5LinesFromFile(this.ClientWorkingDirectory,
                            fmd5 + ".txt.cln", fmd5 + ".txt.cl2");

                        await Utility.UnixWrapper.SortFile(
                            this.ClientWorkingDirectory,
                            fmd5 + ".txt.cl2",
                            fmd5 + ".txt.srt",
                            false,
                            true);

                        if (this.FileCacheFtpServer != null)
                        {
                            await Utility.ProtocolClient.UploadFile(
                                this.ClientWorkingDirectory + "\\" + fmd5 + ".txt.srt",
                                this.FileCacheFtpServerPath + "/" + fmd5 + ".txt.srt",
                                this.FileCacheFtpServer,
                                this.FileCacheFtpUser,
                                this.FileCacheFtpPassword);

                            Fs.TryDeleteFile($"{this.ClientWorkingDirectory}\\{fmd5 + ".txt.srt"}");
                        }

                        Fs.TryDeleteFile($"{this.ClientWorkingDirectory}\\{fmd5}.txt");
                        Fs.TryDeleteFile($"{this.ClientWorkingDirectory}\\{fmd5}.txt.cln");
                        Fs.TryDeleteFile($"{this.ClientWorkingDirectory}\\{fmd5}.txt.cl2");
                    }

                    if (cf.ContainsKey(DOMAINHANDLER))
                    {
                        string fdom = cf[DOMAINHANDLER].ToString().ToLower();

                        if (this.FileCacheFtpServer != null)
                        {
                            await Utility.ProtocolClient.UploadFile(
                                    this.ClientWorkingDirectory + "\\" + fdom + ".txt",
                                    this.FileCacheFtpServerPath + "/" + fdom + ".txt",
                                    this.FileCacheFtpServer,
                                    this.FileCacheFtpUser,
                                    this.FileCacheFtpPassword);

                            Fs.TryDeleteFile($"{this.ClientWorkingDirectory}\\{fdom}.txt");
                        }
                    }

                    foreach (var c in uri.Value)
                    {
                        if (cf.ContainsKey(MD5HANDLER))
                        {
                            string fmd5 = cf[MD5HANDLER].ToString();
                            if (!ncf.TryAdd(c.GetS("Id"), fmd5.ToLower()))
                            {
                                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                                    $"ScheduledUnsubJob::{networkName}", "DownloadSuppressionFiles", "ncf.TryAdd Failed::" + uri.Key + "::" + c.GetS("Id") + "::" + fmd5.ToLower());
                            }
                        }

                        if (cf.ContainsKey(DOMAINHANDLER))
                        {
                            string fdom = cf[DOMAINHANDLER].ToString();
                            if (!ndf.TryAdd(c.GetS("Id"), fdom.ToLower()))
                            {
                                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                                    $"ScheduledUnsubJob::{networkName}", "DownloadSuppressionFiles", "ndf.TryAdd Failed::" + uri.Key + "::" + c.GetS("Id") + "::" + fdom.ToLower());
                            }
                        }
                    }
                }
                catch (Exception exFile)
                {
                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                        $"ScheduledUnsubJob::{networkName}", "DownloadSuppressionFiles", uri.Key + "::" + exFile.ToString());
                }
            });

            return new Tuple<ConcurrentDictionary<string, string>, ConcurrentDictionary<string, string>>(ncf, ndf);
        }

        public async Task SignalUnsubServerService(HashSet<Tuple<string, string>> diffs, 
            IDictionary<string, string> ndf)
        {
            StringBuilder sbDiff = new StringBuilder("");
            if (diffs.Count > 0)
            {
                sbDiff.Append("[");
                foreach (var t in diffs)
                    sbDiff.Append(Jw.Json(new { oldf = t.Item1.ToLower(), newf = t.Item2.ToLower() }) + ",");
                sbDiff.Remove(sbDiff.Length - 1, 1).Append("]");
            }
            else
            {
                sbDiff.Append("[]");
            }
            
            string msg = Jw.Json(new { m = "LoadUnsubFiles", DomUnsub = Jw.Json("CId", "FId", ndf), Diff = sbDiff.ToString() },
                new bool[] { true, false, false });

            string result = null;
            if (!this.CallLocalLoadUnsubFiles)
            {
                result = await Utility.ProtocolClient.HttpPostAsync(this.UnsubServerUri,
                    new Dictionary<string, string>() { { "", msg } }, 60 * 60, "application/json");
            }
            else
            {
                IGenericEntity cse = new GenericEntityJson();
                var cs = JsonConvert.DeserializeObject(msg);
                cse.InitializeEntity(null, null, cs);
                result = await LoadUnsubFiles(cse);
            }

            if (result == null) throw new Exception("Null result");

            var res = (JObject)JsonConvert.DeserializeObject(result);
            IGenericEntity rese = new GenericEntityJson();
            rese.InitializeEntity(null, null, res);
            if (rese.GetS("Result") != "Success") throw new Exception(result);
        }

        public async Task CleanUnusedFiles()
        {
            string clc = await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                "SelectNetworkCampaigns", "{}", "");
            IGenericEntity ge = new GenericEntityJson();
            var state = (JArray)JsonConvert.DeserializeObject(clc);
            ge.InitializeEntity(this.RosWrap, null, state);
            HashSet<string> refdFiles = new HashSet<string>();
            foreach (var c in ge.GetL(""))
            {
                try
                {
                    if (c.GetS("MostRecentUnsubFileId") != null)
                        refdFiles.Add(c.GetS("MostRecentUnsubFileId").ToLower());
                }
                catch (Exception ex) { }
            }
                                         
            if (this.FileCacheFtpServer != null)
            {
                List<string> listFiles;
                listFiles = await Utility.ProtocolClient.FtpGetFiles(
                        this.FileCacheFtpServerPath,
                        this.FileCacheFtpServer,
                        this.FileCacheFtpUser,
                        this.FileCacheFtpPassword);

                foreach (var ftpFile in listFiles)
                {
                    string[] ftpFileParts = ftpFile.Split(new char[] { '.' });
                    if (!refdFiles.Contains(ftpFileParts[0].ToLower()))
                        await Utility.ProtocolClient.DeleteFileFromFtpServer(
                        this.FileCacheFtpServerPath + "/" + ftpFile.ToLower(),
                        this.FileCacheFtpServer,
                        21,
                        this.FileCacheFtpUser,
                        this.FileCacheFtpPassword);
                }
            }
            else
            {
                DirectoryInfo sourceDir = new DirectoryInfo(this.ClientWorkingDirectory);
                FileInfo[] files = sourceDir.GetFiles("*.srt", SearchOption.TopDirectoryOnly);
                foreach (var file in files)
                {
                    string[] fileParts = file.Name.Split(new char[] { '.' });
                    if ((DateTime.UtcNow.Subtract(file.LastAccessTimeUtc).TotalDays > 1)
                        && (!refdFiles.Contains(fileParts[0].ToLower())))
                            Fs.TryDeleteFile(file); 
                }
            }
        }

        public async Task<IGenericEntity> GetNetworkConfiguration(string conString, string networkName)
        {
            string network = await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                    "SelectNetwork",
                    Jw.Json(new { NetworkName=networkName }),
                    "");
            IGenericEntity ge = new GenericEntityJson();
            var state = (JArray)JsonConvert.DeserializeObject(network);
            var s = state[0];
            ge.InitializeEntity(this.RosWrap, null, s);
            return ge;
        }

        public async Task<string> LoadUnsubFiles(IGenericEntity dtve)
        {
            string result = Jw.Json(new { Result = "Success" });

            List<string> allFiles = await Utility.ProtocolClient.FtpGetFiles("Unsub", this.FileCacheFtpServer, this.FileCacheFtpUser, this.FileCacheFtpPassword);
            StringBuilder sbAllFiles = new StringBuilder();
            foreach (string fl in allFiles)
            {
                sbAllFiles.Append(fl + ":");
            }
            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                $"LoadUnsubFiles", "List of All FTP files", sbAllFiles.ToString());

            try
            {
                //foreach (var x in dtve.GetL("DomUnsub"))
                await Pw.ForEachAsync(dtve.GetL("DomUnsub"), this.MaxParallelism, async x =>
                {
                    string tmpFileName = "";
                    string campaignId = "";
                    string fileId = "";

                    try
                    {
                        campaignId = x.GetS("CId");
                        fileId = x.GetS("FId").ToLower();

                        tmpFileName = await GetFileFromFileId(fileId, ".txt", this.ServerWorkingDirectory,
                            this.WorkingFileCacheSize, Guid.NewGuid().ToString().ToLower() + ".tmd");

                        string wd = this.ServerWorkingDirectory.Replace("\\", "\\\\");
                        await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                            "UploadDomainUnsubFile",
                            Jw.Json(new { CId = campaignId, Ws = wd, FId = fileId, Fn = tmpFileName }),
                            "");
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 10, this.ApplicationName,
                            $"LoadUnsubFiles", "UploadedDomainUnsubFile", campaignId + "::" + wd +
                            "::" + fileId + "::" + tmpFileName);

                        Fs.TryDeleteFile(this.ServerWorkingDirectory + "\\" + tmpFileName);
                    }
                    catch (Exception exDomUnsub)
                    {
                        Fs.TryDeleteFile(this.ServerWorkingDirectory + "\\" + tmpFileName);
                        
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                            $"LoadUnsubFiles", "UploadDomainUnsubFile", campaignId + 
                            "::" + fileId + "::" + exDomUnsub.ToString());
                    }
                });

                List<string> domFiles = new List<string>();
                foreach (var cfp in dtve.GetL("DomUnsub"))
                {
                    string fid = cfp.GetS("FId").ToLower();
                    if (!domFiles.Contains(fid)) domFiles.Add(fid);
                }
                foreach (var domFile in domFiles)
                {
                    Fs.TryDeleteFile(this.ServerWorkingDirectory + "\\" + domFile + ".txt");

                    if (!string.IsNullOrEmpty(this.FileCacheFtpServer))
                    {
                        await Utility.ProtocolClient.DeleteFileFromFtpServer(
                            this.FileCacheFtpServerPath + "/" + domFile + ".txt",
                            this.FileCacheFtpServer,
                            21,
                            this.FileCacheFtpUser,
                            this.FileCacheFtpPassword);
                    }
                }

                //foreach (var x in dtve.GetL("Diff"))
                await Pw.ForEachAsync(dtve.GetL("Diff"), this.MaxParallelism, async x =>
                {
                    string oldf = x.GetS("oldf").ToLower();
                    string newf = x.GetS("newf").ToLower();
                    string oldfname = "";
                    string newfname = "";
                    string diffname = Guid.NewGuid().ToString().ToLower() + ".dif";

                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 10, this.ApplicationName,
                            $"Before Diffing", "DiffFiles", oldf + "::" + newf);

                    try
                    {
                        oldfname = await GetFileFromFileId(oldf, ".txt.srt", this.ServerWorkingDirectory, 
                            this.WorkingFileCacheSize, Guid.NewGuid().ToString().ToLower() + ".tdd");
                        newfname = await GetFileFromFileId(newf, ".txt.srt", this.ServerWorkingDirectory, 
                            this.WorkingFileCacheSize, Guid.NewGuid().ToString().ToLower() + ".tdd");

                        bool res = await Utility.UnixWrapper.DiffFiles(
                            oldfname,
                            newfname,
                            this.ServerWorkingDirectory,
                            diffname);
                        
                        await SSISLoadMd5File(diffname,
                            this.ServerName,
                            this.DatabaseName,
                            this.SsisConnectionString,
                            this.JsonTemplateFile,
                            this.SsisTemplateFile,
                            "PostProcessDiffFile");

                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 10, this.ApplicationName,
                            $"LoadUnsubFiles", "DiffedFiles", oldfname + "::" + newfname + "::" + diffname);
                    }
                    catch (Exception exDiff)
                    {
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                            $"LoadUnsubFiles", "DiffFiles", oldfname + "::" + newfname + "::" + exDiff.ToString());
                    }
                    finally
                    {
                        Fs.TryDeleteFile(this.ServerWorkingDirectory + "\\" + diffname);
                        Fs.TryDeleteFile(this.ServerWorkingDirectory + "\\" + newfname);
                        Fs.TryDeleteFile(this.ServerWorkingDirectory + "\\" + oldfname);
                    }
                });
            }
            catch (Exception ex)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                        "LoadUnsubFiles", "Exception", ex.ToString());
                result = Jw.Json(new { Error = "Exception" });
            }

            return result;
        }

        public async Task<string> GetCampaigns()
        {
            string result = "";
            try
            {
                result = await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                    "SelectNetworkCampaignsWithPayload",
                    "",
                    "");
            }
            catch (Exception ex)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                        "GetCampaigns", "Exception", ex.ToString());
                result = Jw.Json(new { Error = "Exception" });
            }

            return result;
        }

        public async Task<bool> MakeRoom(string fileName, long cacheSize)
        {
            try
            {
                long newFileSize = await Utility.ProtocolClient.FtpGetFileSize(
                        this.FileCacheFtpServerPath + "/" + fileName,
                        this.FileCacheFtpServer,
                        this.FileCacheFtpUser,
                        this.FileCacheFtpPassword);

                if (newFileSize > cacheSize)
                {
                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                        "MakeRoom", "File larger than cache", fileName);
                    return false;
                }

                DirectoryInfo sourceDir = new DirectoryInfo(this.ServerWorkingDirectory);
                FileInfo[] files = sourceDir.GetFiles("*", SearchOption.TopDirectoryOnly);
                long dirSize = 0;
                foreach (var file in files) dirSize += file.Length;

                if (newFileSize < cacheSize - dirSize)
                {
                    return true;
                }

                Array.Sort(files, (f1, f2) => f1.LastAccessTimeUtc.CompareTo(f2.LastAccessTimeUtc));
                foreach (var file in files)
                {
                    if (Fs.TryDeleteFile(file))
                    {
                        newFileSize = newFileSize - file.Length;
                        if (newFileSize <= 0) break;
                    }
                }
            }
            catch (Exception makeRoomException)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                        "MakeRoom", "Exception", fileName + "::" + makeRoomException.ToString());
                return false;
            }

            return true;            
        }

        public async Task<string> GetFileFromFileId(string fileId, string ext, string destDir, long cacheSize, string destFileName=null)
        {
            bool success = false;
            string fileName = fileId + ext;
            string dfileName = destFileName == null ? fileName : destFileName;

            if (this.FileCacheFtpServer != null)
            {
                DirectoryInfo di = new DirectoryInfo(destDir);
                FileInfo[] fi = di.GetFiles(fileName);
                if (fi.Length == 1) return fileName;
                else if (fi.Length == 0)
                {
                    success = await MakeRoom(fileName, cacheSize);
                    if (!success)
                        throw new Exception("Could not make room for file.");

                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                            $"GetFileFromFileId", "", destDir + "::" + this.FileCacheFtpServerPath + "/" + fileName + "::" + dfileName);

                    await Utility.ProtocolClient.DownloadFileFtp(
                        destDir,
                        this.FileCacheFtpServerPath + "/" + fileName,
                        dfileName,
                        this.FileCacheFtpServer,
                        this.FileCacheFtpUser,
                        this.FileCacheFtpPassword
                        );

                    fi = di.GetFiles(dfileName);
                    if (fi.Length == 1) return dfileName;
                    else throw new Exception("Could not find file on ftp: " + fileName);
                }
                else throw new Exception("Too many file matches: " + fileName);
            }
            else
            {
                DirectoryInfo di = new DirectoryInfo(destDir);
                FileInfo[] fi = di.GetFiles(fileName);
                fi = di.GetFiles(fileName);
                if (fi.Length == 1)
                {
                    if (destFileName == null)
                        return fileName;
                    else
                    {
                        fi[0].CopyTo(destFileName);
                        return destFileName;
                    }
                }
                else throw new Exception("Could not find file locally: " + fileName);
            }
        }

        public async Task<string> GetFileFromCampaignId(string campaignId, string ext, string destDir, long cacheSize)
        {
            string c = await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                    "SelectNetworkCampaign",
                    Jw.Json(new { CId = campaignId }),
                    "");
            IGenericEntity ge = new GenericEntityJson();
            var state = JsonConvert.DeserializeObject(c);
            ge.InitializeEntity(this.RosWrap, null, state);

            string fileId = ge.GetS("MostRecentUnsubFileId").ToLower();

            return await GetFileFromFileId(fileId, ext, destDir, cacheSize);
        }

        public async Task<string> ServerIsUnsub(string proxyRequest)
        {
            return await Utility.ProtocolClient.HttpPostAsync(this.UnsubServerUri,
                new Dictionary<string, string>() { { "", proxyRequest } }, 5*60, "application/json");
        }

        public async Task<string> IsUnsub(IGenericEntity dtve)
        {
            string campaignId = "";
            string emailMd5 = "";
            try
            {
                campaignId = dtve.GetS("CampaignId");
                emailMd5 = dtve.GetS("EmailMd5");
                if (emailMd5.Contains("@"))
                {
                    emailMd5 = Utility.Hashing.CalculateMD5Hash(emailMd5.ToLower());
                }
                string fileName = await GetFileFromCampaignId(campaignId, ".txt.srt", this.SearchDirectory, this.SearchFileCacheSize);

                bool result =  await Utility.UnixWrapper.BinarySearchSortedMd5File(
                    this.ServerWorkingDirectory,
                    fileName,
                    emailMd5);

                return Jw.Json(new { Result = result });
            }
            catch (Exception ex)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                           "IsUnsub", "Search failed.", 
                           campaignId + "::" + emailMd5 + "::" + ex.ToString());
                throw new Exception("Search failed.");
            }            
        }

        public async Task<string> ServerForceUnsub(string proxyRequest)
        {
            return await Utility.ProtocolClient.HttpPostAsync(this.UnsubServerUri,
                new Dictionary<string, string>() { { "", proxyRequest } }, 10 * 60, "application/json");
        }

        public async Task<string> ServerIsUnsubList(string proxyRequest)
        {
            return await Utility.ProtocolClient.HttpPostAsync(this.UnsubServerUri,
                new Dictionary<string, string>() { { "", proxyRequest } }, 10*60, "application/json");
        }

        public async Task<string> IsUnsubList(IGenericEntity dtve)
        {
            string campaignId = "";
            List<string> emailMd5 = new List<string>();
            List<string> notFound = new List<string>();

            try
            {
                campaignId = dtve.GetS("CampaignId");
                foreach (var y in dtve.GetL("EmailMd5"))
                {
                    string emailFixed = y.GetS("");
                    if (emailFixed.Contains("@"))
                    {
                        emailFixed = Utility.Hashing.CalculateMD5Hash(emailFixed.ToLower());
                    }
                    emailMd5.Add(emailFixed);
                }
                

                string fileName = await GetFileFromCampaignId(campaignId, ".txt.srt", this.SearchDirectory, this.SearchFileCacheSize);
                emailMd5.Sort();

                var enrtr = emailMd5.GetEnumerator();
                enrtr.MoveNext();

                const Int32 BufferSize = 128;
                using (var fileStream = File.OpenRead(fileName))
                using (var streamReader = new StreamReader(fileStream, Encoding.UTF8, true, BufferSize))
                {
                    String line;
                    while ((line = streamReader.ReadLine()) != null)
                    {
                        if (enrtr.Current == null) break;
                        while (true)
                        {
                            int cmp = enrtr.Current.ToUpper().CompareTo(line.ToUpper());
                            if (cmp == 0) { enrtr.MoveNext(); break; }
                            else if (cmp < 0) { notFound.Add(enrtr.Current); enrtr.MoveNext(); }
                            else break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                           "IsUnsubList", "Search failed.",
                           campaignId + "::" + ex.ToString());
                throw new Exception("Search failed.");
            }

            return Jw.Json("NotUnsub", notFound);
        }
        
        public async Task SSISLoadMd5File(string fileName, string servName, string dbName, 
            string ssisConStr, string jsonTemplateFile, string ssisTemplateFile, string postProcessSproc)
        {
            string[] fileNameParts = fileName.Split('.');
            string fileId = fileNameParts[0];

            string jsonText = File.ReadAllText($"{jsonTemplateFile}");
            jsonText = jsonText.Replace("[=FlatFileLocation=]", $"{this.ServerWorkingDirectory.Replace("\\", "\\\\")}\\\\{fileName}")
                .Replace("[=ServerName=]", servName)
                .Replace("[=DatabaseName=]", dbName)
                .Replace("[=ConnectionString=]", ssisConStr)
                .Replace("[=ErrorTable=]", $"[dbo].[err_{fileId}]")
                .Replace("[=DestinationTable=]", $"[dbo].[stg_{fileId}]");
            File.WriteAllText($"{this.ServerWorkingDirectory}\\{fileName}.json", jsonText);

            string pkgText = await SsisWrapper.SsisWrapper.TokenReplaceSSISPackage(
                $"{ssisTemplateFile}",
                $"{this.ServerWorkingDirectory}\\{fileName}.json",
                new Dictionary<string, string>()
                        {
                            { "FlatFileColumn", "Columns" },
                            { "OutputColumn", "Columns" },
                            { "ExternalMetadataColumn", "Columns" },
                            { "InputColumn", "Columns" },
                            { "ExternalMetadataColumnOleDestInput", "Columns" }
                        },
                this.RosWrap);

            File.WriteAllText($"{this.ServerWorkingDirectory}\\{fileName}.xml", pkgText);

            try
            {
                await SqlWrapper.CreateSsisTables(this.ConnectionString, fileId);
                await SsisWrapper.SsisWrapper.ExecutePackage(
                    this.DtExecPath,
                    $"{this.ServerWorkingDirectory}\\{fileName}.xml", 
                    ssisConStr,
                    null);
            }
            catch (Exception exSsisLoad)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                           "SSISLoadMd5File", "Package failed.",
                           fileName + "::" + exSsisLoad.ToString());
            }

            try
            {
                await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                    postProcessSproc,
                    Jw.Json(new { Stg = $"[dbo].[stg_{fileId}]", Err = $"[dbo].[err_{fileId}]" }),
                    "");
            }
            catch (Exception exPostProcess)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                           "SSISLoadMd5File", "Package PostProcess failed.",
                           fileName + "::" + exPostProcess.ToString());
            }

            //Fs.TryDeleteFile($"{this.ServerWorkingDirectory}\\{fileName}.json");
            Fs.TryDeleteFile($"{this.ServerWorkingDirectory}\\{fileName}.xml");
        }

        public async Task<string> GetNetworkCampaigns(
            string networkId, string apiKey, string apiUrl)
        {
            IDictionary<string, string> parms = new Dictionary<string, string>()
            {
                { "apikey", apiKey },
                { "apiFunc", "getcampaigns" }
            };

            string campaignXml = null;

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                           "GetNetworkCampaigns", "UseLocalNetworkFiles",
                           this.UseLocalNetworkFile.ToString());

            if (!this.UseLocalNetworkFile)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                           "GetNetworkCampaigns", "Reading Remote Network File",
                           "");
                campaignXml = await Utility.ProtocolClient.HttpPostAsync(apiUrl, parms);
                File.WriteAllText(this.LocalNetworkFilePath + "\\" + networkId + ".xml", campaignXml);
            }
            else
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                           "GetNetworkCampaigns", "Reading Local Network File",
                           $@"{this.LocalNetworkFilePath}\{networkId}.xml");
                campaignXml = File.ReadAllText($@"{this.LocalNetworkFilePath}\{networkId}.xml");
            }                
                
            return await SqlWrapper.SqlServerProviderEntry(this.ConnectionString, 
                "MergeNetworkCampaigns",
                Jw.Json(new { NetworkId = networkId }),
                campaignXml);
        }

        
        public async Task<string> GetSuppressionFileUri(
            IGenericEntity network, string networkCampaignId, int maxConnections)
        {
            string uri = null;
            string networkName = network.GetS("Name");
            string apiKey = network.GetS($"Credentials/{networkName}ApiKey");
            string apiUrl = network.GetS($"Credentials/{networkName}ApiUrl");
            string optizmoToken = network.GetS($"Credentials/OptizmoToken");

            IDictionary<string, string> parms = new Dictionary<string, string>()
            {
                { "apikey", apiKey },
                { "apiFunc", "getsuppression" },
                { "campaignid", networkCampaignId }
            };

            string suppDetails = await Utility.ProtocolClient.HttpPostAsync(apiUrl, parms, 60, "", maxConnections);
            XmlDocument xml = new XmlDocument();

            try
            {
                xml.LoadXml(suppDetails);
                XmlNode xn = xml.SelectSingleNode("/dataset/data/suppurl");
                Uri usuri = new Uri(xn.FirstChild.Value);
                var usurl = HttpUtility.ParseQueryString(usuri.Query);

                if ((networkName == "Amobee") && (usuri.ToString().Contains("go.unsubcentral.com"))
                    && (usurl["key"] != null) && (usurl["s"] != null))
                {
                    uri = "https://api.unsubcentral.com/api/service/keys/" + usurl["key"] + "?s=" + usurl["s"] + "&format=hash&zipped=true";
                }
                else if ((networkName == "Amobee") && (usuri.ToString().Contains("ezepo.net")))
                {
                    string ezepoUnsubUrl = await GetEzepoUnsubFileUri(usuri.ToString());
                    if (ezepoUnsubUrl != "")
                        uri = ezepoUnsubUrl;
                    else
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                               "GetSuppressionFileUri", "Empty ezepo url",
                               usuri.ToString());
                }
                else if ((networkName == "Amobee") && (usuri.ToString().Contains("mailer.optizmo.net")))
                {
                    string optizmoUnsubUrl = await GetOptizmoUnsubFileUri(usuri.AbsolutePath, optizmoToken);
                    if (optizmoUnsubUrl != "")
                        uri = optizmoUnsubUrl;
                    else
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                               "GetSuppressionFileUri", "Empty otizmo url",
                               usuri.ToString());
                }
                else if ((networkName == "Madrivo") && (usuri.ToString().Contains("api.midenity.com")))
                {
                    uri = usuri.ToString();
                }
                else
                {
                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                               "GetSuppressionFileUri", "Unknown unsub file source.",
                               suppDetails);
                    throw new Exception("Unknown unsub file source.");
                }
            }
            catch (Exception findUnsubException)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                               "GetSuppressionFileUri", "Exception finding unsub file source.",
                               suppDetails + "::" + findUnsubException.ToString());
                throw new Exception("Exception finding unsub file source.");
            }
            
            return uri;
        }

        public async Task<string> GetOptizmoUnsubFileUri(string url, string optizmoToken)
        {
            string optizmoUnsubUrl = "";
            string[] pathParts = url.Split('/');
            //https://mailer-api.optizmo.net/accesskey/download/m-zvnv-i13-7e6680de24eb50b1e795517478d0c959?token=lp1fURUWHOOkPnEq6ec0hrRAe3ezcfVK&format=md5
            StringBuilder optizmoUrl = new StringBuilder("https://mailer-api.optizmo.net/accesskey/download/");
            optizmoUrl.Append(pathParts[pathParts.Length - 1]);
            optizmoUrl.Append($"?token={optizmoToken}&format=md5");
            //503 Service Unavailable
            Tuple<bool, string> aojson = null;
            int retryCount = 0;
            int[] retryWalkaway = new[] { 1, 10, 50, 100, 300 };
            while (retryCount < 5)
            {
                aojson = await Utility.ProtocolClient.HttpGetAsync(optizmoUrl.ToString(), 60 * 30);
                if (!String.IsNullOrEmpty(aojson.Item2) && aojson.Item1)
                {
                    if (aojson.Item2.Contains("503 Service Unavailable"))
                    {
                        await Task.Delay(retryWalkaway[retryCount] * 1000);
                        retryCount += 1;
                        continue;
                    }
                    IGenericEntity te = new GenericEntityJson();
                    var ts = (JObject)JsonConvert.DeserializeObject(aojson.Item2);
                    te.InitializeEntity(null, null, ts);
                    if (te.GetS("download_link") != null)
                    {
                        optizmoUnsubUrl = te.GetS("download_link");
                    }
                }
                break;
            }

            return optizmoUnsubUrl;
        }

        public async Task<string> GetEzepoUnsubFileUri(string url)
        {
            string fileUrl = "";
            //var chromeOptions = new ChromeOptions();
            //chromeOptions.AddUserProfilePreference("download.default_directory", @"e:\workspace\unsub");
            //chromeOptions.AddUserProfilePreference("intl.accept_languages", "nl");
            //chromeOptions.AddUserProfilePreference("disable-popup-blocking", "true");
            //var driver = new ChromeDriver(this.SeleniumChromeDriverPath, chromeOptions);
            using (var driver = new ChromeDriver(this.SeleniumChromeDriverPath))
            {
                driver.Navigate().GoToUrl(url);
                driver.FindElement(By.XPath("//button[.='Download All Data']")).Click();
                IWebElement dwnldLink = null;
                int retryCount = 0;
                int[] retryWalkaway = new[] { 1, 10, 50, 100, 300 };
                while (retryCount < 5)
                {
                    try
                    {
                        dwnldLink = driver.FindElement(By.Id("downloadlink"));
                        if (dwnldLink.Displayed) break;
                        else throw new Exception();
                    }
                    catch (Exception ex)
                    {
                        await Task.Delay(retryWalkaway[retryCount] * 1000);
                    }
                }

                if (dwnldLink != null)
                {
                    //dwnldLink.Click();
                    fileUrl = dwnldLink.GetAttribute("href");
                } 
            }
            return fileUrl;
        }

        public async Task<IDictionary<string, object>> DownloadSuppressionFiles(
            IGenericEntity network, string unsubUrl)
        {
            object dr = null;
            string networkName = network.GetS("Name");
            int parallelism = Int32.Parse(network.GetS("Credentials/Parallelism"));

            if (networkName == "Amobee")
            {
                string unsubCentralUserName = network.GetS("Credentials/UnsubCentralUserName");
                string unsubCentralPassword = network.GetS("Credentials/UnsubCentralPassword");

                // This version is too slow - switched to unbuffered
                //dr = await Utility.ProtocolClient.DownloadPage(unsubUrl,
                //    unsubCentralUserName + ":" + unsubCentralPassword,
                //    ZipTester,
                //    new Dictionary<string, Func<string, Task<object>>>()
                //    {
                //        { MD5HANDLER, Md5ZipHandler },
                //        { PLAINTEXTHANDLER, PlainTextHandler },
                //        { DOMAINHANDLER, DomainZipHandler },
                //        { UNKNOWNHANDLER, UnknownTypeHandler }
                //    },
                //    30 * 60,
                //    true,
                //    10);

                dr = await Utility.ProtocolClient.DownloadUnzipUnbuffered(unsubUrl,
                    unsubCentralUserName + ":" + unsubCentralPassword,
                    ZipTester,
                    new Dictionary<string, Func<FileInfo, Task<object>>>()
                    {
                        { MD5HANDLER, Md5ZipHandler },
                        { PLAINTEXTHANDLER, PlainTextHandler },
                        { DOMAINHANDLER, DomainZipHandler },
                        { UNKNOWNHANDLER, UnknownTypeHandler }
                    },
                    this.ClientWorkingDirectory,
                    30 * 60,
                    parallelism);
            }
            else if (networkName == "Madrivo")
            {
                // This version is too slow - switched to unbuffered
                //dr = await Utility.ProtocolClient.DownloadPage(unsubUrl,
                //    null,
                //    ZipTester,
                //    new Dictionary<string, Func<string, Task<object>>>()
                //    {
                //         { MD5HANDLER, Md5ZipHandler },
                //         { PLAINTEXTHANDLER, PlainTextHandler },
                //         { DOMAINHANDLER, DomainZipHandler },
                //         { UNKNOWNHANDLER, UnknownTypeHandler }
                //    },
                //    30 * 60,
                //    true,
                //    10);

                dr = await Utility.ProtocolClient.DownloadUnzipUnbuffered(unsubUrl,
                    null,
                    ZipTester,
                    new Dictionary<string, Func<FileInfo, Task<object>>>()
                    {
                        { MD5HANDLER, Md5ZipHandler },
                        { PLAINTEXTHANDLER, PlainTextHandler },
                        { DOMAINHANDLER, DomainZipHandler },
                        { UNKNOWNHANDLER, UnknownTypeHandler }
                    },
                    this.ClientWorkingDirectory,
                    30 * 60,
                    parallelism);
            }
            else
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                           "DownloadSuppressionFiles", "Unknown network.",
                           networkName);
            }

            return (IDictionary<string, object>)dr;
        }        

        public async Task<string> ZipTester(FileInfo f)
        {
            string theText = "";

            if (f.Length == 0)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                       "ZipTester", "Zero length file",
                       f.FullName);
                return UNKNOWNHANDLER;
            }

            using (StreamReader sr = f.OpenText())
            {
                char[] buffer = new char[400];
                await sr.ReadAsync(buffer, 0, 400);
                theText = new string(buffer);

                string[] lines = theText.Split(
                    new[] { "\r\n", "\r", "\n" },
                    StringSplitOptions.None);

                bool allMd5 = true;
                for (int l = 0; l < (lines.Length == 1 ? 1 : lines.Length-1); l++)
                {
                    if (!Regex.IsMatch(lines[l], "^[0-9a-fA-F]{32}$"))
                    {
                        allMd5 = false;
                        break;
                    }
                }
                if (allMd5) return MD5HANDLER;

                bool allPlain = true;
                for (int l = 0; l < (lines.Length == 1 ? 1 : lines.Length - 1); l++)
                {
                    if (!lines[l].Contains("@") || (lines[l][0] == '*') || (lines[l][0] == '@'))
                    {
                        allPlain = false;
                        break;
                    }
                }
                if (allPlain) return PLAINTEXTHANDLER;

                bool allDom = true;
                for (int l = 0; l < (lines.Length == 1 ? 1 : lines.Length - 1); l++)
                {
                    if (lines[l].Length == 0) continue;
                    if (!lines[l].Contains("."))
                    {
                        allDom = false;
                        break;
                    }
                }
                if (allDom) return DOMAINHANDLER;
                
            }

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                           "ZipTester", "Unknown file type.",
                           f.FullName + "::" + theText);
            return UNKNOWNHANDLER;
        }
        
        public async Task<object> Md5ZipHandler(FileInfo f)
        {
            Guid fileName = Guid.NewGuid();
            f.MoveTo($"{this.ClientWorkingDirectory}\\{fileName}.txt");
            return fileName;
        }

        public async Task<object> PlainTextHandler(FileInfo f)
        {
            Guid fileName = Guid.NewGuid();
            f.MoveTo($"{this.ClientWorkingDirectory}\\{fileName}.txt");
            return fileName;
        }

        public async Task<object> DomainZipHandler(FileInfo f)
        {
            Guid fileName = Guid.NewGuid();
            f.MoveTo($"{this.ClientWorkingDirectory}\\{fileName}.txt");
            return fileName;
        }

        public async Task<object> UnknownTypeHandler(FileInfo fi)
        {
            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                           "UnknownTypeHandler", "Unknown file type.",
                           fi.FullName);
            return new object();
        }        
    }
}
