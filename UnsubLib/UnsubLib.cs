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

// net use z: \\ftpback-bhs6-85.ip-66-70-176.net\ns557038.ip-66-70-182.net /persistent:Yes

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
        public string FileCacheDirectory;
        public string FileCacheFtpServer;
        public string FileCacheFtpUser;
        public string FileCacheFtpPassword;
        public long WorkingFileCacheSize;
        public long SearchFileCacheSize;
        public string UnsubServerUri;
        public string UnsubJobServerUri;
        public string DtExecPath;
        public int MaxConnections;
        public int MaxParallelism;
        public string SeleniumChromeDriverPath;
        public string FileCacheFtpServerPath;
        public int MinDiffFileSize;
        public float MaxDiffFilePercentage;

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
            this.FileCacheDirectory = gc.GetS("Config/FileCacheDirectory");
            this.FileCacheFtpServer = gc.GetS("Config/FileCacheFtpServer");
            this.FileCacheFtpUser = gc.GetS("Config/FileCacheFtpUser");
            this.FileCacheFtpPassword = gc.GetS("Config/FileCacheFtpPassword");
            this.WorkingFileCacheSize = Int64.Parse(gc.GetS("Config/WorkingFileCacheSize"));
            this.SearchFileCacheSize = Int64.Parse(gc.GetS("Config/SearchFileCacheSize"));
            this.UnsubServerUri = gc.GetS("Config/UnsubServerUri");
            this.UnsubJobServerUri = gc.GetS("Config/UnsubJobServerUri");
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
            this.MinDiffFileSize = Int32.Parse(gc.GetS("Config/MinDiffFileSize"));
            this.MaxDiffFilePercentage = float.Parse(gc.GetS("Config/MaxDiffFilePercentage"));

            ServicePointManager.DefaultConnectionLimit = this.MaxConnections;

            List<Rw.ScriptDescriptor> scripts = new List<Rw.ScriptDescriptor>();
            string scriptsPath = this.ServerWorkingDirectory + "\\Scripts";
            var rw = new Rw.RoslynWrapper(scripts, $@"{scriptsPath}\\debug");

            this.RosWrap = rw;
        }

        public async Task<IGenericEntity> GetNetworks(string singleNetworkName)
        {
            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                "GetNetworks", "Tracking", "Before SelectNetwork" +
                singleNetworkName != null ? " " + singleNetworkName : "");

            string network = await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                    "SelectNetwork",
                    singleNetworkName != null ? Jw.Json(new { NetworkName = singleNetworkName}): "{}",
                    "");

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                $"GetNetworks", "Tracking", "After SelectNetwork: " + network +
                singleNetworkName != null ? " " + singleNetworkName : "");

            IGenericEntity ge = new GenericEntityJson();
            var state = (JArray)JsonConvert.DeserializeObject(network);
            ge.InitializeEntity(this.RosWrap, null, state);
            
            return ge;
        }        

        public async Task ManualDirectory(IGenericEntity network)
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
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                    $"ManualDirectory", "Tracking", "Before ManualJob: " + dir);

                await ManualJob(dir, network);

                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                    $"ManualDirectory", "Tracking", "After ManualJob: " + dir);
            }
        }

        public async Task<string> ForceUnsub(IGenericEntity dtve)
        {
            string forceName = dtve.GetS("ForceName");

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"ForceUnsub", "Tracking", "Starting ForceUnsub: " + forceName);

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
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"ForceUnsub", "Tracking", $"Starting ForceUnsub({n.GetS("Name")}): " + forceName);
                await ForceDirectory(forceName, n);
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"ForceUnsub", "Tracking", $"Completed ForceUnsub({n.GetS("Name")}): " + forceName);
            }

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"ForceUnsub", "Tracking", "Completed ForceUnsub: " + forceName);

            return Jw.Json(new { Result = "Success" });
        }

        public async Task ForceDirectory(string forceDirName, IGenericEntity network)
        {
            DirectoryInfo dir = new DirectoryInfo(this.ClientWorkingDirectory + "\\Force\\" + forceDirName);
            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                    $"ForceDirectory", "Tracking", $"Starting ManualJob({network.GetS("Name")}): " + dir);
            await ManualJob(dir, network);
            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                    $"ForceDirectory", "Tracking", $"Completed ManualJob({network.GetS("Name")}): " + dir);
        }

        public async Task ManualJob(DirectoryInfo dir, IGenericEntity network)
        {
            DirectoryInfo cd = new DirectoryInfo(dir.FullName + "\\" + network.GetS("Id").ToLower());
            IDictionary<string, string> idtof = new Dictionary<string, string>();
            StringBuilder campaignsJson = new StringBuilder("[");
            foreach (var dd in cd.EnumerateDirectories())
            {
                // Each folder corresponds to a campaign to be processed
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"ManualJob", "Tracking", $"ManualJob({network.GetS("Name")}) Processing: " + dd.Name);

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

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"ManualJob", "Tracking", $"ManualJob({network.GetS("Name")}) Campaigns: " + campaignsJson);

            string cmps = await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                    "MergeNetworkCampaignsManual",
                    Jw.Json(new { NetworkId = network.GetS("Id").ToLower() }),
                    campaignsJson.ToString());
            IGenericEntity cse = new GenericEntityJson();
            var cstate = JsonConvert.DeserializeObject(cmps);
            cse.InitializeEntity(null, null, cstate);

            if (cse.GetS("Result") == "NoData")
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"ManualJob", "Tracking", "NoData");
                return;
            }
            else
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"ManualJob", "Tracking", $"ManualJob({network.GetS("Name")}) MergeNetworkCampaignsManual->: " + cmps);
            }

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

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"ManualJob", "Tracking", $"ManualJob({network.GetS("Name")}) Calling ProcessUnsubFiles");

            await ProcessUnsubFiles(uris, network, cse);

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"ManualJob", "Tracking", $"ManualJob({network.GetS("Name")}) Completed ProcessUnsubFiles");

            dir.Delete(true);
        }

        public async Task ScheduledUnsubJob(IGenericEntity network)
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
                    $"ScheduledUnsubJob", "Exception", $"GetUnsubUris({networkName}):" + exGetUnsubUris.ToString());
            }

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                    $"ScheduledUnsubJob", "Tracking", $"ScheduledUnsubJob({network.GetS("Name")}) Calling ProcessUnsubFiles");

            await ProcessUnsubFiles(uris, network, cse);

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                    $"ScheduledUnsubJob", "Tracking", $"ScheduledUnsubJob({network.GetS("Name")}) Completed ProcessUnsubFiles");
        }

        public async Task ProcessUnsubFiles(IDictionary<string, List<IGenericEntity>> uris, 
            IGenericEntity network, IGenericEntity cse)
        {
            string networkName = network.GetS("Name");

            // Download unsub files
            var unsubFiles = await DownloadUnsubFiles(uris, network);

            // Generate diff list
            List<string> campaignsWithNegativeDelta = new List<string>();
            HashSet<Tuple<string, string>> diffs = new HashSet<Tuple<string, string>>();
            foreach (var c in cse.GetL(""))
            {
                if (unsubFiles.Item1.ContainsKey(c.GetS("Id")))
                {
                    string newFileName = unsubFiles.Item1[c.GetS("Id")].ToLower() + ".txt.srt";
                    long newFileSize = await GetFileSize(newFileName);

                    if (!string.IsNullOrEmpty(c.GetS("MostRecentUnsubFileId")))
                    {
                        string oldFileName = c.GetS("MostRecentUnsubFileId").ToLower() + ".txt.srt";
                        long oldFileSize = await GetFileSize(oldFileName);

                        if ((c.GetS("MostRecentUnsubFileId").Length == 36) &&
                            (newFileSize > oldFileSize))
                        {
                            diffs.Add(new Tuple<string, string>(oldFileName, newFileName));
                        }

                        if (newFileSize < oldFileSize)
                        {
                            campaignsWithNegativeDelta.Add(c.GetS("Id"));

                            Fs.TryDeleteFile(this.ServerWorkingDirectory + "\\" + newFileName);

                            if (!String.IsNullOrEmpty(this.FileCacheDirectory))
                            {
                                Fs.TryDeleteFile(this.FileCacheDirectory + "\\" + newFileName);
                            }
                            else if (!String.IsNullOrEmpty(this.FileCacheFtpServer))
                            {
                                await Utility.ProtocolClient.DeleteFileFromFtpServer(
                                    this.FileCacheFtpServerPath + "/" + newFileName,
                                    this.FileCacheFtpServer,
                                    21,
                                    this.FileCacheFtpUser,
                                    this.FileCacheFtpPassword);
                            }
                        }
                    }
                }
            }

            // Update campaigns with new unsub files
            try
            {
                Dictionary<string, string> campaignsWithPositiveDelta = new Dictionary<string, string>();

                foreach (var cmp in unsubFiles.Item1)
                {
                    if (!campaignsWithNegativeDelta.Contains(cmp.Key))
                        campaignsWithPositiveDelta.Add(cmp.Key, cmp.Value);
                }

                await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                    "UpdateNetworkCampaignsUnsubFiles",
                    "",
                    Jw.Json("Id", "FId", campaignsWithPositiveDelta));
            }
            catch (Exception exUpdateCampaigns)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                    $"ProcessUnsubFiles", "Exception", $"UpdateNetworkCampaignsUnsubFiles({networkName}):: " + exUpdateCampaigns.ToString());
            }

            // Signal server to load domain unsub files, diff md5 unsub files
            try
            {
                await SignalUnsubServerService(network, diffs, unsubFiles.Item2);
            }
            catch (Exception exSignal)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                    $"ProcessUnsubFiles", "Exception", $"SignalUnsubServerService({networkName}):: " + exSignal.ToString());
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
                    network.GetS($"Credentials/NetworkApiKey"),
                    network.GetS($"Credentials/NetworkApiUrl"));
                var cs = (JArray)JsonConvert.DeserializeObject(campaigns);
                cse.InitializeEntity(null, null, cs);
            }
            catch (Exception exCampaigns)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                    $"GetCampaignsScheduledJobs", "Exception", $"GetNetworkCampaigns({networkName}):: " +
                        network.GetS("Id") + "::" +
                        network.GetS($"Credentials/NetworkApiKey") + "::" +
                        network.GetS($"Credentials/NetworkApiUrl") + exCampaigns.ToString());
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
                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"GetUnsubUris", "Tracking", $"Calling GetSuppressionFileUri({networkName}):: " +
                        "for campaign " + c.GetS("NetworkCampaignId"));

                    string uri = await GetSuppressionFileUri(
                        network,
                        c.GetS("NetworkCampaignId"),
                        parallelism);

                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"GetUnsubUris", "Tracking", $"Completed GetSuppressionFileUri({networkName}):: " +
                        "for campaign " + c.GetS("NetworkCampaignId"));

                    if (!String.IsNullOrEmpty(uri))
                    {
                        if (uris.ContainsKey(uri)) uris[uri].Add(c);
                        else uris.TryAdd(uri, new List<IGenericEntity>() { c });
                    }
                }
                catch (Exception exCampaign)
                {
                    string campaignId = "unknown";
                    try { campaignId = c.GetS("NetworkCampaignId"); }
                    catch (Exception exGetC) { }

                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                        $"GetUnsubUris", "Exception", $"GetSuppressionFileUri({networkName}):: " +
                        network.GetS("Id") + "::" +
                        "Failed to retrieve unsubscribe Id for " + campaignId + exCampaign.ToString());
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
                    StringBuilder sb = new StringBuilder();
                    foreach (var c in uri.Value)
                    {
                        sb.Append(c.GetS("Id") + ":");
                    }
                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                            $"DownloadUnsubFiles", "Tracking", $"Iteration({networkName}):: " +
                            "for url " + uri.Key + " for campaigns " + sb.ToString());

                    IDictionary<string, object> cf = new Dictionary<string, object>();
                    if (networkUnsubMethod == "ScheduledUnsubJob")
                    {
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                            $"DownloadUnsubFiles", "Tracking", $"Calling DownloadSuppressionFiles({networkName}):: " +
                            "for url " + uri.Key);

                        cf = await DownloadSuppressionFiles(
                                network,
                                uri.Key);

                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                            $"DownloadUnsubFiles", "Tracking", $"Completed DownloadSuppressionFiles({networkName}):: " +
                            "for url " + uri.Key);
                    }
                    else if (networkUnsubMethod == "ManualDirectory")
                    {
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                            $"DownloadUnsubFiles", "Tracking", $"Calling UnzipUnbuffered({networkName}):: " +
                            "for url " + uri.Key);

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

                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                            $"DownloadUnsubFiles", "Tracking", $"Completed UnzipUnbuffered({networkName}):: " +
                            "for url " + uri.Key);
                    }                     

                    if (cf.ContainsKey(MD5HANDLER))
                    {
                        string fmd5 = cf[MD5HANDLER].ToString().ToLower();

                        long lineCt = await UnixWrapper.LineCount(this.ClientWorkingDirectory + "\\" + fmd5 + ".txt");

                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                            $"DownloadUnsubFiles", "Tracking", $"RemoveNonAsciiFromFile({networkName}):: " +
                            "for file " + fmd5 + $"({lineCt})");

                        await Utility.UnixWrapper.RemoveNonAsciiFromFile(this.ClientWorkingDirectory,
                            fmd5 + ".txt", fmd5 + ".txt.cln");

                        lineCt = await UnixWrapper.LineCount(this.ClientWorkingDirectory + "\\" + fmd5 + ".txt.cln");

                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                            $"DownloadUnsubFiles", "Tracking", $"RemoveNonMD5LinesFromFile({networkName}):: " +
                            "for file " + fmd5 + $"({lineCt})");

                        await Utility.UnixWrapper.RemoveNonMD5LinesFromFile(this.ClientWorkingDirectory,
                            fmd5 + ".txt.cln", fmd5 + ".txt.cl2");

                        lineCt = await UnixWrapper.LineCount(this.ClientWorkingDirectory + "\\" + fmd5 + ".txt.cl2");

                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                            $"DownloadUnsubFiles", "Tracking", $"SortFile({networkName}):: " +
                            "for file " + fmd5 + $"({lineCt})");

                        await Utility.UnixWrapper.SortFile(
                            this.ClientWorkingDirectory,
                            fmd5 + ".txt.cl2",
                            fmd5 + ".txt.srt",
                            false,
                            true);

                        lineCt = await UnixWrapper.LineCount(this.ClientWorkingDirectory + "\\" + fmd5 + ".txt.srt");

                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                            $"DownloadUnsubFiles", "Tracking", $"Completed Cleaning({networkName}):: " +
                            "for file " + fmd5 + $"({lineCt})");

                        if (!String.IsNullOrEmpty(this.FileCacheDirectory))
                        {
                            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                                $"DownloadUnsubFiles", "Tracking", $"Starting UploadToDirectory({networkName}):: " +
                                "for file " + fmd5);

                            new FileInfo(this.ClientWorkingDirectory + "\\" + fmd5 + ".txt.srt")
                                .MoveTo(this.FileCacheDirectory + "\\" + fmd5 + ".txt.srt");

                            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                                $"DownloadUnsubFiles", "Tracking", $"Completed UploadToDirectory({networkName}):: " +
                                "for file " + fmd5);
                        }
                        else if (!String.IsNullOrEmpty(this.FileCacheFtpServer))
                        {
                            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                                $"DownloadUnsubFiles", "Tracking", $"Starting UploadToFtp({networkName}):: " +
                                "for file " + fmd5);

                            await Utility.ProtocolClient.UploadFile(
                                this.ClientWorkingDirectory + "\\" + fmd5 + ".txt.srt",
                                this.FileCacheFtpServerPath + "/" + fmd5 + ".txt.srt",
                                this.FileCacheFtpServer,
                                this.FileCacheFtpUser,
                                this.FileCacheFtpPassword);

                            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                                $"DownloadUnsubFiles", "Tracking", $"Completed UploadToFtp({networkName}):: " +
                                "for file " + fmd5);

                            Fs.TryDeleteFile($"{this.ClientWorkingDirectory}\\{fmd5 + ".txt.srt"}");
                        }

                        Fs.TryDeleteFile($"{this.ClientWorkingDirectory}\\{fmd5}.txt");
                        Fs.TryDeleteFile($"{this.ClientWorkingDirectory}\\{fmd5}.txt.cln");
                        Fs.TryDeleteFile($"{this.ClientWorkingDirectory}\\{fmd5}.txt.cl2");
                    }

                    if (cf.ContainsKey(DOMAINHANDLER))
                    {
                        string fdom = cf[DOMAINHANDLER].ToString().ToLower();

                        if (!String.IsNullOrEmpty(this.FileCacheDirectory))
                        {
                            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                                $"DownloadUnsubFiles", "Tracking", $"Starting UploadToDirectory({networkName}):: " +
                                "for file " + fdom);

                            new FileInfo(this.ClientWorkingDirectory + "\\" + fdom + ".txt")
                                .MoveTo(this.FileCacheDirectory + "\\" + fdom + ".txt");

                            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                                $"DownloadUnsubFiles", "Tracking", $"Completed UploadToDirectory({networkName}):: " +
                                "for file " + fdom);
                        }
                        else if (!String.IsNullOrEmpty(this.FileCacheFtpServer))
                        {
                            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                                $"DownloadUnsubFiles", "Tracking", $"Starting Upload({networkName}):: " +
                                "for file " + fdom);

                            await Utility.ProtocolClient.UploadFile(
                                    this.ClientWorkingDirectory + "\\" + fdom + ".txt",
                                    this.FileCacheFtpServerPath + "/" + fdom + ".txt",
                                    this.FileCacheFtpServer,
                                    this.FileCacheFtpUser,
                                    this.FileCacheFtpPassword);

                            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                                $"DownloadUnsubFiles", "Tracking", $"Completed Upload({networkName}):: " +
                                "for file " + fdom);

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
                                    $"DownloadUnsubFiles", "Error", $"ncf.TryAdd Failed({networkName}):: " +
                                    uri.Key + "::" + c.GetS("Id") + "::" + fmd5.ToLower());
                            }
                        }

                        if (cf.ContainsKey(DOMAINHANDLER))
                        {
                            string fdom = cf[DOMAINHANDLER].ToString();
                            if (!ndf.TryAdd(c.GetS("Id"), fdom.ToLower()))
                            {
                                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                                    $"DownloadUnsubFiles", "Error", $"ndf.TryAdd Failed({networkName}):: " +
                                    uri.Key + "::" + c.GetS("Id") + "::" + fdom.ToLower());
                            }
                        }
                    }
                }
                catch (Exception exFile)
                {
                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                        $"DownloadUnsubFiles", "Exception", $"OuterCatch({networkName}):: " +
                        uri.Key + "::" + exFile.ToString());
                }
            });

            return new Tuple<ConcurrentDictionary<string, string>, ConcurrentDictionary<string, string>>(ncf, ndf);
        }

        public async Task SignalUnsubServerService(IGenericEntity network, HashSet<Tuple<string, string>> diffs, 
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
            
            string msg = Jw.Json(new { m = "LoadUnsubFiles", ntwrk = network.GetS("Name"),
                DomUnsub = Jw.Json("CId", "FId", ndf), Diff = sbDiff.ToString() },
                new bool[] { true, true, false, false });

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"SignalUnsubServerService", "Tracking", msg);

            string result = null;
            if (!this.CallLocalLoadUnsubFiles)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"SignalUnsubServerService", "Tracking", "Calling HttpPostAsync");

                //result = await Utility.ProtocolClient.HttpPostAsync(this.UnsubServerUri,
                //    new Dictionary<string, string>() { { "", msg } }, 60 * 60, "application/json");

                result = await Utility.ProtocolClient.HttpPostAsync(this.UnsubJobServerUri, 
                    msg, "application/json", 1000 * 60);

                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"SignalUnsubServerService", "Tracking", "Completed HttpPostAsync");
            }
            else
            {
                IGenericEntity cse = new GenericEntityJson();
                var cs = JsonConvert.DeserializeObject(msg);
                cse.InitializeEntity(null, null, cs);

                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"SignalUnsubServerService", "Tracking", "Calling LoadUnsubFiles");

                result = await LoadUnsubFiles(cse);

                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"SignalUnsubServerService", "Tracking", "Completed LoadUnsubFiles");
            }

            if (result == null)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                        $"SignalUnsubServerService", "Error", "Null Result");
                throw new Exception("Null result");
            }
            else
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"SignalUnsubServerService", "Tracking", "Result: " + result);
            }

            var res = (JObject)JsonConvert.DeserializeObject(result);
            IGenericEntity rese = new GenericEntityJson();
            rese.InitializeEntity(null, null, res);
            if (rese.GetS("Result") != "Success")
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                        $"SignalUnsubServerService", "Error", "Failure: " + result);
                throw new Exception(result);
            }
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

            if (!String.IsNullOrEmpty(this.FileCacheDirectory))
            {
                DirectoryInfo sourceDir = new DirectoryInfo(this.FileCacheDirectory);
                FileInfo[] files = sourceDir.GetFiles("*", SearchOption.TopDirectoryOnly);
                foreach (var file in files)
                {
                    string[] fileParts = file.Name.Split(new char[] { '.' });
                    if (!refdFiles.Contains(fileParts[0].ToLower()))
                        Fs.TryDeleteFile(file);
                }
            }
            else if (!String.IsNullOrEmpty(this.FileCacheFtpServer))
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

            DirectoryInfo sourceDirLocal = new DirectoryInfo(this.ClientWorkingDirectory);
            FileInfo[] filesLocal = sourceDirLocal.GetFiles("*", SearchOption.TopDirectoryOnly);
            foreach (var file in filesLocal)
            {
                Fs.TryDeleteFile(file);
            }
            
            try
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                    $"CleanUnusedFiles", "Tracking", "Starting HttpPostAsync CleanUnusedFilesServer");

                await Utility.ProtocolClient.HttpPostAsync(this.UnsubServerUri,
                    Jw.Json(new { m = "CleanUnusedFilesServer" }), "application/json", 1000 * 60);

                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                        $"CleanUnusedFiles", "Tracking", "Completed HttpPostAsync CleanUnusedFilesServer");
            }
            catch (Exception exClean)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, "UnsubJob",
                    $"CleanUnusedFiles", "Exception", $"HttpPostAsync CleanUnusedFilesServer: " + exClean.ToString());
            }
        }

        public async Task<string> CleanUnusedFilesServer()
        {
            try
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, "UnsubJob",
                    $"CleanUnusedFilesServer", "Tracking", $"Starting CleanUnusedFilesServer");

                DirectoryInfo sourceDirLocal = new DirectoryInfo(this.ServerWorkingDirectory);
                FileInfo[] filesLocal = sourceDirLocal.GetFiles("*", SearchOption.TopDirectoryOnly);
                foreach (var file in filesLocal)
                {
                    Fs.TryDeleteFile(file);
                }

                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, "UnsubJob",
                    $"CleanUnusedFilesServer", "Tracking", $"Completed CleanUnusedFilesServer");
            }
            catch (Exception exClean)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, "UnsubJob",
                     $"CleanUnusedFilesServer", "Exception", $"CleanUnusedFilesServer: " + exClean.ToString());
            }
            return Jw.Json(new { Result = "Success" });
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

            if (!String.IsNullOrEmpty(this.FileCacheDirectory))
            {
                DirectoryInfo sourceDir = new DirectoryInfo(this.FileCacheDirectory);
                FileInfo[] files = sourceDir.GetFiles("*.srt", SearchOption.TopDirectoryOnly);
                StringBuilder sbAllFiles = new StringBuilder();
                foreach (var file in files)
                {
                    sbAllFiles.Append(file.Name + ":");
                }
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                    $"LoadUnsubFiles", "Tracking", "List of All Cached files(FileCacheDirectory): " + sbAllFiles.ToString());
            }
            else if (!String.IsNullOrEmpty(this.FileCacheFtpServer))
            { 
                List<string> allFiles = await Utility.ProtocolClient.FtpGetFiles("Unsub", this.FileCacheFtpServer, this.FileCacheFtpUser, this.FileCacheFtpPassword);
                StringBuilder sbAllFiles = new StringBuilder();
                foreach (string fl in allFiles)
                {
                    sbAllFiles.Append(fl + ":");
                }
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                    $"LoadUnsubFiles", "Tracking", "List of All Cached files(FileCacheFtpServer): " + sbAllFiles.ToString());
            }

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
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                            $"LoadUnsubFiles", "Tracking", "Calling spUploadDomainUnsubFile: " + campaignId + "::" + wd +
                            "::" + fileId + "::" + tmpFileName);
                        await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                            "UploadDomainUnsubFile",
                            Jw.Json(new { CId = campaignId, Ws = wd, FId = fileId, Fn = tmpFileName }),
                            "");
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                            $"LoadUnsubFiles", "Tracking", "Called spUploadDomainUnsubFile: " + campaignId + "::" + wd +
                            "::" + fileId + "::" + tmpFileName);

                        Fs.TryDeleteFile(this.ServerWorkingDirectory + "\\" + tmpFileName);
                    }
                    catch (Exception exDomUnsub)
                    {
                        Fs.TryDeleteFile(this.ServerWorkingDirectory + "\\" + tmpFileName);

                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                            $"LoadUnsubFiles", "Exception", "spUploadDomainUnsubFile: " + campaignId + 
                            "::" + fileId + "::" + tmpFileName + "::" + exDomUnsub);
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

                    if (!String.IsNullOrEmpty(this.FileCacheDirectory))
                    {
                        Fs.TryDeleteFile(this.FileCacheDirectory + "\\" + domFile + ".txt");
                    }
                    else if (!String.IsNullOrEmpty(this.FileCacheFtpServer))
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

                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                            $"LoadUnsubFiles", "Tracking", "Before Diffing: " +
                            oldf + "::" + newf);

                    try
                    {
                        oldfname = await GetFileFromFileId(oldf, ".txt.srt", this.ServerWorkingDirectory,
                            this.WorkingFileCacheSize, Guid.NewGuid().ToString().ToLower() + ".tdd");
                        newfname = await GetFileFromFileId(newf, ".txt.srt", this.ServerWorkingDirectory,
                            this.WorkingFileCacheSize, Guid.NewGuid().ToString().ToLower() + ".tdd");

                        long oldflength = new FileInfo(this.ServerWorkingDirectory + "\\" + oldfname).Length;
                        long newflength = new FileInfo(this.ServerWorkingDirectory + "\\" + newfname).Length;
                        float diffPerc = ((float)(newflength - oldflength)) / oldflength;

                        if (diffPerc < 0)
                        {
                            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                                $"LoadUnsubFiles", "Error", "Negative Diff: " +
                                oldf + "::" + oldfname + $"({oldflength})::" +
                                newf + "::" + newfname + $"({newflength})::Negative diff percentage");
                        }
                        else if (oldflength > 320000 && diffPerc > 0.2)
                        {
                            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                                $"LoadUnsubFiles", "Error", "Large Diff: " +
                                oldf + "::" + oldfname + $"({oldflength})::" +
                                newf + "::" + newfname + $"({newflength})::Over 20 percent");
                        }
                        else
                        {
                            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                            $"LoadUnsubFiles", "Tracking", "Before Diffing: " +
                            oldf + "::" + oldfname + $"({oldflength})::" +
                            newf + "::" + newfname + $"({newflength})");

                            bool res = await Utility.UnixWrapper.DiffFiles(
                                oldfname,
                                newfname,
                                this.ServerWorkingDirectory,
                                diffname);

                            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                                $"LoadUnsubFiles", "Tracking", "After Diffing: " +
                                oldf + "::" + newf);

                            //await SSISLoadMd5File(diffname,
                            //    this.ServerName,
                            //    this.DatabaseName,
                            //    this.SsisConnectionString,
                            //    this.JsonTemplateFile,
                            //    this.SsisTemplateFile,
                            //    "PostProcessDiffFile");

                            string wd = this.ServerWorkingDirectory.Replace("\\", "\\\\");
                            await SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                                "UploadDiffFile",
                                Jw.Json(new { Ws = wd, Fn = diffname }),
                                "");

                            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                                $"LoadUnsubFiles", "Tracking", "After BulkInsert: " +
                                oldf + "::" + newf);
                        }                     
                    }
                    catch (Exception exDiff)
                    {
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                            $"LoadUnsubFiles", "Exception", "Diff Failed: " +
                            oldfname + "::" + newfname + "::" + exDiff.ToString());
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
                            $"LoadUnsubFiles", "Exception", "Outer Catch: " +
                             ex.ToString());
                result = Jw.Json(new { Error = "Exception" });
            }

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                            $"LoadUnsubFiles", "Tracking", 
                            $"Finished LoadUnsubFiles({dtve.GetS("ntwrk")}): " + result);

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

        public async Task<long> GetFileSize(string fileName)
        {
            long fileSize = 0;

            try
            {
                if (!String.IsNullOrEmpty(this.FileCacheDirectory))
                {
                    fileSize = new FileInfo(this.FileCacheDirectory + "\\" + fileName).Length;
                }
                else if (!String.IsNullOrEmpty(this.FileCacheFtpServer))
                {
                    fileSize = await Utility.ProtocolClient.FtpGetFileSize(
                            this.FileCacheFtpServerPath + "/" + fileName,
                            this.FileCacheFtpServer,
                            this.FileCacheFtpUser,
                            this.FileCacheFtpPassword);
                }
                else
                {
                    fileSize = new FileInfo(this.ClientWorkingDirectory + "\\" + fileName).Length;
                }
            }
            catch (Exception fileSizeException)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                        "GetFileSize", "Exception", fileName + "::" + fileSizeException.ToString());
            }

            return fileSize;
        }

        public async Task<bool> MakeRoom(string fileName, long cacheSize)
        {
            try
            {
                long newFileSize = 0;

                if (!String.IsNullOrEmpty(this.FileCacheDirectory))
                {
                    newFileSize = new FileInfo(this.FileCacheDirectory + "\\" + fileName).Length;
                }
                else if (!String.IsNullOrEmpty(this.FileCacheFtpServer))
                {
                    newFileSize = await Utility.ProtocolClient.FtpGetFileSize(
                            this.FileCacheFtpServerPath + "/" + fileName,
                            this.FileCacheFtpServer,
                            this.FileCacheFtpUser,
                            this.FileCacheFtpPassword);
                }
                if (newFileSize > cacheSize)
                {
                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                        "MakeRoom", "Error", "File larger than cache: " + fileName);
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

            if (!String.IsNullOrEmpty(this.FileCacheFtpServer) ||
                !String.IsNullOrEmpty(this.FileCacheDirectory))
            {
                DirectoryInfo di = new DirectoryInfo(destDir);
                FileInfo[] fi = di.GetFiles(fileName);
                if (fi.Length == 1) return fileName;
                else if (fi.Length == 0)
                {
                    success = await MakeRoom(fileName, cacheSize);
                    if (!success)
                    {
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                            "GetFileFromFileId", "Error", "Could not make room for file: " + fileName);
                        throw new Exception("Could not make room for file.");
                    }

                    if (!String.IsNullOrEmpty(this.FileCacheDirectory))
                    {
                        new FileInfo(this.FileCacheDirectory + "\\" + fileName)
                                .CopyTo(destDir + "\\" + dfileName);
                    }
                    else if (!String.IsNullOrEmpty(this.FileCacheFtpServer))
                    {
                        await Utility.ProtocolClient.DownloadFileFtp(
                            destDir,
                            this.FileCacheFtpServerPath + "/" + fileName,
                            dfileName,
                            this.FileCacheFtpServer,
                            this.FileCacheFtpUser,
                            this.FileCacheFtpPassword
                            );
                    }                    

                    fi = di.GetFiles(dfileName);
                    if (fi.Length == 1) return dfileName;
                    else
                    {
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                            "GetFileFromFileId", "Error", "Could not find file in cache: " + fileName);
                        throw new Exception("Could not find file in cache: " + fileName);
                    }
                }
                else
                {
                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                            "GetFileFromFileId", "Error", "Too many file matches: " + fileName);
                    throw new Exception("Too many file matches: " + fileName);
                }
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
                else
                {
                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                            "GetFileFromFileId", "Error", "Could not find file locally: " + fileName);
                    throw new Exception("Could not find file locally: " + fileName);
                }
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
                    this.SearchDirectory,
                    fileName,
                    emailMd5);

                return Jw.Json(new { Result = result });
            }
            catch (Exception ex)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                           "IsUnsub", "Exception",
                           "Search failed: " + campaignId + "::" + emailMd5 + "::" + ex.ToString());
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
                           "IsUnsubList", "Exception",
                           "Search failed: " + campaignId + "::" + ex.ToString());
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
                           "SSISLoadMd5File", "Exception",
                           "Package failed: " + fileName + "::" + exSsisLoad.ToString());
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
                           "SSISLoadMd5File", "Exception",
                           "Package PostProcess failed: " + fileName + "::" + exPostProcess.ToString());
            }

            Fs.TryDeleteFile($"{this.ServerWorkingDirectory}\\{fileName}.json");
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

            await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                "GetNetworkCampaigns", "Tracking",
                "UseLocalNetworkFiles = " + this.UseLocalNetworkFile.ToString());

            if (!this.UseLocalNetworkFile)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                           "GetNetworkCampaigns", "Tracking",
                           "Reading Remote Network File");
                campaignXml = await Utility.ProtocolClient.HttpPostAsync(apiUrl, parms);
                File.WriteAllText(this.LocalNetworkFilePath + "\\" + networkId + ".xml", campaignXml);
            }
            else
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                           "GetNetworkCampaigns", "Tracking",
                           $@"Reading Local Network File: {this.LocalNetworkFilePath}\{networkId}.xml");
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
            string networkType = network.GetS($"Credentials/NetworkType");
            string apiKey = network.GetS($"Credentials/NetworkApiKey");
            string apiUrl = network.GetS($"Credentials/NetworkApiUrl");
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

                if ((networkType == "Amobee") && (usuri.ToString().Contains("go.unsubcentral.com"))
                    && (usurl["key"] != null) && (usurl["s"] != null))
                {
                    uri = "https://api.unsubcentral.com/api/service/keys/" + usurl["key"] + "?s=" + usurl["s"] + "&format=hash&zipped=true";
                }
                else if ((networkName == "Amobee") && (usuri.ToString().Contains("ezepo.net")))
                {
                    uri = "";
                    //await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                    //           "GetSuppressionFileUri", "Tracking",
                    //           "Calling GetEzepoUnsubFileUri: " + usuri.ToString());

                    //string ezepoUnsubUrl = await GetEzepoUnsubFileUri(usuri.ToString());

                    //await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                    //           "GetSuppressionFileUri", "Tracking",
                    //           "Completed GetEzepoUnsubFileUri: " + usuri.ToString());

                    //if (ezepoUnsubUrl != "")
                    //    uri = ezepoUnsubUrl;
                    //else
                    //    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                    //           "GetSuppressionFileUri", "Error",
                    //           "Empty ezepo url: " + usuri.ToString());
                }
                else if ((networkType == "Amobee") && (usuri.ToString().Contains("mailer.optizmo.net")))
                {
                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                               "GetSuppressionFileUri", "Tracking",
                               "Calling GetOptizmoUnsubFileUri: " + usuri.ToString());

                    string optizmoUnsubUrl = await GetOptizmoUnsubFileUri(usuri.AbsolutePath, optizmoToken);

                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1, this.ApplicationName,
                               "GetSuppressionFileUri", "Tracking",
                               "Completed GetOptizmoUnsubFileUri: " + usuri.ToString());

                    if (optizmoUnsubUrl != "")
                        uri = optizmoUnsubUrl;
                    else
                        await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                               "GetSuppressionFileUri", "Error",
                               "Empty otizmo url: " + usuri.ToString());
                }
                else if ((networkType == "Madrivo") && (usuri.ToString().Contains("api.midenity.com")))
                {
                    uri = usuri.ToString();
                }
                else
                {
                    await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                               "GetSuppressionFileUri", "Error",
                               "Unknown unsub file source: " + suppDetails);
                    throw new Exception("Unknown unsub file source.");
                }
            }
            catch (Exception findUnsubException)
            {
                await SqlWrapper.InsertErrorLog(this.ConnectionString, 1000, this.ApplicationName,
                               "GetSuppressionFileUri", "Exception",
                               "Exception finding unsub file source: " + suppDetails + "::" + findUnsubException.ToString());
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
            string networkType = network.GetS($"Credentials/NetworkType");
            int parallelism = Int32.Parse(network.GetS("Credentials/Parallelism"));

            if (networkType == "Amobee")
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
            else if (networkType == "Madrivo")
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
                           "ZipTester", "Error",
                           "Unknown file type: " + f.FullName + "::" + theText);
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
                           "UnknownTypeHandler", "Error",
                           "Unknown file type: " + fi.FullName);
            return new object();
        }        
    }
}
