using Newtonsoft.Json;
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
using Utility;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Threading;
using UnsubLib.NetworkProviders;
using Utility.DataLayer;
using Utility.EDW.Logging;
using Utility.GenericEntity;

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
        public string FileCacheDirectory;
        public string FileImportDBDirectory;
        public string FileImportStagingDirectory;
        public string FileCacheFtpServer;
        public string FileCacheFtpUser;
        public string FileCacheFtpPassword;
        public long WorkingFileCacheSize;
        public long SearchFileCacheSize;
        public string UnsubServerUri;
        public string UnsubJobServerUri;
        public int MaxConnections;
        public int MaxParallelism;
        public string SeleniumChromeDriverPath;
        public string FileCacheFtpServerPath;
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
            FileCacheDirectory = config.GetS("Config/FileCacheDirectory");
            FileImportDBDirectory = config.GetS("Config/FileImportDBDirectory");
            FileImportStagingDirectory = config.GetS("Config/FileImportStagingDirectory");
            FileCacheFtpServer = config.GetS("Config/FileCacheFtpServer");
            FileCacheFtpUser = config.GetS("Config/FileCacheFtpUser");
            FileCacheFtpPassword = config.GetS("Config/FileCacheFtpPassword");
            WorkingFileCacheSize = Int64.Parse(config.GetS("Config/WorkingFileCacheSize"));
            SearchFileCacheSize = Int64.Parse(config.GetS("Config/SearchFileCacheSize"));
            UnsubServerUri = config.GetS("Config/UnsubServerUri");
            UnsubJobServerUri = config.GetS("Config/UnsubJobServerUri");
            CallLocalLoadUnsubFiles = config.GetB("Config/CallLocalLoadUnsubFiles");
            UseLocalNetworkFile = config.GetB("Config/UseLocalNetworkFile");
            LocalNetworkFilePath = config.GetS("Config/LocalNetworkFilePath");
            // for diffs and loads
            MaxParallelism = Int32.Parse(config.GetS("Config/MaxParallelism"));
            // for downloads and uploads
            MaxConnections = Int32.Parse(config.GetS("Config/MaxConnections"));
            SeleniumChromeDriverPath = config.GetS("Config/SeleniumChromeDriverPath");
            FileCacheFtpServerPath = config.GetS("Config/FileCacheFtpServerPath");
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

            var network = await Data.CallFn(Conn, "SelectNetwork",
                    singleNetworkName != null ? Jw.Serialize(new { NetworkName = singleNetworkName }) : "{}", "");

            await _fw.Trace(nameof(GetNetworks), $"After SelectNetwork: {network.GetS("")} {singleNetworkName ?? "null"}");

            return network;
        }

        public async Task ManualDirectory(IGenericEntity network, bool isManual)
        {
            var networkName = network.GetS("Name");
            var path = Path.Combine(ClientWorkingDirectory, "Manual", networkName);

            var di = new DirectoryInfo(path);

            if (!di.Exists)
            {
                await _fw.Log($"{nameof(ManualDirectory)}-{networkName}", $"No Manual dirs found at {path}");
                return;
            }

            await _fw.Log($"{nameof(ManualDirectory)}-{networkName}", $"Before ManualJob: {di}");
            await ManualJob(di, network);
            await _fw.Log($"{nameof(ManualDirectory)}-{networkName}", $"After ManualJob: {di}");
        }

        public async Task<string> ForceUnsub(IGenericEntity dtve)
        {
            var forceName = dtve.GetS("ForceName");

            await _fw.Err(ErrorSeverity.Log, nameof(ForceUnsub), ErrorDescriptor.Log, $"Starting ForceUnsub: {forceName}");

            var res = await Data.CallFn(Conn, "SelectNetwork", "{}", "");
            var network = res?.GetL("");

            if (network == null)
            {
                await _fw.Error(nameof(ForceUnsub), $"GetNetworks DB call failed. Response: {res?.GetS("")}");
                return Jw.Serialize(new { Result = "Failed" });
            }

            if (!network.Any())
            {
                await _fw.Error(nameof(ForceUnsub), $"Network(s) not found. Response: {res.GetS("")}");
                return Jw.Serialize(new { Result = "Failed" });
            }

            foreach (var n in network)
            {
                var networkName = n.GetS("Name");

                await _fw.Log($"{nameof(ForceUnsub)}-{networkName}", $"Starting ForceUnsub({networkName}): {forceName}");
                await ForceDirectory(forceName, n);
                await _fw.Log($"{nameof(ForceUnsub)}-{networkName}", $"Completed ForceUnsub({networkName}): {forceName}");
            }

            await _fw.Log(nameof(ForceUnsub), $"Completed ForceUnsub: {forceName}");

            return Jw.Serialize(new { Result = "Success" });
        }

        public async Task ForceDirectory(string forceDirName, IGenericEntity network)
        {
            var dir = new DirectoryInfo(ClientWorkingDirectory + "\\Force\\" + forceDirName);
            var networkName = network.GetS("Name");

            await _fw.Trace($"{nameof(ForceDirectory)}-{networkName}", $"Starting: {dir}");
            await ManualJob(dir, network);
            await _fw.Trace($"{nameof(ForceDirectory)}-{networkName}", $"Completed: {dir}");
        }

        public async Task ManualJob(DirectoryInfo dir, IGenericEntity network)
        {
            var networkName = network.GetS("Name");
            var networkId = network.GetS("Id");
            var drx = new Regex(@"(?<type>(c|r))-(?<id>\d+)", RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.ExplicitCapture);
            IEnumerable<DirectoryInfo> EnumerateCampaignDirs() => dir.EnumerateDirectories().Where(d => d.Name.IsMatch(drx));
            var campaignDirs = EnumerateCampaignDirs().Select(d =>
            {
                var ms = drx.Matches(d.Name);
                FileInfo unsubFile = null;
                FileInfo campaignDataFile = null;
                string type = null;
                string id = null;

                if (ms?.Count() == 1 && ms.First().Success)
                {
                    var m = ms.First();

                    type = m.Groups["type"].Value;
                    id = m.Groups["id"].Value;
                    unsubFile = new FileInfo(d.PathCombine("unsub.zip"));
                    campaignDataFile = new FileInfo(Path.Combine(d.FullName, "json.txt"));
                }

                return new { dir = d, type, id, unsubFile, campaignDataFile };
            }).Where(cd => cd.unsubFile?.Exists == true && !cd.id.IsNullOrWhitespace() && !cd.type.IsNullOrWhitespace()).ToArray();

            if (campaignDirs.Any() != true)
            {
                await _fw.Log($"{nameof(ManualDirectory)}-{networkName}", $"No Manual sub dirs found at {dir.FullName}");
                return;
            }

            var unsubFiles = new List<(FileInfo unsub, IEnumerable<IGenericEntity> campaigns)>();

            await _fw.Log($"{nameof(ManualJob)}-{networkName}", $"Processing Manual Dir");

            foreach (var cd in campaignDirs)
            {
                await _fw.Log($"{nameof(ManualJob)}-{networkName}", $"Processing: {cd.dir.Name}");

                try
                {
                    if (cd.type == "c")
                    {
                        var networkCampaignId = cd.id;

                        if (cd.campaignDataFile.Exists)
                        {
                            var campaignJson = await cd.campaignDataFile.ReadAllTextAsync();
                            var args = Jw.Serialize(new
                            {
                                NetworkId = networkId,
                                PayloadType = "json",
                                DataPath = "$",
                                CampaignIdPath = network.GetS("Credentials/CampaignIdPath"),
                                RelationshipPath = network.GetS("Credentials/UnsubRelationshipPath"),
                                NamePath = network.GetS("Credentials/CampaignNamePath")
                            });
                            var res = await Data.CallFn(Conn, "MergeNetworkCampaigns", args, campaignJson);

                            if (res == null || res.GetS("result") == "failed")
                            {
                                await _fw.Error($"{nameof(ManualDirectory)}-{networkName}", $"Failed to merge campaings. Response: {res?.GetS("") ?? "[null]"}");
                            }
                            else unsubFiles.Add((cd.unsubFile, new[] { res }));
                        }
                        else
                        {
                            var res = await Data.CallFn(Conn, "SelectNetworkCampaign", Jw.Serialize(new { ncid = networkCampaignId, nid = networkId }));

                            if (res?.GetS("Id").ParseGuid().HasValue != true)
                            {
                                await _fw.Error($"{nameof(ManualJob)}-{networkName}",
                                    $"Failed to retrieve campaign details from db: NetworkCampaignId:{networkCampaignId} NetworkId:{networkId} Response: {res?.GetS("") ?? "[null]"}");
                                continue;
                            }

                            unsubFiles.Add((cd.unsubFile, new[] { res }));
                        }
                    }
                    else if (cd.type == "r")
                    {
                        var unsubRelId = cd.id;
                        var res = await Data.CallFn(Conn, "SelectNetworkCampaigns", Jw.Serialize(new { nr = unsubRelId, NetworkId = networkId }));

                        if (res == null || res.GetS("result") == "failed")
                        {
                            await _fw.Error($"{nameof(ManualJob)}-{networkName}", $"Campaign lookup failed. Response: {res?.GetS("") ?? "[null]"}");
                            continue;
                        }

                        var cmps = res?.GetL("").ToArray();

                        if (!cmps.Any())
                        {
                            await _fw.Error($"{nameof(ManualJob)}-{networkName}", $"No campaigns found: Network: {networkName} {networkId} NetworkUnsubRelationshipId: {unsubRelId} ");
                            continue;
                        }

                        unsubFiles.Add((cd.unsubFile, cmps));
                    }
                }
                catch (Exception e)
                {
                    await _fw.Error($"{nameof(ManualJob)}-{networkName}", $"Failed to retrieve campaign details: NetworkId:{networkId}\r\n{Jw.Serialize(cd)}\r\n{e.UnwrapForLog()}");
                }
            }

            if (!unsubFiles.Any())
            {
                await _fw.Log($"{nameof(ManualJob)}-{networkName}", $"No campaigns to process");
                return;
            }

            await _fw.Log($"{nameof(ManualJob)}-{networkName}", $"Calling ProcessUnsubFiles");

            await ProcessUnsubFiles(unsubFiles.ToDictionary(u => u.unsub.FullName, u => u.campaigns.ToList()), network, unsubFiles.SelectMany(u => u.campaigns).ToArray(), true);

            await _fw.Log($"{nameof(ManualJob)}-{networkName}", $"Completed ProcessUnsubFiles");

            var cleanUp = unsubFiles.Select(u => u.unsub.Directory).DistinctBy(u => u.FullName);

            cleanUp.ForEach(d =>
                        {
                            try
                            {
                                d.Delete(true);
                            }
                            catch (Exception e)
                            {
                                _fw.Error($"{nameof(ManualJob)}-{networkName}", $"Failed to delete manual folder after processing:\r\n{d.FullName}\r\n{e.UnwrapForLog()}").Wait();
                            }
                        });
        }

        public async Task ScheduledUnsubJob(IGenericEntity network, string networkCampaignId = null)
        {
            // Get campaigns
            var networkId = network.GetS("Id");
            var networkName = network.GetS("Name");
            var networkProvider = NetworkProviders.Factory.GetInstance(_fw, network);

            IDictionary<string, List<IGenericEntity>> uris = new Dictionary<string, List<IGenericEntity>>();
            IGenericEntity cse;

            if (networkCampaignId.IsNullOrWhitespace())
            {
                cse = await GetCampaignsScheduledJobs(network, networkProvider);

                if (cse == null)
                {
                    await _fw.Error($"{nameof(ScheduledUnsubJob)}-{networkName}", $"GetUnsubUris({networkName}): Null campaigns returned");
                    return;
                }

                if (network.GetS("Credentials/ManualFile").ParseBool() == true) return;

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
                    await _fw.Error($"{nameof(ScheduledUnsubJob)}-{networkName}", $"GetUnsubUris({networkName}):{exGetUnsubUris}");
                }
            }
            else
            {
                var res = await Data.CallFn(Conn, "SelectNetworkCampaigns", Jw.Json(new { NetworkId = networkId }), "");

                if (res == null || res.GetS("result") == "failed")
                {
                    await _fw.Error($"{nameof(ScheduledUnsubJob)}-{networkName}", $"Campaign lookup failed. Response: {res?.GetS("") ?? "[null]"}");
                    return;
                }

                var campaign = res
                    .GetL("")?.FirstOrDefault(c => c.GetS("NetworkCampaignId") == networkCampaignId);

                if (campaign == null)
                {
                    await _fw.Error($"{nameof(ScheduledUnsubJob)}-{networkName}", $"{networkName} campaign {networkCampaignId} has not been merged into database, this is required for single reprocessing");
                    return;
                }

                var uri = await GetSuppressionFileUri(network, campaign.GetS("NetworkUnsubRelationshipId"), networkProvider,
                    network.GetS("Credentials/Parallelism").ParseInt() ?? 5);

                if (uri.IsNullOrWhitespace())
                {
                    await _fw.Error($"{nameof(ScheduledUnsubJob)}-{networkName}", $"{networkName} campaign {networkCampaignId} returned invalid suppression url: {uri.IfNullOrWhitespace("null")}");
                    return;
                }

                cse = Jw.JsonToGenericEntity($"[{campaign.GetS("")}]");
                uris.Add(uri, new List<IGenericEntity>() { campaign });
            }

            await _fw.Log($"{nameof(ScheduledUnsubJob)}-{networkName}", $"ScheduledUnsubJob({networkName}) Calling ProcessUnsubFiles");

            var bad = uris.Where(u => u.Value?.Any() != true).ToArray();

            await ProcessUnsubFiles(uris, network, cse.GetL(""), false);

            await _fw.Log($"{nameof(ScheduledUnsubJob)}-{networkName}", $"ScheduledUnsubJob({networkName}) Completed ProcessUnsubFiles");
        }

        public async Task ProcessUnsubFiles(IDictionary<string, List<IGenericEntity>> uris, IGenericEntity network, IEnumerable<IGenericEntity> cse, bool isManual)
        {
            var networkName = network.GetS("Name");

            // Download unsub files
            var unsubFiles = await DownloadUnsubFiles(uris, network, isManual);

            // Generate diff list
            var campaignsWithNegativeDelta = new List<string>();
            var diffs = new HashSet<Tuple<string, string>>();

            foreach (var c in cse)
            {
                if (unsubFiles.Item1.ContainsKey(c.GetS("Id")))
                {
                    var newFileId = unsubFiles.Item1[c.GetS("Id")].ToLower();
                    var newFileName = newFileId + ".txt.srt";
                    var newFileSize = await GetFileSize(newFileName);

                    if (!newFileSize.HasValue)
                    {
                        await _fw.Error($"{nameof(ProcessUnsubFiles)}-{networkName}", $"New file not found. File Name: {newFileName} Campaign: {c.GetS("") ?? "[null]"}");
                        continue;
                    }

                    if (!string.IsNullOrEmpty(c.GetS("MostRecentUnsubFileId")))
                    {
                        var oldFileId = c.GetS("MostRecentUnsubFileId").ToLower();
                        var oldFileName = oldFileId + ".txt.srt";
                        var oldFileSize = await GetFileSize(oldFileName);

                        if (!oldFileSize.HasValue)
                        {
                            await _fw.Error($"{nameof(ProcessUnsubFiles)}-{networkName}", $"Old file not found. File Name: {oldFileName} Campaign: {c.GetS("") ?? "[null]"}");
                            continue;
                        }

                        if (c.GetS("MostRecentUnsubFileId").Length == 36 && newFileSize.Value > oldFileSize.Value)
                        {
                            diffs.Add(new Tuple<string, string>(oldFileId, newFileId));
                        }

                        if (newFileSize.Value < oldFileSize.Value)
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

                var res = await Data.CallFn(Conn, "UpdateNetworkCampaignsUnsubFiles", "", Jw.Json("Id", "FId", campaignsWithPositiveDelta));

                if (res?.GetS("result") != "success") await _fw.Error($"{nameof(ProcessUnsubFiles)}-{networkName}", $"Failed to update unsub files for {networkName}. Response: {res?.GetS("") ?? "[null]"}");

            }
            catch (Exception exUpdateCampaigns)
            {
                await _fw.Error($"{nameof(ProcessUnsubFiles)}-{networkName}", $"Failed to update unsub files for {networkName}:: {exUpdateCampaigns}");
            }

            // Signal server to load domain unsub files, diff md5 unsub files
            try
            {
                await SignalUnsubServerService(network, diffs, unsubFiles.Item2);
            }
            catch (Exception exSignal)
            {
                await _fw.Error($"{nameof(ProcessUnsubFiles)}-{networkName}", $"Failed to signal UnsubJobServer: {exSignal}");
            }
        }

        public async Task<IGenericEntity> GetCampaignsScheduledJobs(IGenericEntity network, INetworkProvider networkProvider)
        {
            var networkName = network.GetS("Name");
            var networkId = network.GetS("Id");
            var localNetworkFilePath = $"{LocalNetworkFilePath}/{networkName}-{networkId}.json";

            await _fw.Log($"{nameof(GetCampaignsScheduledJobs)}-{networkName}", $"UseLocalNetworkFiles = {UseLocalNetworkFile}");

            IGenericEntity campaigns;

            if (UseLocalNetworkFile)
            {
                await _fw.Trace($"{nameof(GetCampaignsScheduledJobs)}-{networkName}", $"Reading Local Network File: {localNetworkFilePath}");
                campaigns = Jw.JsonToGenericEntity(File.ReadAllText(localNetworkFilePath));
            }
            else
            {
                campaigns = await networkProvider.GetCampaigns(network);

                if (campaigns != null) File.WriteAllText(localNetworkFilePath, campaigns.GetS(""));
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

            parallelism = MaxParallelism < parallelism ? MaxParallelism : parallelism;

            try
            {
                task = campaigns.GetL("").ForEachAsync(parallelism, cancelToken.Token, async c =>
                {
                    var campaignId = c.GetS("NetworkCampaignId");
                    var unsubRelationshipId = c.GetS("NetworkUnsubRelationshipId");

                    try
                    {
                        if (cancelToken.IsCancellationRequested) return;

                        await _fw.Trace($"{nameof(GetUnsubUris)}-{networkName}", $"Getting file url for {networkName} campaign {campaignId}");

                        var uri = await GetSuppressionFileUri(network, unsubRelationshipId, networkProvider, parallelism);

                        await _fw.Trace($"{nameof(GetUnsubUris)}-{networkName}", $"Retrieved file url for {networkName} campaign {campaignId}");

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
                        await _fw.Error($"{nameof(GetUnsubUris)}-{networkName}", $"FAiled to get file url for {networkName} campaign {campaignId}: {e}");
                    }
                });

                await task;
            }
            catch (Exception ex)
            {
                foreach (var e in task.Exception.InnerExceptions)
                {
                    if (e is HaltingException) throw ex;
                }

                await _fw.Error($"{nameof(GetUnsubUris)}-{networkName}", $"Parallelism threw unhandled exception {task.Exception.UnwrapForLog()}");
            }

            return uris;
        }

        public async Task<Tuple<ConcurrentDictionary<string, string>, ConcurrentDictionary<string, string>>> DownloadUnsubFiles(IDictionary<string, List<IGenericEntity>> uris, IGenericEntity network, bool isManual)
        {
            var networkName = network.GetS("Name");
            var networkUnsubMethod = network.GetS("Credentials/UnsubMethod");
            var parallelism = Int32.Parse(network.GetS("Credentials/Parallelism"));

            parallelism = MaxParallelism < parallelism ? MaxParallelism : parallelism;

            await _fw.Log($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Starting file downloads for {networkName}");

            var ncf = new ConcurrentDictionary<string, string>();
            var ndf = new ConcurrentDictionary<string, string>();

            await uris.ForEachAsync(parallelism, async uri =>
            {
                var logCtx = $"campaigns: {uri.Value.Select(v => v.GetS("Id")).Join(":")}";

                try
                {
                    await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Iteration({networkName}):: for url {uri.Key} for {logCtx}");

                    IDictionary<string, object> cf = new Dictionary<string, object>();
                    if (!isManual)
                    {
                        await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Calling DownloadSuppressionFiles({networkName}):: for url {uri.Key}");

                        cf = await DownloadSuppressionFiles(network, uri.Key, logCtx);

                        await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Completed DownloadSuppressionFiles({networkName}):: for url {uri.Key}");
                    }
                    else if (isManual)
                    {
                        await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Calling UnzipUnbuffered({networkName}):: for url {uri.Key}");

                        var fis = new FileInfo(uri.Key);
                        cf = await ProtocolClient.UnzipUnbuffered(fis.Name,
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

                        await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Completed UnzipUnbuffered({networkName}):: for url {uri.Key}");
                    }

                    if (cf.ContainsKey(MD5HANDLER) || cf.ContainsKey(PLAINTEXTHANDLER))
                    {
                        string fmd5;
                        long fileSize;

                        if (cf.ContainsKey(MD5HANDLER))
                        {
                            fmd5 = cf[MD5HANDLER].ToString().ToLower();

                            fileSize = new FileInfo(ClientWorkingDirectory + "\\" + fmd5 + ".txt").Length;

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"RemoveNonAsciiFromFile({networkName}):: for file {fmd5}({fileSize})");

                            await UnixWrapper.RemoveNonAsciiFromFile(ClientWorkingDirectory, fmd5 + ".txt", fmd5 + ".txt.cln");

                            fileSize = new FileInfo(ClientWorkingDirectory + "\\" + fmd5 + ".txt.cln").Length;

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"RemoveNonMD5LinesFromFile({networkName}):: for file {fmd5}({fileSize})");

                            await UnixWrapper.RemoveNonMD5LinesFromFile(ClientWorkingDirectory, fmd5 + ".txt.cln", fmd5 + ".txt.cl2");

                        }
                        else
                        {
                            var plainTextFile = new FileInfo(Path.Combine(ClientWorkingDirectory, cf[PLAINTEXTHANDLER].ToString().ToLower() + ".txt"));
                            var fmd5G = Guid.NewGuid();
                            fmd5 = fmd5G.ToString();

                            fileSize = plainTextFile.Length;

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"MD5 plain text file {plainTextFile.Name}({fileSize})");

                            using (var fs = plainTextFile.OpenText())
                            using (var ws = File.CreateText(Path.Combine(ClientWorkingDirectory, $"{fmd5}.txt.cl2")))
                            {
                                string line;

                                while ((line = await fs.ReadLineAsync()) != null)
                                {
                                    if (!line.IsNullOrWhitespace()) await ws.WriteLineAsync(Hashing.Utf8MD5HashAsHexString(line.Trim()));
                                }
                            }

                            cf[MD5HANDLER] = fmd5G;

                            try
                            {
                                plainTextFile.Delete();
                            }
                            catch (Exception e)
                            {
                                
                            }
                        }

                        fileSize = new FileInfo(ClientWorkingDirectory + "\\" + fmd5 + ".txt.cl2").Length;

                        await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"SortFile({networkName}):: for file {fmd5}({fileSize})");

                        await UnixWrapper.SortFile(ClientWorkingDirectory, fmd5 + ".txt.cl2", fmd5 + ".txt.srt", false, true, 300000, 4, SortBufferSize);

                        fileSize = new FileInfo(ClientWorkingDirectory + "\\" + fmd5 + ".txt.srt").Length;

                        await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Completed Cleaning({networkName}):: for file {fmd5}({fileSize})");

                        if (!String.IsNullOrEmpty(FileCacheDirectory))
                        {
                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Starting UploadToDirectory({networkName}):: for file {fmd5}");

                            new FileInfo(ClientWorkingDirectory + "\\" + fmd5 + ".txt.srt")
                                .MoveTo(FileCacheDirectory + "\\" + fmd5 + ".txt.srt");

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Completed UploadToDirectory({networkName}):: for file {fmd5}");
                        }
                        else if (!String.IsNullOrEmpty(FileCacheFtpServer))
                        {
                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Starting UploadToFtp({networkName}):: for file {fmd5}");

                            await ProtocolClient.UploadFile(
                                ClientWorkingDirectory + "\\" + fmd5 + ".txt.srt",
                                FileCacheFtpServerPath + "/" + fmd5 + ".txt.srt",
                                FileCacheFtpServer, FileCacheFtpUser, FileCacheFtpPassword);

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Completed UploadToFtp({networkName}):: for file {fmd5}");

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
                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Starting UploadToDirectory({networkName}):: for file {fdom}");

                            new FileInfo(ClientWorkingDirectory + "\\" + fdom + ".txt")
                                .MoveTo(FileCacheDirectory + "\\" + fdom + ".txt");

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Completed UploadToDirectory({networkName}):: for file {fdom}");
                        }
                        else if (!String.IsNullOrEmpty(FileCacheFtpServer))
                        {
                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Starting Upload({networkName}):: for file {fdom}");

                            await ProtocolClient.UploadFile(
                                    ClientWorkingDirectory + "\\" + fdom + ".txt",
                                    FileCacheFtpServerPath + "/" + fdom + ".txt",
                                    FileCacheFtpServer,
                                    FileCacheFtpUser,
                                    FileCacheFtpPassword);

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Completed Upload({networkName}):: for file {fdom}");

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
                                await _fw.Error($"{nameof(DownloadUnsubFiles)}-{networkName}", $"ncf.TryAdd Failed({networkName}):: {uri.Key}::{c.GetS("Id")}::{fmd5.ToLower()}");
                            }
                        }

                        if (cf.ContainsKey(DOMAINHANDLER))
                        {
                            var fdom = cf[DOMAINHANDLER].ToString();
                            if (!ndf.TryAdd(c.GetS("Id"), fdom.ToLower()))
                            {
                                await _fw.Error($"{nameof(DownloadUnsubFiles)}-{networkName}", $"ndf.TryAdd Failed({networkName}):: {uri.Key}::{c.GetS("Id")}::{fdom.ToLower()}");
                            }
                        }
                    }
                }
                catch (Exception exFile)
                {
                    await _fw.Error($"{nameof(DownloadUnsubFiles)}-{networkName}", $"OuterCatch::{uri.Key}::{logCtx}::{exFile}");
                }
            });

            await _fw.Log($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Finished file downloads for {networkName}");

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

            var networkName = network.GetS("Name");
            var msg = Jw.Json(new
            {
                m = "LoadUnsubFiles",
                ntwrk = networkName,
                DomUnsub = Jw.Json("CId", "FId", ndf),
                Diff = sbDiff.ToString()
            },
                new bool[] { true, true, false, false });

            await _fw.Log($"{nameof(SignalUnsubServerService)}-{networkName}", msg);

            string result = null;

            if (!CallLocalLoadUnsubFiles)
            {
                await _fw.Log($"{nameof(SignalUnsubServerService)}-{networkName}", "Calling HttpPostAsync");

                result = await ProtocolClient.HttpPostAsync(UnsubJobServerUri, msg, "application/json", 1000 * 60);

                await _fw.Log($"{nameof(SignalUnsubServerService)}-{networkName}", "Completed HttpPostAsync");
            }
            else
            {
                IGenericEntity cse = new GenericEntityJson();
                var cs = JsonConvert.DeserializeObject(msg);
                cse.InitializeEntity(null, null, cs);

                await _fw.Log($"{nameof(SignalUnsubServerService)}-{networkName}", "Calling LoadUnsubFiles");

                result = await LoadUnsubFiles(cse);

                await _fw.Log($"{nameof(SignalUnsubServerService)}-{networkName}", "Completed LoadUnsubFiles");
            }

            if (result == null)
            {
                await _fw.Error($"{nameof(SignalUnsubServerService)}-{networkName}", "Null Result");
                throw new Exception("Null result");
            }
            else
            {
                await _fw.Log($"{nameof(SignalUnsubServerService)}-{networkName}", $"Result: {result}");
            }

            var res = (JObject)JsonConvert.DeserializeObject(result);
            IGenericEntity rese = new GenericEntityJson();
            rese.InitializeEntity(null, null, res);
            if (rese.GetS("Result") != "Success")
            {
                await _fw.Error($"{nameof(SignalUnsubServerService)}-{networkName}", $"Failure: {result}");
                throw new Exception(result);
            }
        }

        public async Task CleanUnusedFiles()
        {
            var campaigns = await Data.CallFn(Conn, "SelectNetworkCampaigns", "{}", "");
            var refdFiles = new HashSet<string>();

            if (campaigns == null || campaigns.GetS("result") == "failed")
            {
                await _fw.Error(nameof(CleanUnusedFiles), $"Campaign lookup failed. Response: {campaigns?.GetS("") ?? "[null]"}");
                throw new HaltingException($"Campaign lookup failed. Response: {campaigns?.GetS("") ?? "[null]"}", null);
            }

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

#if DEBUG
            if (!System.Diagnostics.Debugger.IsAttached)
            {
#endif
                try
                {
                    await _fw.Log(nameof(CleanUnusedFiles), "Starting HttpPostAsync CleanUnusedFilesServer");

                    await ProtocolClient.HttpPostAsync(UnsubServerUri, Jw.Json(new { m = "CleanUnusedFilesServer" }), "application/json", 1000 * 60);

                    await _fw.Trace(nameof(CleanUnusedFiles), "Completed HttpPostAsync CleanUnusedFilesServer");
                }
                catch (Exception exClean)
                {
                    await _fw.Error(nameof(CleanUnusedFiles), $"HttpPostAsync CleanUnusedFilesServer: " + exClean.ToString());
                }
#if DEBUG
            }
#endif
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

                await _fw.Trace(nameof(CleanUnusedFilesServer), $"Completed CleanUnusedFilesServer");
            }
            catch (Exception exClean)
            {
                await _fw.Error(nameof(CleanUnusedFilesServer), $"CleanUnusedFilesServer: " + exClean.ToString());
            }
            return Jw.Json(new { Result = "Success" });
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

                        if (!FileImportStagingDirectory.IsNullOrWhitespace())
                        {
                            var sf = new FileInfo(Path.Combine(ServerWorkingDirectory, tmpFileName));

                            sf.CopyTo(Path.Combine(FileImportStagingDirectory, tmpFileName), true);
                        }

                        var importDir = FileImportDBDirectory.IfNullOrWhitespace(ServerWorkingDirectory);

                        await _fw.Log(nameof(LoadUnsubFiles), $"Before domain unsub insert: {campaignId}::{importDir}::{fileId}::{tmpFileName}");
                        var uplRes = await Data.CallFn(Conn, "UploadDomainUnsubFile", Jw.Json(new { CId = campaignId, Ws = importDir, FId = fileId, Fn = tmpFileName }), "");

                        if (uplRes.GetS("Result") == "success")
                        {
                            await _fw.Log(nameof(LoadUnsubFiles), $"Domain unsub insert successful: {campaignId}::{importDir}::{fileId}::{tmpFileName} Response: {uplRes.GetS("")}");

                            Fs.TryDeleteFile(Path.Combine(importDir, tmpFileName));
                        }
                        else
                        {
                            await _fw.Error(nameof(LoadUnsubFiles), $"Domain unsub insert failed:  {campaignId}::{importDir}::{fileId}::{tmpFileName} Response: {uplRes.GetS("")}");
                        }
                    }
                    catch (Exception exDomUnsub)
                    {
                        Fs.TryDeleteFile(ServerWorkingDirectory + "\\" + tmpFileName);

                        await _fw.Error(nameof(LoadUnsubFiles), $"Domain unsub insert failed: {campaignId}::{fileId}::{tmpFileName}::{exDomUnsub}");
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

                            if (!FileImportStagingDirectory.IsNullOrWhitespace())
                            {
                                var sf = new FileInfo(Path.Combine(ServerWorkingDirectory, diffname));

                                sf.CopyTo(Path.Combine(FileImportStagingDirectory, diffname), true);
                            }

                            var importDir = FileImportDBDirectory.IfNullOrWhitespace(ServerWorkingDirectory);

                            await _fw.Trace(nameof(LoadUnsubFiles), $"Before Diff Insert: {oldf}::{newf}");
                            var uplRes = await Data.CallFn(Conn, "UploadDiffFile", Jw.Serialize(new { Ws = importDir, Fn = diffname }), "");

                            if (uplRes.GetS("Result") == "success")
                            {
                                await _fw.Trace(nameof(LoadUnsubFiles), $"Diff Insert successful: {oldf}::{newf} Response: {uplRes.GetS("")}");

                                if (!FileImportStagingDirectory.IsNullOrWhitespace()) Fs.TryDeleteFile(Path.Combine(importDir, diffname));
                            }
                            else
                            {
                                await _fw.Error(nameof(LoadUnsubFiles), $"Diff insert failed: {oldf}::{newf} Response: {uplRes.GetS("")}");
                            }
                        }
                    }
                    catch (Exception exDiff)
                    {
                        await _fw.Error(nameof(LoadUnsubFiles), $"Diff insert failed: {oldfname}::{newfname}::{exDiff}");
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

        public async Task<IGenericEntity> GetCampaigns()
        {
            try
            {
                var res = await Data.CallFn(Conn, "SelectNetworkCampaigns", Jw.Serialize(new { Base64Payload = true }));

                if (res == null || res.GetS("result") == "failed")
                {
                    await _fw.Error(nameof(GetCampaigns), $"Campaign lookup failed. Response: {res?.GetS("") ?? "[null]"}");
                    return null;
                }

                return res;
            }
            catch (Exception ex)
            {
                await _fw.Error(nameof(GetCampaigns), ex.ToString());
                return null;
            }
        }

        public async Task<long?> GetFileSize(string fileName)
        {
            long? fileSize = null;

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
            catch (FileNotFoundException ex)
            {
                await _fw.Error(nameof(MakeRoom), $"File not in cache: {fileName}:{ex.UnwrapForLog()}");
                return false;
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
            var finalFile = new FileInfo($"{destDir}\\{dfileName}");

            if (!String.IsNullOrEmpty(FileCacheFtpServer) || !String.IsNullOrEmpty(FileCacheDirectory))
            {
                var di = new DirectoryInfo(destDir);
                var files = di.GetFiles(fileName);

                if (files.Length == 1) return fileName;
                else if (files.Length == 0)
                {
                    var tempFile = new FileInfo($"{destDir}\\{dfileName}{tempSuffix}");
                    var fileCopyInProgress = false;

                    try
                    {
                        tempFile.Open(FileMode.CreateNew, FileAccess.Write, FileShare.None).Dispose();
                    }
                    catch (IOException ex)
                    {
                        if (ex.Message.Contains("already exists")) fileCopyInProgress = true;
                        else
                        {
                            await _fw.Error(nameof(GetFileFromFileId), $"Unknown error with temp file: {fileName} {ex.UnwrapForLog()}");
                            throw;
                        }
                    }

                    if (fileCopyInProgress)
                    {
                        await _fw.Trace(nameof(GetFileFromFileId), $"Waiting for in process copy to finish for {finalFile}");
                        await WaitForFileCopyInProcess(finalFile);

                        return finalFile.Name;
                    }
                    else
                    {
                        await _fw.Trace(nameof(GetFileFromFileId), $"Making room for {finalFile}");
                        success = await MakeRoom(fileName, cacheSize);

                        if (!success)
                        {
                            tempFile.Delete();
                            await _fw.Error(nameof(GetFileFromFileId), $"Could not make room for file: {fileName}");
                            throw new Exception("Could not make room for file.");
                        }

                        try
                        {
                            if (!String.IsNullOrEmpty(FileCacheDirectory))
                            {
                                var cacheFile = new FileInfo(Path.Combine(FileCacheDirectory, fileName));

                                if (!cacheFile.Exists)
                                {
                                    var msg = $"Cache file does not exist {cacheFile.FullName}";
                                    await _fw.Error(nameof(GetFileFromFileId), msg);
                                    throw new Exception(msg);
                                }

                                cacheFile.CopyTo(tempFile.FullName, true);
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
                        catch (Exception)
                        {
                            tempFile.Refresh();
                            if (tempFile.Exists) tempFile.Delete();
                            throw;
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
            var args = Jw.Json(new { CId = campaignId });

            try
            {
                var c = await Data.CallFn(Conn, "SelectNetworkCampaign", args);
                var fileId = c.GetS("MostRecentUnsubFileId")?.ToLower();

                if (fileId == null)
                {
                    await _fw.Trace(nameof(GetFileFromCampaignId), $"Missing unsub file id for campaign {campaignId} Response: {c.GetS("") ?? "[null]"}");
                    return null;
                }

                return await GetFileFromFileId(fileId, ext, destDir, cacheSize);
            }
            catch (Exception e)
            {
                await _fw.Error(nameof(GetFileFromCampaignId), $"Failed to retrieve file id: {args} {e.UnwrapForLog()}");
                throw;
            }
        }

        public async Task<string> ServerIsUnsub(string proxyRequest)
        {
            return await ProtocolClient.HttpPostAsync(UnsubServerUri,
                new Dictionary<string, string>() { { "", proxyRequest } }, 5 * 60, "application/json");
        }

        public async Task<string> IsUnsub(IGenericEntity dtve)
        {
            var campaignId = dtve.GetS("CampaignId");
            var md5 = dtve.GetS("EmailMd5");
            var email = dtve.GetS("Email");
            var globalSupp = dtve.GetS("GlobalSuppression").ParseBool() ?? false;
            var globalSuppGroup = FlexStringArray(dtve, "Groups") ?? FlexStringArray(_fw.StartupConfiguration, "Config/DefaultSignalGroup");

            try
            {
                if (!email.IsNullOrWhitespace()) md5 = Hashing.CalculateMD5Hash(email.ToLower());
                else if (md5?.Contains("@") == true)
                {
                    email = md5;
                    md5 = Hashing.CalculateMD5Hash(md5.ToLower());
                }

                var fileName = await GetFileFromCampaignId(campaignId, ".txt.srt", SearchDirectory, SearchFileCacheSize);

                if (fileName.IsNullOrWhitespace())
                {
                    await _fw.Error(nameof(IsUnsub), $"Unsub file missing for campaign id {campaignId}");
                    return Jw.Json(new { Result = false, Error = "Missing unsub file" });
                }

                var isUnsub = await UnixWrapper.BinarySearchSortedMd5File(SearchDirectory, fileName, md5);

                if (!isUnsub && globalSupp)
                {
                    var res = await Data.CallFn("Signal", "inSignalGroups", Jw.Serialize(new { group = globalSuppGroup, emailMd5 = email.IfNullOrWhitespace(md5) }));

                    isUnsub = res?.GetL("in").Any() ?? true;
                }

                return Jw.Json(new { Result = isUnsub });
            }
            catch (Exception ex)
            {
                await _fw.Error(nameof(IsUnsub), $"Search failed: {campaignId}::{md5}::{ex}");
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

        private JArray FlexStringArray(IGenericEntity ge, string path)
        {
            var tok = Jw.TryParse(ge.GetS(path));

            if (tok is JArray ja) return ja;

            var str = ge.GetS(path);

            return str.IsNullOrWhitespace() ? null : JArray.FromObject(new[] { str });
        }

        public async Task<string> IsUnsubList(IGenericEntity dtve)
        {
            var md5s = new List<string>();
            var requestMd5s = new List<string>();
            var requestemails = new Dictionary<string, string>();
            var campaignId = dtve.GetS("CampaignId");
            var globalSupp = dtve.GetS("GlobalSuppression").ParseBool() ?? false;
            var globalSuppGroup = FlexStringArray(dtve, "Groups") ?? FlexStringArray(_fw.StartupConfiguration, "Config/DefaultSignalGroup");

            (List<string> found, List<string> notFound) binarySearchResults;

            try
            {
                foreach (var y in dtve.GetL("EmailMd5"))
                {
                    var md5 = y.GetS("");

                    if (md5.Contains("@"))
                    {
                        var email = md5;

                        md5 = Hashing.CalculateMD5Hash(email.ToLower());

                        if (!requestemails.ContainsKey(md5))
                        {
                            md5s.Add(md5);
                            requestemails.Add(md5, email);
                        }
                    }
                    else
                    {
                        requestMd5s.Add(md5);
                        md5s.Add(md5);
                    }
                }

                var fileName = await GetFileFromCampaignId(campaignId, ".txt.srt", SearchDirectory, SearchFileCacheSize);

                if (fileName.IsNullOrWhitespace())
                {
                    await _fw.Error(nameof(IsUnsubList), $"Unsub file missing for campaign id {campaignId}");

                    return JsonConvert.SerializeObject(new { NotUnsub = new string[0], Error = "Missing unsub file" });
                }

                binarySearchResults = await UnixWrapper.BinarySearchSortedMd5File(Path.Combine(SearchDirectory, fileName), md5s);
            }
            catch (Exception ex)
            {
                await _fw.Error(nameof(IsUnsubList), $"Search failed: {campaignId}::{ex.UnwrapForLog()}");
                throw new Exception("Search failed.");
            }

            var emailsNotFound = requestemails.Where(kvp => binarySearchResults.notFound.Contains(kvp.Key)).Select(kvp => kvp.Value).ToArray();

            if (globalSupp)
            {
                try
                {
                    var args = Jw.Serialize(new { group = globalSuppGroup, emailMd5 = emailsNotFound });

                    await _fw.Trace(nameof(IsUnsubList), $"Checking global suppression\n{args}");

                    var res = await Data.CallFn("Signal", "inSignalGroups", args);

                    emailsNotFound = res?.GetL("out").Select(g => g.GetS("")).ToArray();
                }
                catch (Exception e)
                {
                    await _fw.Error(nameof(IsUnsubList), $"Global suppression check failed: {campaignId}::{e.UnwrapForLog()}");
                    throw new Exception("Search failed.");
                }
            }

            return Jw.Serialize(new { NotUnsub = emailsNotFound });
        }

        public async Task<string> GetSuppressionFileUri(IGenericEntity network, string unsubRelationshipId, INetworkProvider networkProvider, int maxConnections)
        {
            if (unsubRelationshipId.IsNullOrWhitespace())
            {
                await _fw.Error(nameof(GetSuppressionFileUri), $"Empty unsubRelationshipId");
                return null;
            }

            string uri = null;
            var networkName = network.GetS("Name");
            var fileLocationProviders = new UnsubFileProviders.IUnsubLocationProvider[]
            {
                new UnsubFileProviders.UnsubCentral(_fw),
                new UnsubFileProviders.UnsubCentralV2(_fw),
                new UnsubFileProviders.Ezepo(_fw,SeleniumChromeDriverPath),
                new UnsubFileProviders.Optizmo(_fw),
                new UnsubFileProviders.MidEnity(_fw)
            };

            try
            {
                var locationUrl = await networkProvider.GetSuppresionLocationUrl(network, unsubRelationshipId);

                if (locationUrl != null)
                {
                    var providers = fileLocationProviders.Where(p => p.CanHandle(network, locationUrl)).ToArray();

                    if (providers.Any())
                    {
                        uri = providers.Select(p => p.GetFileUrl(network, locationUrl).Result).FirstOrDefault(u => !u.IsNullOrWhitespace());

                        if (uri.IsNullOrWhitespace())
                        {
                            await _fw.Error($"{nameof(GetSuppressionFileUri)}-{networkName}", $"Failed to retrieve unsub file from: {networkName}:{unsubRelationshipId} {locationUrl}");
                        }
                    }
                    else
                    {
                        await _fw.Error($"{nameof(GetSuppressionFileUri)}-{networkName}", $"No provider able to handle unsub file from: {networkName}:{unsubRelationshipId} {locationUrl}");
                    }
                }
                else
                {
                    await _fw.Error($"{nameof(GetSuppressionFileUri)}-{networkName}", $"Failed to retrieve unsub url for unsub file from: {networkName}:{unsubRelationshipId} {locationUrl}");
                }

            }
            catch (HaltingException)
            {
                throw;
            }
            catch (Exception e)
            {
                await _fw.Error($"{nameof(GetSuppressionFileUri)}-{networkName}", $"Exception finding unsub file source: {networkName}::{unsubRelationshipId}::{e}");
            }

            return uri;
        }

        public async Task<IDictionary<string, object>> DownloadSuppressionFiles(IGenericEntity network, string unsubUrl, string logContext)
        {
            IDictionary<string, object> dr = null;
            var networkName = network.GetS("Name");
            var parallelism = Int32.Parse(network.GetS("Credentials/Parallelism"));
            var uri = new Uri(unsubUrl);
            var authString = network.GetD("Credentials/DomainAuthStrings")?.FirstOrDefault(d => string.Equals(d.Item1, uri.Host, StringComparison.CurrentCultureIgnoreCase))?.Item2;

            dr = await ProtocolClient.DownloadUnzipUnbuffered(unsubUrl, authString, ZipTester,
                new Dictionary<string, Func<FileInfo, Task<object>>>()
                {
                    { MD5HANDLER, f =>  Md5ZipHandler(f,logContext) },
                    { PLAINTEXTHANDLER, f =>  PlainTextHandler(f,logContext) },
                    { DOMAINHANDLER, f =>  DomainZipHandler(f,logContext) },
                    { UNKNOWNHANDLER, f => UnknownTypeHandler(f,logContext) }
                },
                ClientWorkingDirectory, 30 * 60, parallelism);

            if (dr?.Any() == false) await _fw.Error($"{nameof(DownloadSuppressionFiles)}-{networkName}", $"No file downloaded {networkName} {unsubUrl} {logContext}");

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
