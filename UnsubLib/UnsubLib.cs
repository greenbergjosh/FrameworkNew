﻿using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Timers;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Jw = Utility.JsonWrapper;
using Pw = Utility.ParallelWrapper;
using Fs = Utility.FileSystem;
using Sql = Utility.SqlWrapper;
using Utility;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Threading;
using UnsubLib.NetworkProviders;

namespace UnsubLib
{
    public class UnsubLib
    {
        // Set to true for debugging - always false in production
        public bool CallLocalLoadUnsubFiles;
        public bool UseLocalNetworkFile;
        public string LocalNetworkFilePath;
        public string ServerWorkingDirectory;
        public string ClientWorkingDirectory;
        public string SearchDirectory;
        public string ServerName;
        public string DatabaseName;
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
        public string SortBufferSize;
        public int FileCopyTimeout;
        private FrameworkWrapper _fw;

        public RoslynWrapper RosWrap;

        public const string MD5HANDLER = "Md5Handler";
        public const string PLAINTEXTHANDLER = "PlainTextHandler";
        public const string DOMAINHANDLER = "DomainZipHandler";
        public const string UNKNOWNHANDLER = "UnknownTypeHandler";
        private const int DefaultFileCopyTimeout = 5 * 60000; // 5mins
        private const string Conn = "Unsub";

        public UnsubLib(FrameworkWrapper fw)
        {
            _fw = fw;
            var config = _fw.StartupConfiguration;

            ServerWorkingDirectory = config.GetS("Config/ServerWorkingDirectory");
            ClientWorkingDirectory = config.GetS("Config/ClientWorkingDirectory");
            SearchDirectory = config.GetS("Config/SearchDirectory");
            ServerName = config.GetS("Config/ServerName");
            DatabaseName = config.GetS("Config/DatabaseName");
            FileCacheDirectory = config.GetS("Config/FileCacheDirectory");
            FileCacheFtpServer = config.GetS("Config/FileCacheFtpServer");
            FileCacheFtpUser = config.GetS("Config/FileCacheFtpUser");
            FileCacheFtpPassword = config.GetS("Config/FileCacheFtpPassword");
            WorkingFileCacheSize = Int64.Parse(config.GetS("Config/WorkingFileCacheSize"));
            SearchFileCacheSize = Int64.Parse(config.GetS("Config/SearchFileCacheSize"));
            UnsubServerUri = config.GetS("Config/UnsubServerUri");
            UnsubJobServerUri = config.GetS("Config/UnsubJobServerUri");
            DtExecPath = config.GetS("Config/DtExecPath");
            CallLocalLoadUnsubFiles = config.GetB("Config/CallLocalLoadUnsubFiles");
            UseLocalNetworkFile = config.GetB("Config/UseLocalNetworkFile");
            LocalNetworkFilePath = config.GetS("Config/LocalNetworkFilePath");
            // for diffs and loads
            MaxParallelism = Int32.Parse(config.GetS("Config/MaxParallelism"));
            // for downloads and uploads
            MaxConnections = Int32.Parse(config.GetS("Config/MaxConnections"));
            SeleniumChromeDriverPath = config.GetS("Config/SeleniumChromeDriverPath");
            FileCacheFtpServerPath = config.GetS("Config/FileCacheFtpServerPath");
            MinDiffFileSize = Int32.Parse(config.GetS("Config/MinDiffFileSize"));
            MaxDiffFilePercentage = float.Parse(config.GetS("Config/MaxDiffFilePercentage"));
            SortBufferSize = config.GetS("Config/SortBufferSize");

            if (int.TryParse(config.GetS("Config/FileCopyTimeout"), out var to)) FileCopyTimeout = to;
            else FileCopyTimeout = DefaultFileCopyTimeout;

            ServicePointManager.DefaultConnectionLimit = MaxConnections;

            var scripts = new List<ScriptDescriptor>();
            var scriptsPath = ServerWorkingDirectory + "\\Scripts";
            var rw = new RoslynWrapper(scripts, $@"{scriptsPath}\\debug");

            RosWrap = rw;
        }

        public async Task<IGenericEntity> GetNetworks(string singleNetworkName)
        {
            await _fw.Trace(nameof(GetNetworks), $"Before SelectNetwork {singleNetworkName ?? "null"}");

            var network = await Sql.SqlToGenericEntity(Conn, "SelectNetwork",
                    singleNetworkName != null ? Jw.Json(new { NetworkName = singleNetworkName }) : "{}", "");

            await _fw.Trace(nameof(GetNetworks), $"After SelectNetwork: {network.GetS("")} {singleNetworkName ?? "null"}");

            return network;
        }

        public async Task ManualDirectory(IGenericEntity network)
        {
            // Handle multiple days by doing them one at a time
            var now = DateTime.Now;
            var nowString = now.ToString("yyyyMMdd");

            var dirs = new List<DirectoryInfo>();
            var di = new DirectoryInfo(ClientWorkingDirectory + "\\Manual");

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
                await _fw.Log(nameof(ManualDirectory), $"Before ManualJob: {dir}");
                await ManualJob(dir, network);
                await _fw.Log(nameof(ManualDirectory), $"After ManualJob: {dir}");
            }
        }

        public async Task<string> ForceUnsub(IGenericEntity dtve)
        {
            var forceName = dtve.GetS("ForceName");

            await _fw.Err(ErrorSeverity.Log, nameof(ForceUnsub), ErrorDescriptor.Log, $"Starting ForceUnsub: {forceName}");

            var network = await Sql.SqlToGenericEntity(Conn, "SelectNetwork", "{}", "");

            foreach (var n in network.GetL(""))
            {
                var networkName = n.GetS("Name");

                await _fw.Log(nameof(ForceUnsub), $"Starting ForceUnsub({networkName}): {forceName}");
                await ForceDirectory(forceName, n);
                await _fw.Log(nameof(ForceUnsub), $"Completed ForceUnsub({networkName}): {forceName}");
            }

            await _fw.Log(nameof(ForceUnsub), $"Completed ForceUnsub: {forceName}");

            return Jw.Json(new { Result = "Success" });
        }

        public async Task ForceDirectory(string forceDirName, IGenericEntity network)
        {
            var dir = new DirectoryInfo(ClientWorkingDirectory + "\\Force\\" + forceDirName);
            var name = network.GetS("Name");

            await _fw.Trace(nameof(ForceDirectory), $"Starting ManualJob({name}): {dir}");
            await ManualJob(dir, network);
            await _fw.Trace(nameof(ForceDirectory), $"Completed ManualJob({name}): {dir}");
        }

        public async Task ManualJob(DirectoryInfo dir, IGenericEntity network)
        {
            var cd = new DirectoryInfo(dir.FullName + "\\" + network.GetS("Id").ToLower());
            IDictionary<string, string> idtof = new Dictionary<string, string>();
            var campaignsJson = new StringBuilder("[");
            var networkName = network.GetS("Name");

            foreach (var dd in cd.EnumerateDirectories())
            {
                // Each folder corresponds to a campaign to be processed

                await _fw.Log(nameof(ManualJob), $"ManualJob({networkName}) Processing: {dd.Name}");

                var networkCampaignId = dd.Name;
                var campaignJson = await File.ReadAllTextAsync(dd.FullName + "\\" + "json.txt");
                var ge = Jw.JsonToGenericEntity(campaignJson);
                var networkCampaignName = ge.GetS("NetworkName");

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

            await _fw.Log(nameof(ManualJob), $"ManualJob({networkName}) Campaigns: {campaignsJson}");

            var campaigns = await Sql.SqlToGenericEntity(Conn, "MergeNetworkCampaignsManual",
                    Jw.Json(new { NetworkId = network.GetS("Id").ToLower() }), campaignsJson.ToString());

            if (campaigns.GetS("Result") == "NoData")
            {
                await _fw.Log(nameof(ManualJob), "NoData");
                return;
            }
            else
            {
                await _fw.Log(nameof(ManualJob), $"ManualJob({networkName}) MergeNetworkCampaignsManual->: {campaigns}");
            }

            IDictionary<string, List<IGenericEntity>> uris =
               new Dictionary<string, List<IGenericEntity>>();
            foreach (var cmp in campaigns.GetL(""))
            {
                var ncid = cmp.GetS("NetworkCampaignId");
                if (idtof.ContainsKey(ncid))
                {
                    var fname = idtof[ncid];
                    uris.Add(fname, new List<IGenericEntity>() { cmp });
                }
            }

            await _fw.Log(nameof(ManualJob), $"ManualJob({networkName}) Calling ProcessUnsubFiles");

            await ProcessUnsubFiles(uris, network, campaigns);

            await _fw.Log(nameof(ManualJob), $"ManualJob({networkName}) Completed ProcessUnsubFiles");

            dir.Delete(true);
        }

        public async Task ScheduledUnsubJob(IGenericEntity network, string networkCampaignId = null)
        {
            // Get campaigns
            var networkName = network.GetS("Name");
            var networkProvider = NetworkProviders.Factory.GetInstance(_fw, network);

            IDictionary<string, List<IGenericEntity>> uris = new Dictionary<string, List<IGenericEntity>>();
            IGenericEntity cse;

            if (!networkCampaignId.IsNullOrWhitespace())
            {
                var campaign = (await Sql.SqlToGenericEntity(Conn, "SelectNetworkCampaigns", Jw.Json(new { NetworkId = network.GetS("Id") }), ""))
                    .GetL("")?.FirstOrDefault(c => c.GetS("NetworkCampaignId") == networkCampaignId);

                if (campaign == null)
                {
                    await _fw.Error(nameof(ScheduledUnsubJob), $"{network} campaign {network} has not been merged into database, this is required for single reprocessing");
                    return;
                }

                var uri = await GetSuppressionFileUri(network, campaign.GetS("NetworkUnsubRelationshipId"), networkProvider, network.GetS("Credentials/Parallelism").ParseInt() ?? 5);

                if (uri.IsNullOrWhitespace())
                {
                    await _fw.Error(nameof(ScheduledUnsubJob), $"{network} campaign {network} returned invalid suppression url: {uri.IfNullOrWhitespace("null")}");
                    return;
                }

                cse = Jw.JsonToGenericEntity($"[{campaign.GetS("")}]");
                uris.Add(uri, new List<IGenericEntity>() { campaign });
            }
            else
            {
                cse = await GetCampaignsScheduledJobs(network, networkProvider);

                // Get uris of files to download - maintain campaign association
                try
                {
                    uris = await GetUnsubUris(network, cse, networkProvider);
                }
                catch (HaltingException e)
                {
                    throw;
                }
                catch (Exception exGetUnsubUris)
                {
                    await _fw.Error(nameof(ScheduledUnsubJob), $"GetUnsubUris({networkName}):{exGetUnsubUris}");
                }
            }

            await _fw.Log(nameof(ScheduledUnsubJob), $"ScheduledUnsubJob({networkName}) Calling ProcessUnsubFiles");

            await ProcessUnsubFiles(uris, network, cse);

            await _fw.Log(nameof(ScheduledUnsubJob), $"ScheduledUnsubJob({networkName}) Completed ProcessUnsubFiles");
        }

        public async Task ProcessUnsubFiles(IDictionary<string, List<IGenericEntity>> uris, IGenericEntity network, IGenericEntity cse)
        {
            var networkName = network.GetS("Name");

            // Download unsub files
            var unsubFiles = await DownloadUnsubFiles(uris, network);

            // Generate diff list
            var campaignsWithNegativeDelta = new List<string>();
            var diffs = new HashSet<Tuple<string, string>>();
            foreach (var c in cse.GetL(""))
            {
                if (unsubFiles.Item1.ContainsKey(c.GetS("Id")))
                {
                    var newFileId = unsubFiles.Item1[c.GetS("Id")].ToLower();
                    var newFileName = newFileId + ".txt.srt";
                    var newFileSize = await GetFileSize(newFileName);

                    if (!string.IsNullOrEmpty(c.GetS("MostRecentUnsubFileId")))
                    {
                        var oldFileId = c.GetS("MostRecentUnsubFileId").ToLower();
                        var oldFileName = oldFileId + ".txt.srt";
                        var oldFileSize = await GetFileSize(oldFileName);

                        if ((c.GetS("MostRecentUnsubFileId").Length == 36) &&
                            (newFileSize > oldFileSize))
                        {
                            diffs.Add(new Tuple<string, string>(oldFileId, newFileId));
                        }

                        if (newFileSize < oldFileSize)
                        {
                            campaignsWithNegativeDelta.Add(c.GetS("Id"));

                            Fs.TryDeleteFile(ServerWorkingDirectory + "\\" + newFileName);

                            if (!String.IsNullOrEmpty(FileCacheDirectory))
                            {
                                Fs.TryDeleteFile(FileCacheDirectory + "\\" + newFileName);
                            }
                            else if (!String.IsNullOrEmpty(FileCacheFtpServer))
                            {
                                await ProtocolClient.DeleteFileFromFtpServer(
                                    FileCacheFtpServerPath + "/" + newFileName,
                                    FileCacheFtpServer,
                                    21,
                                    FileCacheFtpUser,
                                    FileCacheFtpPassword);
                            }
                        }
                    }
                }
            }

            // Update campaigns with new unsub files
            try
            {
                var campaignsWithPositiveDelta = new Dictionary<string, string>();

                foreach (var cmp in unsubFiles.Item1)
                {
                    if (!campaignsWithNegativeDelta.Contains(cmp.Key))
                        campaignsWithPositiveDelta.Add(cmp.Key, cmp.Value);
                }

                await Sql.SqlServerProviderEntry(Conn, "UpdateNetworkCampaignsUnsubFiles", "", Jw.Json("Id", "FId", campaignsWithPositiveDelta));
            }
            catch (Exception exUpdateCampaigns)
            {
                await _fw.Error(nameof(ProcessUnsubFiles), $"UpdateNetworkCampaignsUnsubFiles({networkName}):: {exUpdateCampaigns}");
            }

            // Signal server to load domain unsub files, diff md5 unsub files
            try
            {
                await SignalUnsubServerService(network, diffs, unsubFiles.Item2);
            }
            catch (Exception exSignal)
            {
                await _fw.Error(nameof(ProcessUnsubFiles), $"SignalUnsubServerService({networkName}):: {exSignal}");
            }
        }

        public async Task<IGenericEntity> GetCampaignsScheduledJobs(IGenericEntity network, INetworkProvider networkProvider)
        {
            var networkName = network.GetS("Name");
            var networkId = network.GetS("Id");
            var localNetworkFilePath = $"{LocalNetworkFilePath}/{networkName}-{networkId}.json";

            await _fw.Log(nameof(GetCampaignsScheduledJobs), $"UseLocalNetworkFiles = {UseLocalNetworkFile}");

            IGenericEntity campaigns;

            if (UseLocalNetworkFile)
            {
                await _fw.Trace(nameof(GetCampaignsScheduledJobs), $@"Reading Local Network File: {localNetworkFilePath}");
                campaigns = Jw.JsonToGenericEntity(File.ReadAllText($@"{LocalNetworkFilePath}\{networkId}.xml"));
            }
            else
            {
                campaigns = await networkProvider.GetCampaigns(network);

                File.WriteAllText(localNetworkFilePath, campaigns.GetS(""));
            }

            return campaigns;
        }

        public async Task<IDictionary<string, List<IGenericEntity>>> GetUnsubUris(IGenericEntity network, IGenericEntity campaigns, INetworkProvider networkProvider)
        {
            var networkName = network.GetS("Name");
            var parallelism = network.GetS("Credentials/Parallelism").ParseInt() ?? 5;
            var uris = new ConcurrentDictionary<string, List<IGenericEntity>>();
            var cancelToken = new CancellationTokenSource();
            Task task = null;

            try
            {
                task = campaigns.GetL("").ForEachAsync(parallelism, cancelToken.Token, async c =>
                {
                    var campaignId = c.GetS("NetworkCampaignId");
                    var unsubRelationshipId = c.GetS("NetworkUnsubRelationshipId");

                    try
                    {
                        if (cancelToken.IsCancellationRequested) return;

                        await _fw.Trace(nameof(GetUnsubUris), $"Calling GetSuppressionFileUri({networkName}):: for campaign {campaignId}");

                        var uri = await GetSuppressionFileUri(network, unsubRelationshipId, networkProvider, parallelism);

                        await _fw.Trace(nameof(GetUnsubUris), $"Completed GetSuppressionFileUri({networkName}):: for campaign {campaignId}");

                        if (!String.IsNullOrEmpty(uri))
                        {
                            if (uris.ContainsKey(uri)) uris[uri].Add(c);
                            else uris.TryAdd(uri, new List<IGenericEntity>() { c });
                        }
                    }
                    catch (HaltingException)
                    {
                        cancelToken.Cancel();
                        throw;
                    }
                    catch (Exception e)
                    {
                        await _fw.Error(nameof(GetUnsubUris), $"GetSuppressionFileUri({networkName}):: {network.GetS("Id")}::Failed to retrieve unsubscribe Id for {campaignId} {e}");
                    }
                });

                await task;
            }
            catch (Exception)
            {
                foreach (var e in task.Exception.InnerExceptions)
                {
                    if (e is HaltingException) throw e;
                }

                await _fw.Error(nameof(GetUnsubUris), $"Parallelism threw unhandled exception {task.Exception.UnwrapForLog()}");
            }

            return uris;
        }

        public async Task<Tuple<ConcurrentDictionary<string, string>, ConcurrentDictionary<string, string>>> DownloadUnsubFiles(IDictionary<string, List<IGenericEntity>> uris, IGenericEntity network)
        {
            var networkName = network.GetS("Name");
            var networkUnsubMethod = network.GetS("Credentials/UnsubMethod");
            var parallelism = Int32.Parse(network.GetS("Credentials/Parallelism"));

            await _fw.Log(nameof(DownloadUnsubFiles), $"Starting file downloads for {networkName}");

            var ncf = new ConcurrentDictionary<string, string>();
            var ndf = new ConcurrentDictionary<string, string>();

            await uris.ForEachAsync(parallelism, async uri =>
            {
                var logCtx = $"campaigns: {uri.Value.Select(v => v.GetS("id")).Join(":")}";

                try
                {
                    await _fw.Trace(nameof(DownloadUnsubFiles), $"Iteration({networkName}):: for url {uri.Key} for {logCtx}");

                    IDictionary<string, object> cf = new Dictionary<string, object>();
                    if (networkUnsubMethod == "ScheduledUnsubJob")
                    {
                        await _fw.Trace(nameof(DownloadUnsubFiles), $"Calling DownloadSuppressionFiles({networkName}):: for url {uri.Key}");

                        cf = await DownloadSuppressionFiles(network, uri.Key, logCtx);

                        await _fw.Trace(nameof(DownloadUnsubFiles), $"Completed DownloadSuppressionFiles({networkName}):: for url {uri.Key}");
                    }
                    else if (networkUnsubMethod == "ManualDirectory")
                    {
                        await _fw.Trace(nameof(DownloadUnsubFiles), $"Calling UnzipUnbuffered({networkName}):: for url {uri.Key}");

                        var fis = new FileInfo(uri.Key);
                        cf = await ProtocolClient.UnzipUnbuffered(uri.Key,
                                ZipTester,
                                new Dictionary<string, Func<FileInfo, Task<object>>>()
                                {
                                    { MD5HANDLER, f => Md5ZipHandler(f, logCtx) },
                                    { PLAINTEXTHANDLER, f => PlainTextHandler(f, logCtx) },
                                    { DOMAINHANDLER, f => DomainZipHandler(f, logCtx) },
                                    { UNKNOWNHANDLER, f => UnknownTypeHandler(f, logCtx) }
                                },
                                fis.DirectoryName,
                                ClientWorkingDirectory);

                        await _fw.Trace(nameof(DownloadUnsubFiles), $"Completed UnzipUnbuffered({networkName}):: for url {uri.Key}");
                    }

                    if (cf.ContainsKey(MD5HANDLER))
                    {
                        var fmd5 = cf[MD5HANDLER].ToString().ToLower();
                        var fileSize = new FileInfo(ClientWorkingDirectory + "\\" + fmd5 + ".txt").Length;

                        await _fw.Trace(nameof(DownloadUnsubFiles), $"RemoveNonAsciiFromFile({networkName}):: for file {fmd5}({fileSize})");

                        await UnixWrapper.RemoveNonAsciiFromFile(ClientWorkingDirectory,
                            fmd5 + ".txt", fmd5 + ".txt.cln");

                        fileSize = new FileInfo(ClientWorkingDirectory + "\\" + fmd5 + ".txt.cln").Length;

                        await _fw.Trace(nameof(DownloadUnsubFiles), $"RemoveNonMD5LinesFromFile({networkName}):: for file {fmd5}({fileSize})");

                        await UnixWrapper.RemoveNonMD5LinesFromFile(ClientWorkingDirectory, fmd5 + ".txt.cln", fmd5 + ".txt.cl2");

                        fileSize = new FileInfo(ClientWorkingDirectory + "\\" + fmd5 + ".txt.cl2").Length;

                        await _fw.Trace(nameof(DownloadUnsubFiles), $"SortFile({networkName}):: for file {fmd5}({fileSize})");

                        await UnixWrapper.SortFile(ClientWorkingDirectory, fmd5 + ".txt.cl2", fmd5 + ".txt.srt", false, true, 300000, 4, SortBufferSize);

                        fileSize = new FileInfo(ClientWorkingDirectory + "\\" + fmd5 + ".txt.srt").Length;

                        await _fw.Trace(nameof(DownloadUnsubFiles), $"Completed Cleaning({networkName}):: for file {fmd5}({fileSize})");

                        if (!String.IsNullOrEmpty(FileCacheDirectory))
                        {
                            await _fw.Trace(nameof(DownloadUnsubFiles), $"Starting UploadToDirectory({networkName}):: for file {fmd5}");

                            new FileInfo(ClientWorkingDirectory + "\\" + fmd5 + ".txt.srt")
                                .MoveTo(FileCacheDirectory + "\\" + fmd5 + ".txt.srt");

                            await _fw.Trace(nameof(DownloadUnsubFiles), $"Completed UploadToDirectory({networkName}):: for file {fmd5}");
                        }
                        else if (!String.IsNullOrEmpty(FileCacheFtpServer))
                        {
                            await _fw.Trace(nameof(DownloadUnsubFiles), $"Starting UploadToFtp({networkName}):: for file {fmd5}");

                            await ProtocolClient.UploadFile(
                                ClientWorkingDirectory + "\\" + fmd5 + ".txt.srt",
                                FileCacheFtpServerPath + "/" + fmd5 + ".txt.srt",
                                FileCacheFtpServer, FileCacheFtpUser, FileCacheFtpPassword);

                            await _fw.Trace(nameof(DownloadUnsubFiles), $"Completed UploadToFtp({networkName}):: for file {fmd5}");

                            Fs.TryDeleteFile($"{ClientWorkingDirectory}\\{fmd5 + ".txt.srt"}");
                        }

                        Fs.TryDeleteFile($"{ClientWorkingDirectory}\\{fmd5}.txt");
                        Fs.TryDeleteFile($"{ClientWorkingDirectory}\\{fmd5}.txt.cln");
                        Fs.TryDeleteFile($"{ClientWorkingDirectory}\\{fmd5}.txt.cl2");
                    }

                    if (cf.ContainsKey(DOMAINHANDLER))
                    {
                        var fdom = cf[DOMAINHANDLER].ToString().ToLower();

                        if (!String.IsNullOrEmpty(FileCacheDirectory))
                        {
                            await _fw.Trace(nameof(DownloadUnsubFiles), $"Starting UploadToDirectory({networkName}):: for file {fdom}");

                            new FileInfo(ClientWorkingDirectory + "\\" + fdom + ".txt")
                                .MoveTo(FileCacheDirectory + "\\" + fdom + ".txt");

                            await _fw.Trace(nameof(DownloadUnsubFiles), $"Completed UploadToDirectory({networkName}):: for file {fdom}");
                        }
                        else if (!String.IsNullOrEmpty(FileCacheFtpServer))
                        {
                            await _fw.Trace(nameof(DownloadUnsubFiles), $"Starting Upload({networkName}):: for file {fdom}");

                            await ProtocolClient.UploadFile(
                                    ClientWorkingDirectory + "\\" + fdom + ".txt",
                                    FileCacheFtpServerPath + "/" + fdom + ".txt",
                                    FileCacheFtpServer,
                                    FileCacheFtpUser,
                                    FileCacheFtpPassword);

                            await _fw.Trace(nameof(DownloadUnsubFiles), $"Completed Upload({networkName}):: for file {fdom}");

                            Fs.TryDeleteFile($"{ClientWorkingDirectory}\\{fdom}.txt");
                        }
                    }

                    foreach (var c in uri.Value)
                    {
                        if (cf.ContainsKey(MD5HANDLER))
                        {
                            var fmd5 = cf[MD5HANDLER].ToString();
                            if (!ncf.TryAdd(c.GetS("Id"), fmd5.ToLower()))
                            {
                                await _fw.Error(nameof(DownloadUnsubFiles), $"ncf.TryAdd Failed({networkName}):: {uri.Key}::{c.GetS("Id")}::{fmd5.ToLower()}");
                            }
                        }

                        if (cf.ContainsKey(DOMAINHANDLER))
                        {
                            var fdom = cf[DOMAINHANDLER].ToString();
                            if (!ndf.TryAdd(c.GetS("Id"), fdom.ToLower()))
                            {
                                await _fw.Error(nameof(DownloadUnsubFiles), $"ndf.TryAdd Failed({networkName}):: {uri.Key}::{c.GetS("Id")}::{fdom.ToLower()}");
                            }
                        }
                    }
                }
                catch (Exception exFile)
                {
                    await _fw.Error(nameof(DownloadUnsubFiles), $"OuterCatch({networkName})::{uri.Key}::{logCtx}::{exFile}");
                }
            });

            await _fw.Log(nameof(DownloadUnsubFiles), $"Finished file downloads for {networkName}");

            return new Tuple<ConcurrentDictionary<string, string>, ConcurrentDictionary<string, string>>(ncf, ndf);
        }

        public async Task SignalUnsubServerService(IGenericEntity network, HashSet<Tuple<string, string>> diffs, IDictionary<string, string> ndf)
        {
            var sbDiff = new StringBuilder("");
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

            var msg = Jw.Json(new
            {
                m = "LoadUnsubFiles",
                ntwrk = network.GetS("Name"),
                DomUnsub = Jw.Json("CId", "FId", ndf),
                Diff = sbDiff.ToString()
            },
                new bool[] { true, true, false, false });

            await _fw.Log(nameof(SignalUnsubServerService), msg);

            string result = null;

            if (!CallLocalLoadUnsubFiles)
            {
                await _fw.Log(nameof(SignalUnsubServerService), "Calling HttpPostAsync");

                result = await ProtocolClient.HttpPostAsync(UnsubJobServerUri, msg, "application/json", 1000 * 60);

                await _fw.Log(nameof(SignalUnsubServerService), "Completed HttpPostAsync");
            }
            else
            {
                IGenericEntity cse = new GenericEntityJson();
                var cs = JsonConvert.DeserializeObject(msg);
                cse.InitializeEntity(null, null, cs);

                await _fw.Log(nameof(SignalUnsubServerService), "Calling LoadUnsubFiles");

                result = await LoadUnsubFiles(cse);

                await _fw.Log(nameof(SignalUnsubServerService), "Completed LoadUnsubFiles");
            }

            if (result == null)
            {
                await _fw.Error(nameof(SignalUnsubServerService), "Null Result");
                throw new Exception("Null result");
            }
            else
            {
                await _fw.Log(nameof(SignalUnsubServerService), $"Result: {result}");
            }

            var res = (JObject)JsonConvert.DeserializeObject(result);
            IGenericEntity rese = new GenericEntityJson();
            rese.InitializeEntity(null, null, res);
            if (rese.GetS("Result") != "Success")
            {
                await _fw.Error(nameof(SignalUnsubServerService), $"Failure: {result}");
                throw new Exception(result);
            }
        }

        public async Task CleanUnusedFiles()
        {
            var campaigns = await Sql.SqlToGenericEntity(Conn, "SelectNetworkCampaigns", "{}", ""); var refdFiles = new HashSet<string>();

            foreach (var c in campaigns.GetL(""))
            {
                try
                {
                    if (c.GetS("MostRecentUnsubFileId") != null)
                        refdFiles.Add(c.GetS("MostRecentUnsubFileId").ToLower());
                }
                catch (Exception ex) { }
            }

            if (!String.IsNullOrEmpty(FileCacheDirectory))
            {
                var sourceDir = new DirectoryInfo(FileCacheDirectory);
                var files = sourceDir.GetFiles("*", SearchOption.TopDirectoryOnly);
                foreach (var file in files)
                {
                    var fileParts = file.Name.Split(new char[] { '.' });
                    if (!refdFiles.Contains(fileParts[0].ToLower()))
                        Fs.TryDeleteFile(file);
                }
            }
            else if (!String.IsNullOrEmpty(FileCacheFtpServer))
            {
                List<string> listFiles;
                listFiles = await ProtocolClient.FtpGetFiles(
                        FileCacheFtpServerPath,
                        FileCacheFtpServer,
                        FileCacheFtpUser,
                        FileCacheFtpPassword);

                foreach (var ftpFile in listFiles)
                {
                    var ftpFileParts = ftpFile.Split(new char[] { '.' });
                    if (!refdFiles.Contains(ftpFileParts[0].ToLower()))
                        await ProtocolClient.DeleteFileFromFtpServer(
                        FileCacheFtpServerPath + "/" + ftpFile.ToLower(),
                        FileCacheFtpServer,
                        21,
                        FileCacheFtpUser,
                        FileCacheFtpPassword);
                }
            }
            else
            {
                var sourceDir = new DirectoryInfo(ClientWorkingDirectory);
                var files = sourceDir.GetFiles("*.srt", SearchOption.TopDirectoryOnly);
                foreach (var file in files)
                {
                    var fileParts = file.Name.Split(new char[] { '.' });
                    if ((DateTime.UtcNow.Subtract(file.LastAccessTimeUtc).TotalDays > 1)
                        && (!refdFiles.Contains(fileParts[0].ToLower())))
                        Fs.TryDeleteFile(file);
                }
            }

            var sourceDirLocal = new DirectoryInfo(ClientWorkingDirectory);
            var filesLocal = sourceDirLocal.GetFiles("*", SearchOption.TopDirectoryOnly);
            foreach (var file in filesLocal)
            {
                Fs.TryDeleteFile(file);
            }

            try
            {
                await _fw.Log(nameof(CleanUnusedFiles), "Starting HttpPostAsync CleanUnusedFilesServer");

                await ProtocolClient.HttpPostAsync(UnsubServerUri, Jw.Json(new { m = "CleanUnusedFilesServer" }), "application/json", 1000 * 60);

                await _fw.Log(nameof(CleanUnusedFiles), "Completed HttpPostAsync CleanUnusedFilesServer");
            }
            catch (Exception exClean)
            {
                await _fw.Error(nameof(CleanUnusedFiles), $"HttpPostAsync CleanUnusedFilesServer: " + exClean.ToString());
            }
        }

        public async Task<string> CleanUnusedFilesServer()
        {
            try
            {
                await _fw.Log(nameof(CleanUnusedFilesServer), $"Starting CleanUnusedFilesServer");

                var sourceDirLocal = new DirectoryInfo(ServerWorkingDirectory);
                var filesLocal = sourceDirLocal.GetFiles("*", SearchOption.TopDirectoryOnly);
                foreach (var file in filesLocal)
                {
                    Fs.TryDeleteFile(file);
                }

                await _fw.Log(nameof(CleanUnusedFilesServer), $"Completed CleanUnusedFilesServer");
            }
            catch (Exception exClean)
            {
                await _fw.Error(nameof(CleanUnusedFilesServer), $"CleanUnusedFilesServer: " + exClean.ToString());
            }
            return Jw.Json(new { Result = "Success" });
        }

        public async Task<IGenericEntity> GetNetworkConfiguration(string conString, string networkName)
        {
            return await Sql.SqlToGenericEntity(Conn, "SelectNetwork", Jw.Json(new { NetworkName = networkName }), "");
        }

        public async Task<string> LoadUnsubFiles(IGenericEntity dtve)
        {
            var result = Jw.Json(new { Result = "Success" });

            if (!String.IsNullOrEmpty(FileCacheDirectory))
            {
                var sourceDir = new DirectoryInfo(FileCacheDirectory);
                var files = sourceDir.GetFiles("*.srt", SearchOption.TopDirectoryOnly);
                var sbAllFiles = new StringBuilder();
                foreach (var file in files)
                {
                    sbAllFiles.Append(file.Name + ":");
                }
                await _fw.Trace(nameof(LoadUnsubFiles), $"List of All Cached files(FileCacheDirectory): {sbAllFiles}");
            }
            else if (!String.IsNullOrEmpty(FileCacheFtpServer))
            {
                var allFiles = await ProtocolClient.FtpGetFiles("Unsub", FileCacheFtpServer, FileCacheFtpUser, FileCacheFtpPassword);
                var sbAllFiles = new StringBuilder();
                foreach (var fl in allFiles)
                {
                    sbAllFiles.Append(fl + ":");
                }
                await _fw.Trace(nameof(LoadUnsubFiles), $"List of All Cached files(FileCacheFtpServer): {sbAllFiles}");
            }

            try
            {
                //foreach (var x in dtve.GetL("DomUnsub"))
                await Pw.ForEachAsync(dtve.GetL("DomUnsub"), MaxParallelism, async x =>
                {
                    var tmpFileName = "";
                    var campaignId = "";
                    var fileId = "";

                    try
                    {
                        campaignId = x.GetS("CId");
                        fileId = x.GetS("FId").ToLower();

                        tmpFileName = await GetFileFromFileId(fileId, ".txt", ServerWorkingDirectory,
                            WorkingFileCacheSize, Guid.NewGuid().ToString().ToLower() + ".tmd");

                        var wd = ServerWorkingDirectory.Replace("\\", "\\\\");
                        await _fw.Log(nameof(LoadUnsubFiles), $"Calling spUploadDomainUnsubFile: {campaignId}::{wd}::{fileId}::{tmpFileName}");
                        await Sql.SqlServerProviderEntry(Conn, "UploadDomainUnsubFile", Jw.Json(new { CId = campaignId, Ws = wd, FId = fileId, Fn = tmpFileName }), "");
                        await _fw.Log(nameof(LoadUnsubFiles), $"Called spUploadDomainUnsubFile: {campaignId}::{wd}::{fileId}::{tmpFileName}");

                        Fs.TryDeleteFile(ServerWorkingDirectory + "\\" + tmpFileName);
                    }
                    catch (Exception exDomUnsub)
                    {
                        Fs.TryDeleteFile(ServerWorkingDirectory + "\\" + tmpFileName);

                        await _fw.Error(nameof(LoadUnsubFiles), $"spUploadDomainUnsubFile: {campaignId}::{fileId}::{tmpFileName}::{exDomUnsub}");
                    }
                });

                var domFiles = new List<string>();
                foreach (var cfp in dtve.GetL("DomUnsub"))
                {
                    var fid = cfp.GetS("FId").ToLower();
                    if (!domFiles.Contains(fid)) domFiles.Add(fid);
                }
                foreach (var domFile in domFiles)
                {
                    Fs.TryDeleteFile(ServerWorkingDirectory + "\\" + domFile + ".txt");

                    if (!String.IsNullOrEmpty(FileCacheDirectory))
                    {
                        Fs.TryDeleteFile(FileCacheDirectory + "\\" + domFile + ".txt");
                    }
                    else if (!String.IsNullOrEmpty(FileCacheFtpServer))
                    {
                        await ProtocolClient.DeleteFileFromFtpServer(
                            FileCacheFtpServerPath + "/" + domFile + ".txt",
                            FileCacheFtpServer,
                            21,
                            FileCacheFtpUser,
                            FileCacheFtpPassword);
                    }
                }

                //foreach (var x in dtve.GetL("Diff"))
                await Pw.ForEachAsync(dtve.GetL("Diff"), MaxParallelism, async x =>
                {
                    var oldf = x.GetS("oldf").ToLower();
                    var newf = x.GetS("newf").ToLower();
                    var oldfname = "";
                    var newfname = "";
                    var diffname = Guid.NewGuid().ToString().ToLower() + ".dif";

                    await _fw.Trace(nameof(LoadUnsubFiles), $"Before Diffing: {oldf}::{newf}");

                    try
                    {
                        oldfname = await GetFileFromFileId(oldf, ".txt.srt", ServerWorkingDirectory,
                            WorkingFileCacheSize, Guid.NewGuid().ToString().ToLower() + ".tdd");
                        newfname = await GetFileFromFileId(newf, ".txt.srt", ServerWorkingDirectory,
                            WorkingFileCacheSize, Guid.NewGuid().ToString().ToLower() + ".tdd");

                        var oldflength = new FileInfo(ServerWorkingDirectory + "\\" + oldfname).Length;
                        var newflength = new FileInfo(ServerWorkingDirectory + "\\" + newfname).Length;
                        var diffPerc = ((float)(newflength - oldflength)) / oldflength;

                        if (diffPerc < 0)
                        {
                            await _fw.Error(nameof(LoadUnsubFiles), $"Negative Diff: {oldf}::{oldfname}({oldflength})::{newf}::{newfname}({newflength})::Negative diff percentage");
                        }
                        else if (oldflength > 320000 && diffPerc > 0.2)
                        {
                            await _fw.Error(nameof(LoadUnsubFiles), $"Large Diff: {oldf}::{oldfname}({oldflength})::{newf}::{newfname}({newflength})::Over 20 percent");
                        }
                        else
                        {
                            await _fw.Trace(nameof(LoadUnsubFiles), $"Before Diffing: {oldf}::{oldfname}({oldflength})::{newf}::{newfname}({newflength})");

                            var res = await UnixWrapper.DiffFiles(
                                oldfname,
                                newfname,
                                ServerWorkingDirectory,
                                diffname);

                            await _fw.Trace(nameof(LoadUnsubFiles), $"After Diffing: {oldf}::{newf}");

                            var wd = ServerWorkingDirectory.Replace("\\", "\\\\");

                            await Sql.SqlServerProviderEntry(Conn, "UploadDiffFile", Jw.Json(new { Ws = wd, Fn = diffname }), "");
                            await _fw.Trace(nameof(LoadUnsubFiles), $"After BulkInsert: {oldf}::{newf}");
                        }
                    }
                    catch (Exception exDiff)
                    {
                        await _fw.Error(nameof(LoadUnsubFiles), $"Diff Failed: {oldfname}::{newfname}::{exDiff}");
                    }
                    finally
                    {
                        Fs.TryDeleteFile(ServerWorkingDirectory + "\\" + diffname);
                        Fs.TryDeleteFile(ServerWorkingDirectory + "\\" + newfname);
                        Fs.TryDeleteFile(ServerWorkingDirectory + "\\" + oldfname);
                    }
                });
            }
            catch (Exception ex)
            {
                await _fw.Error(nameof(LoadUnsubFiles), $"Outer Catch: {ex}");
                result = Jw.Json(new { Error = "Exception" });
            }

            await _fw.Log(nameof(LoadUnsubFiles), $"Finished {dtve.GetS("ntwrk")}: {result}");

            return result;
        }

        public async Task<string> GetCampaigns()
        {
            try
            {
                return await Sql.SqlServerProviderEntry(Conn, "SelectNetworkCampaignsWithPayload", "", "");
            }
            catch (Exception ex)
            {
                await _fw.Error(nameof(GetCampaigns), ex.ToString());
                return Jw.Json(new { Error = "Exception" });
            }
        }

        public async Task<long> GetFileSize(string fileName)
        {
            long fileSize = 0;

            try
            {
                if (!String.IsNullOrEmpty(FileCacheDirectory))
                {
                    fileSize = new FileInfo(FileCacheDirectory + "\\" + fileName).Length;
                }
                else if (!String.IsNullOrEmpty(FileCacheFtpServer))
                {
                    fileSize = await ProtocolClient.FtpGetFileSize(
                            FileCacheFtpServerPath + "/" + fileName,
                            FileCacheFtpServer,
                            FileCacheFtpUser,
                            FileCacheFtpPassword);
                }
                else
                {
                    fileSize = new FileInfo(ClientWorkingDirectory + "\\" + fileName).Length;
                }
            }
            catch (Exception fileSizeException)
            {
                await _fw.Error(nameof(GetFileSize), fileName + "::" + fileSizeException.ToString());
            }

            return fileSize;
        }

        public async Task<bool> MakeRoom(string fileName, long cacheSize)
        {
            try
            {
                long newFileSize = 0;

                if (!String.IsNullOrEmpty(FileCacheDirectory))
                {
                    newFileSize = new FileInfo(FileCacheDirectory + "\\" + fileName).Length;
                }
                else if (!String.IsNullOrEmpty(FileCacheFtpServer))
                {
                    newFileSize = await ProtocolClient.FtpGetFileSize(
                            FileCacheFtpServerPath + "/" + fileName,
                            FileCacheFtpServer,
                            FileCacheFtpUser,
                            FileCacheFtpPassword);
                }
                if (newFileSize > cacheSize)
                {
                    await _fw.Error(nameof(MakeRoom), $"File larger than cache: {fileName}");
                    return false;
                }

                var sourceDir = new DirectoryInfo(ServerWorkingDirectory);
                var files = sourceDir.GetFiles("*", SearchOption.TopDirectoryOnly);
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
                await _fw.Error(nameof(MakeRoom), fileName + "::" + makeRoomException.ToString());
                return false;
            }

            return true;
        }

        public async Task<string> GetFileFromFileId(string fileId, string ext, string destDir, long cacheSize, string destFileName = null)
        {
            const string tempSuffix = "_temp";
            var success = false;
            var fileName = fileId + ext;
            var dfileName = destFileName == null ? fileName : destFileName;
            var tempFile = new FileInfo($"{destDir}\\{dfileName}{tempSuffix}");
            var finalFile = new FileInfo($"{destDir}\\{dfileName}");

            if (!String.IsNullOrEmpty(FileCacheFtpServer) || !String.IsNullOrEmpty(FileCacheDirectory))
            {
                var di = new DirectoryInfo(destDir);
                var files = di.GetFiles(fileName);

                if (files.Length == 1) return fileName;
                else if (files.Length == 0)
                {
                    var fileCopyInProgress = false;

                    try
                    {
                        tempFile.Open(FileMode.CreateNew, FileAccess.Write, FileShare.None).Dispose();
                    }
                    catch (IOException)
                    {
                        fileCopyInProgress = true;
                    }

                    if (fileCopyInProgress)
                    {
                        await WaitForFileCopyInProcess(finalFile);

                        return finalFile.Name;
                    }
                    else
                    {
                        success = await MakeRoom(fileName, cacheSize);

                        if (!success)
                        {
                            await _fw.Error(nameof(GetFileFromFileId), $"Could not make room for file: {fileName}");
                            throw new Exception("Could not make room for file.");
                        }

                        if (!String.IsNullOrEmpty(FileCacheDirectory))
                        {
                            var cacheFile = new FileInfo($"{FileCacheDirectory}\\{fileName}");

                            await Task.Run(() => cacheFile.CopyTo(tempFile.FullName, true)).ConfigureAwait(false);
                            tempFile.MoveTo(finalFile.FullName);
                        }
                        else if (!String.IsNullOrEmpty(FileCacheFtpServer))
                        {
                            using (var fs = tempFile.Open(FileMode.Open, FileAccess.Write, FileShare.None))
                            {
                                await ProtocolClient.DownloadFileFtp(
                                    fs,
                                    FileCacheFtpServerPath + "/" + fileName,
                                    FileCacheFtpServer,
                                    FileCacheFtpUser,
                                    FileCacheFtpPassword
                                );
                            }

                            tempFile.MoveTo(finalFile.FullName);
                        }

                        files = di.GetFiles(dfileName);

                        if (files.Length == 1) return dfileName;
                        else
                        {
                            await _fw.Error(nameof(GetFileFromFileId), $"Could not find file in cache: {fileName}");
                            throw new Exception("Could not find file in cache: " + fileName);
                        }
                    }
                }
                else
                {
                    await _fw.Error(nameof(GetFileFromFileId), $"Too many file matches: {fileName}");
                    throw new Exception("Too many file matches: " + fileName);
                }
            }
            else
            {
                var di = new DirectoryInfo(destDir);
                var fi = di.GetFiles(fileName);

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
                    await _fw.Error(nameof(GetFileFromFileId), $"Could not find file locally: {fileName}");
                    throw new Exception("Could not find file locally: " + fileName);
                }
            }
        }

        private async Task WaitForFileCopyInProcess(FileInfo finalFile)
        {
            var tcs = new TaskCompletionSource<bool>();
            var watcher = new FileSystemWatcher(finalFile.Directory.FullName) { EnableRaisingEvents = true };
            var timer = new System.Timers.Timer(FileCopyTimeout) { AutoReset = false };

            void dispose()
            {
                watcher.Dispose();
                timer.Dispose();
            }
            void renamedHandler(object s, RenamedEventArgs e)
            {
                if (e.Name.Equals(finalFile.Name, StringComparison.CurrentCultureIgnoreCase))
                {
                    dispose();
                    tcs.TrySetResult(true);
                }
            }
            async void timerHandler(object s, ElapsedEventArgs e)
            {
                dispose();
                await _fw.Error(nameof(WaitForFileCopyInProcess), $"Timed out waiting for file copy initiated by other request: {finalFile.Name}");
                tcs.TrySetException(new TimeoutException($"Timed out waiting for other file copy process to finish: {finalFile.Name}"));
            }

            timer.Elapsed += timerHandler;
            watcher.Renamed += renamedHandler;

            // In case it completed during setup
            finalFile.Refresh();

            if (finalFile.Exists)
            {
                dispose();
                tcs.TrySetResult(true);
            }
            else timer.Start();

            await tcs.Task;
        }

        public async Task<string> GetFileFromCampaignId(string campaignId, string ext, string destDir, long cacheSize)
        {
            var c = await Sql.SqlToGenericEntity(Conn, "SelectNetworkCampaign", Jw.Json(new { CId = campaignId }), "");
            var fileId = c.GetS("MostRecentUnsubFileId")?.ToLower();

            if (fileId == null) return null;

            return await GetFileFromFileId(fileId, ext, destDir, cacheSize);
        }

        public async Task<string> ServerIsUnsub(string proxyRequest)
        {
            return await ProtocolClient.HttpPostAsync(UnsubServerUri,
                new Dictionary<string, string>() { { "", proxyRequest } }, 5 * 60, "application/json");
        }

        public async Task<string> IsUnsub(IGenericEntity dtve)
        {
            var campaignId = "";
            var emailMd5 = "";
            try
            {
                campaignId = dtve.GetS("CampaignId");
                emailMd5 = dtve.GetS("EmailMd5");
                if (emailMd5.Contains("@"))
                {
                    emailMd5 = Hashing.CalculateMD5Hash(emailMd5.ToLower());
                }
                var fileName = await GetFileFromCampaignId(campaignId, ".txt.srt", SearchDirectory, SearchFileCacheSize);

                if (fileName.IsNullOrWhitespace())
                {
                    await _fw.Error(nameof(IsUnsub), $"Unsub file missing for campaign id {campaignId}");
                    return Jw.Json(new { Result = false, Error = "Missing unsub file" });
                }

                var result = await UnixWrapper.BinarySearchSortedMd5File(
                    SearchDirectory,
                    fileName,
                    emailMd5);

                return Jw.Json(new { Result = result });
            }
            catch (Exception ex)
            {
                await _fw.Error(nameof(IsUnsub), $"Search failed: {campaignId}::{emailMd5}::{ex}");
                throw new Exception("Search failed.");
            }
        }

        public async Task<string> ServerForceUnsub(string proxyRequest)
        {
            return await ProtocolClient.HttpPostAsync(UnsubServerUri,
                new Dictionary<string, string>() { { "", proxyRequest } }, 10 * 60, "application/json");
        }

        public async Task<string> ServerIsUnsubList(string proxyRequest)
        {
            return await ProtocolClient.HttpPostAsync(UnsubServerUri,
                new Dictionary<string, string>() { { "", proxyRequest } }, 10 * 60, "application/json");
        }

        public async Task<string> IsUnsubList(IGenericEntity dtve)
        {
            var campaignId = "";
            var emailMd5 = new List<string>();
            var notFound = new List<string>();

            try
            {
                campaignId = dtve.GetS("CampaignId");
                foreach (var y in dtve.GetL("EmailMd5"))
                {
                    var emailFixed = y.GetS("");
                    if (emailFixed.Contains("@"))
                    {
                        emailFixed = Hashing.CalculateMD5Hash(emailFixed.ToLower());
                    }
                    emailMd5.Add(emailFixed);
                }

                var fileName = await GetFileFromCampaignId(campaignId, ".txt.srt", SearchDirectory, SearchFileCacheSize);

                if (fileName.IsNullOrWhitespace())
                {
                    await _fw.Error(nameof(IsUnsubList), $"Unsub file missing for campaign id {campaignId}");

                    return JsonConvert.SerializeObject(new { NotUnsub = new string[0], Error = "Missing unsub file" });
                }

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
                            var cmp = enrtr.Current.ToUpper().CompareTo(line.ToUpper());

                            if (cmp == 0)
                            {
                                enrtr.MoveNext();
                                break;
                            }
                            else if (cmp < 0)
                            {
                                notFound.Add(enrtr.Current);
                                enrtr.MoveNext();
                            }
                            else break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                await _fw.Error(nameof(IsUnsubList), $"Search failed: {campaignId}::{ex}");
                throw new Exception("Search failed.");
            }

            return Jw.Json("NotUnsub", notFound);
        }

        public async Task<string> GetSuppressionFileUri(IGenericEntity network, string unsubRelationshipId, INetworkProvider networkProvider, int maxConnections)
        {
            string uri = null;
            var networkName = network.GetS("Name");
            var fileLocationProviders = new UnsubFileProviders.IUnsubLocationProvider[]
            {
                new UnsubFileProviders.UnsubCentral(_fw),
                new UnsubFileProviders.Ezepo(_fw,SeleniumChromeDriverPath),
                new UnsubFileProviders.Optizmo(_fw),
                new UnsubFileProviders.MidEnity(_fw)
            };

            try
            {
                var locationUrl = await networkProvider.GetSuppresionLocationUrl(network, unsubRelationshipId);

                uri = locationUrl == null
                    ? null
                    : fileLocationProviders.Select(p => p.GetFileUrl(network, locationUrl).Result).FirstOrDefault(u => !u.IsNullOrWhitespace());

                if (uri.IsNullOrWhitespace())
                {
                    await _fw.Error(nameof(GetSuppressionFileUri), $"Failed to retrieve unsub file from: {networkName}:{unsubRelationshipId} {locationUrl}");
                }
            }
            catch (HaltingException)
            {
                throw;
            }
            catch (Exception e)
            {
                await _fw.Error(nameof(GetSuppressionFileUri), $"Exception finding unsub file source: {networkName}::{unsubRelationshipId}::{e}");
            }

            return uri;
        }

        public async Task<IDictionary<string, object>> DownloadSuppressionFiles(IGenericEntity network, string unsubUrl, string logContext)
        {
            IDictionary<string, object> dr = null;
            var networkName = network.GetS("Name");
            var parallelism = Int32.Parse(network.GetS("Credentials/Parallelism"));
            var uri = new Uri(unsubUrl);
            string authString = network.GetD("Credentials/DomainAuthStrings").FirstOrDefault(d => string.Equals(d.Item1, uri.Host, StringComparison.CurrentCultureIgnoreCase))?.Item2;
            
            dr = await ProtocolClient.DownloadUnzipUnbuffered(unsubUrl, authString, ZipTester,
                new Dictionary<string, Func<FileInfo, Task<object>>>()
                {
                    { MD5HANDLER, f =>  Md5ZipHandler(f,logContext) },
                    { PLAINTEXTHANDLER, f =>  PlainTextHandler(f,logContext) },
                    { DOMAINHANDLER, f =>  DomainZipHandler(f,logContext) },
                    { UNKNOWNHANDLER, f => UnknownTypeHandler(f,logContext) }
                },
                ClientWorkingDirectory, 30 * 60, parallelism);

            if (dr?.Any() == false) await _fw.Error(nameof(DownloadSuppressionFiles), $"No file downloaded {networkName} {unsubUrl} {logContext}");

            return dr;
        }

        public async Task<string> ZipTester(FileInfo f)
        {
            var theText = "";

            if (f.Length == 0)
            {
                await _fw.Error(nameof(ZipTester), f.FullName);
                return UNKNOWNHANDLER;
            }

            using (var sr = f.OpenText())
            {
                var buffer = new char[400];
                await sr.ReadAsync(buffer, 0, 400);
                theText = new string(buffer);

                var lines = theText.Split(
                    new[] { "\r\n", "\r", "\n" },
                    StringSplitOptions.None);

                var allMd5 = true;
                for (var l = 0; l < (lines.Length == 1 ? 1 : lines.Length - 1); l++)
                {
                    if (!Regex.IsMatch(lines[l], "^[0-9a-fA-F]{32}$"))
                    {
                        allMd5 = false;
                        break;
                    }
                }
                if (allMd5) return MD5HANDLER;

                var allPlain = true;
                for (var l = 0; l < (lines.Length == 1 ? 1 : lines.Length - 1); l++)
                {
                    if (!lines[l].Contains("@") || (lines[l][0] == '*') || (lines[l][0] == '@'))
                    {
                        allPlain = false;
                        break;
                    }
                }
                if (allPlain) return PLAINTEXTHANDLER;

                var allDom = true;
                for (var l = 0; l < (lines.Length == 1 ? 1 : lines.Length - 1); l++)
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

            await _fw.Error(nameof(ZipTester), $"Unknown file type: {f.FullName}::{theText}");
            return UNKNOWNHANDLER;
        }

        public async Task<object> Md5ZipHandler(FileInfo f, string logContext)
        {
            var fileName = Guid.NewGuid();
            f.MoveTo($"{ClientWorkingDirectory}\\{fileName}.txt");
            return fileName;
        }

        public async Task<object> PlainTextHandler(FileInfo f, string logContext)
        {
            var fileName = Guid.NewGuid();
            f.MoveTo($"{ClientWorkingDirectory}\\{fileName}.txt");
            return fileName;
        }

        public async Task<object> DomainZipHandler(FileInfo f, string logContext)
        {
            var fileName = Guid.NewGuid();
            f.MoveTo($"{ClientWorkingDirectory}\\{fileName}.txt");
            return fileName;
        }

        public async Task<object> UnknownTypeHandler(FileInfo fi, string logContext)
        {
            await _fw.Error(nameof(UnknownTypeHandler), $"Unknown file type: {fi.FullName} { logContext}");
            return new object();
        }
    }
}
