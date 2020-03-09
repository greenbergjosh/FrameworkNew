using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Timers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using UnsubLib.NetworkProviders;
using Utility;
using Utility.DataLayer;
using Utility.EDW.Logging;
using Utility.GenericEntity;
using Fs = Utility.FileSystem;
using Jw = Utility.JsonWrapper;
using Pw = Utility.ParallelWrapper;

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
        public string ManualFilePath;
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
        private readonly FrameworkWrapper _fw;

        public RoslynWrapper RosWrap;

        public const string MD5HANDLER = "Md5Handler";
        public const string PLAINTEXTHANDLER = "PlainTextHandler";
        public const string DOMAINHANDLER = "DomainZipHandler";
        public const string SHA512HANDLER = "Sha512Handler";
        public const string UNKNOWNHANDLER = "UnknownTypeHandler";
        public const string MD5HANDLER_ID = "1";
        public const string SHA512HANDLER_ID = "2";
        public const int ZipFileMinBytes = 100;
        public const int ZipFileReadBytes = 400;
        private const int DefaultFileCopyTimeout = 5 * 60000; // 5mins
        private const string Conn = "Unsub";

        private HashSet<string> _queuedCampaigns = null;
        private readonly string _queuedCampaignsUrl;
        private readonly string _queuedCampaignsBody;

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
            ManualFilePath = config.GetS("Config/ManualFilePath");
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

            _queuedCampaignsUrl = config.GetS("Config/QueuedCampaignsUrl");
            _queuedCampaignsBody = config.GetS("Config/QueuedCampaignsBody");
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
            var path = Path.Combine(ManualFilePath, networkName);

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
                        var res = await Data.CallFn(Conn, "SelectNetworkCampaigns", Jw.Serialize(new { relationshipId = unsubRelId, NetworkId = networkId }));

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
            }
            );
        }

        public async Task ScheduledUnsubJob(IGenericEntity network, string networkCampaignId, bool skipQueuedCheck)
        {
            // Get campaigns
            var networkId = network.GetS("Id");
            var networkName = network.GetS("Name");
            var networkProvider = NetworkProviders.Factory.GetInstance(_fw, network);

            IDictionary<string, List<IGenericEntity>> uris = new Dictionary<string, List<IGenericEntity>>();
            IEnumerable<IGenericEntity> cse;

            if (networkCampaignId.IsNullOrWhitespace())
            {
                cse = await GetCampaignsScheduledJobs(network, networkProvider, skipQueuedCheck);

                if (cse == null)
                {
                    await _fw.Error($"{nameof(ScheduledUnsubJob)}-{networkName}", $"GetUnsubUris({networkName}): Null campaigns returned");
                    return;
                }

                if (!cse.Any())
                {
                    await _fw.Trace($"{nameof(ScheduledUnsubJob)}-{networkName}", $"GetUnsubUris({networkName}): No campaigns returned");
                    return;
                }

                if (network.GetS("Credentials/ManualFile").ParseBool() == true) return;

                // Get uris of files to download - maintain campaign association
                try
                {
                    uris = await GetUnsubUris(network, cse, networkProvider);
                }
                catch (HaltingException)
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

                // This won't work for NetworkProviders like Tune who return the file download URI in their "get campaigns" API.
                var uri = await GetSuppressionFileUri(network, campaign.GetS("NetworkUnsubRelationshipId"), networkProvider,
                    network.GetS("Credentials/Parallelism").ParseInt() ?? 5, null);

                if (uri.IsNullOrWhitespace())
                {
                    await _fw.Error($"{nameof(ScheduledUnsubJob)}-{networkName}", $"{networkName} campaign {networkCampaignId} returned invalid suppression url: {uri.IfNullOrWhitespace("null")}");
                    return;
                }

                cse = new[] { campaign };
                uris.Add(uri, new List<IGenericEntity>() { campaign });
            }

            await _fw.Log($"{nameof(ScheduledUnsubJob)}-{networkName}", $"ScheduledUnsubJob({networkName}) Calling ProcessUnsubFiles");

            var bad = uris.Where(u => u.Value?.Any() != true).ToArray();

            await ProcessUnsubFiles(uris, network, cse.ToArray(), false);

            await _fw.Log($"{nameof(ScheduledUnsubJob)}-{networkName}", $"ScheduledUnsubJob({networkName}) Completed ProcessUnsubFiles");
        }

        public async Task ProcessUnsubFiles(IDictionary<string, List<IGenericEntity>> uris, IGenericEntity network, IEnumerable<IGenericEntity> cse, bool isManual)
        {
            var networkName = network.GetS("Name");

            // Download unsub files
            var (networkCampaignFiles, networkDomainFiles, networkCampaignTypes) = await DownloadUnsubFiles(uris, network, isManual);

            // Generate diff list
            var campaignsWithNegativeDelta = new List<string>();
            var diffs = new HashSet<Tuple<string, string>>();
            var digestTypes = new Dictionary<string, string>();

            await _fw.Trace($"{nameof(ProcessUnsubFiles)}-{networkName}", $"Downloads for {cse.Count()} campaigns complete");

            foreach (var c in cse)
            {
                await _fw.Trace($"{nameof(ProcessUnsubFiles)}-{networkName}", $"Processing campaign: {c.GetS("") ?? "null"}");
                var campId = c.GetS("Id");

                if (networkCampaignFiles.ContainsKey(campId))
                {
                    await _fw.Trace($"{nameof(ProcessUnsubFiles)}-{networkName}", $"Checking size of {networkCampaignFiles[campId]}");
                    var newFileId = networkCampaignFiles[campId].ToLower();
                    var newFileName = newFileId + ".txt.srt";
                    await _fw.Trace($"{nameof(ProcessUnsubFiles)}-{networkName}", $"File exists? {File.Exists(newFileName)} {newFileName}");
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

                        // avoid diffs on sha512 unsub files fow now
                        if (c.GetS("SuppressionDigestType") != "sha512" && c.GetS("MostRecentUnsubFileId").Length == 36 && newFileSize.Value > oldFileSize.Value)
                        {
                            diffs.Add(new Tuple<string, string>(oldFileId, newFileId));
                        }

                        if (newFileSize.Value < oldFileSize.Value)
                        {
                            campaignsWithNegativeDelta.Add(campId);

                            Fs.TryDeleteFile(ServerWorkingDirectory + "\\" + newFileName);

                            if (!string.IsNullOrEmpty(FileCacheDirectory))
                            {
                                Fs.TryDeleteFile(FileCacheDirectory + "\\" + newFileName);
                            }
                            else if (!string.IsNullOrEmpty(FileCacheFtpServer))
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

                if (networkCampaignTypes.ContainsKey(campId))
                {
                    digestTypes.Add(campId, networkCampaignTypes[campId] == SHA512HANDLER ? SHA512HANDLER_ID : MD5HANDLER_ID);
                }
            }

            // Update campaigns with new unsub files
            try
            {
                var campaignsWithPositiveDelta = new Dictionary<string, string>();

                foreach (var cmp in networkCampaignFiles)
                {
                    if (!campaignsWithNegativeDelta.Contains(cmp.Key))
                        campaignsWithPositiveDelta.Add(cmp.Key, cmp.Value);
                }

                var resDigest = await Data.CallFn(Conn, "UpdateNetworkCampaignsDigestType", "", Jw.Json("Id", "DtId", digestTypes));
                if (resDigest?.GetS("result") != "success") await _fw.Error($"{nameof(ProcessUnsubFiles)}-{networkName}", $"Failed to update digest type for campaigns. Response: {resDigest?.GetS("") ?? "[null]"}");

                await _fw.Trace($"{nameof(ProcessUnsubFiles)}-{networkName}", $"Campaigns with Positive Delta: {campaignsWithPositiveDelta.Count}");
                var res = await Data.CallFn(Conn, "UpdateNetworkCampaignsUnsubFiles", "", Jw.Json("Id", "FId", campaignsWithPositiveDelta));

                if (res?.GetS("result") != "success") await _fw.Error($"{nameof(ProcessUnsubFiles)}-{networkName}", $"Failed to update unsub files. Response: {res?.GetS("") ?? "[null]"}");

            }
            catch (Exception exUpdateCampaigns)
            {
                await _fw.Error($"{nameof(ProcessUnsubFiles)}-{networkName}", $"Failed to update unsub files for {networkName}:: {exUpdateCampaigns}");
            }

            // Signal server to load domain unsub files, diff md5 unsub files
            //try
            //{
            //    await _fw.Trace($"{nameof(ProcessUnsubFiles)}-{networkName}", "Signaling Unsub Server Service");
            //    await SignalUnsubServerService(network, diffs, unsubFiles.Item2);
            //}
            //catch (Exception exSignal)
            //{
            //    await _fw.Error($"{nameof(ProcessUnsubFiles)}-{networkName}", $"Failed to signal UnsubJobServer: {exSignal}");
            //}
        }

        public async Task<IEnumerable<IGenericEntity>> GetCampaignsScheduledJobs(IGenericEntity network, INetworkProvider networkProvider, bool skipQueuedCheck)
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

            if (campaigns != null && !skipQueuedCheck)
            {
                await LoadQueuedCampaigns();

                await _fw.Trace($"{nameof(GetCampaignsScheduledJobs)}-{networkName}", $"Campaigns returned via API: {campaigns.GetL("").Count()}");

                var queuedCampaigns = campaigns.GetL("").Where(c => _queuedCampaigns.Contains(c.GetS("Id"))).ToList();

                await _fw.Trace($"{nameof(GetCampaignsScheduledJobs)}-{networkName}", $"Campaigns returned via API and (queued according to Console or first time seeing campaign): {queuedCampaigns.Count}");

                return queuedCampaigns;
            }

            return campaigns?.GetL("") ?? Enumerable.Empty<IGenericEntity>();
        }

        public async Task<IDictionary<string, List<IGenericEntity>>> GetUnsubUris(IGenericEntity network, IEnumerable<IGenericEntity> campaigns, INetworkProvider networkProvider)
        {
            var networkName = network.GetS("Name");
            var parallelism = network.GetS("Credentials/Parallelism").ParseInt() ?? 5;
            var uris = new ConcurrentDictionary<string, List<IGenericEntity>>();
            var cancelToken = new CancellationTokenSource();
            Task task = null;

            parallelism = MaxParallelism < parallelism ? MaxParallelism : parallelism;

            try
            {
                task = campaigns.ForEachAsync(parallelism, cancelToken.Token, async c =>
                {
                    var campaignId = c.GetS("NetworkCampaignId");
                    var unsubRelationshipId = c.GetS("NetworkUnsubRelationshipId");
                    var fileDownloadUri = c.GetS("UnsubFileDownloadUri");

                    string uri = null;

                    try
                    {
                        if (cancelToken.IsCancellationRequested) return;

                        await _fw.Trace($"{nameof(GetUnsubUris)}-{networkName}", $"Getting file url for {networkName} campaign {campaignId}");

                        uri = await GetSuppressionFileUri(network, unsubRelationshipId, networkProvider, parallelism, fileDownloadUri);

                        await _fw.Trace($"{nameof(GetUnsubUris)}-{networkName}", $"Retrieved file url for {networkName} campaign {campaignId}");
                    }
                    catch (HaltingException)
                    {
                        cancelToken.Cancel();
                        throw;
                    }
                    catch (Exception e)
                    {
                        await _fw.Error($"{nameof(GetUnsubUris)}-{networkName}", $"Failed to get file url for {networkName} campaign {campaignId}: {e}");
                    }

                    if (!string.IsNullOrEmpty(uri))
                    {
                        uris.AddOrUpdate(uri, _ => new List<IGenericEntity>() { c }, (_, list) =>
                        {
                            list.Add(c);
                            return list;
                        });
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

        public async Task<(ConcurrentDictionary<string, string> networkCampaignFiles, ConcurrentDictionary<string, string> networkDomainFiles, ConcurrentDictionary<string, string> networkCampaignTypes)> DownloadUnsubFiles(IDictionary<string, List<IGenericEntity>> uris, IGenericEntity network, bool isManual)
        {
            var networkName = network.GetS("Name");
            var networkUnsubMethod = network.GetS("Credentials/UnsubMethod");
            var parallelism = Int32.Parse(network.GetS("Credentials/Parallelism"));

            parallelism = MaxParallelism < parallelism ? MaxParallelism : parallelism;

            await _fw.Log($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Starting file downloads for {networkName}");

            var networkCampaignFiles = new ConcurrentDictionary<string, string>();
            var networkDomainFiles = new ConcurrentDictionary<string, string>();
            var networkCampaignTypes = new ConcurrentDictionary<string, string>();

            var destinations = new ConcurrentBag<string>();

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
                                    { SHA512HANDLER, f => Sha512ZipHandler(f, logCtx) },
                                    { UNKNOWNHANDLER, f => UnknownTypeHandler(f, logCtx) }
                                },
                                fis.DirectoryName,
                                ClientWorkingDirectory,
                                1000 * 60 * 20 // 20 minute timeout
                                );

                        await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Completed UnzipUnbuffered({networkName}):: for url {uri.Key}");
                    }

                    if (cf.ContainsKey(MD5HANDLER) ||
                        cf.ContainsKey(SHA512HANDLER) ||
                        cf.ContainsKey(PLAINTEXTHANDLER))
                    {
                        string fdest;
                        long fileSize;

                        if (cf.ContainsKey(MD5HANDLER) || cf.ContainsKey(SHA512HANDLER))
                        {
                            string handler = cf.ContainsKey(MD5HANDLER) ? MD5HANDLER : SHA512HANDLER;
                            fdest = cf[handler].ToString().ToLower();

                            fileSize = new FileInfo(ClientWorkingDirectory + "\\" + fdest + ".txt").Length;

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"RemoveNonAsciiFromFile({networkName}):: for file {fdest}({fileSize})");

                            await UnixWrapper.RemoveNonAsciiFromFile(ClientWorkingDirectory, fdest + ".txt", fdest + ".txt.cln");

                            fileSize = new FileInfo(ClientWorkingDirectory + "\\" + fdest + ".txt.cln").Length;

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"RemoveNon(MD5|SHA512)LinesFromFile({networkName}):: for file {fdest}({fileSize})");

                            if (cf.ContainsKey(MD5HANDLER))
                                await UnixWrapper.RemoveNonMD5LinesFromFile(ClientWorkingDirectory, fdest + ".txt.cln", fdest + ".txt.cl2");
                            else
                                await UnixWrapper.RemoveNonSHA512LinesFromFile(ClientWorkingDirectory, fdest + ".txt.cln", fdest + ".txt.cl2");
                        }
                        else
                        {
                            var plainTextFile = new FileInfo(Path.Combine(ClientWorkingDirectory, cf[PLAINTEXTHANDLER].ToString().ToLower() + ".txt"));
                            var fmd5G = Guid.NewGuid();
                            fdest = fmd5G.ToString();

                            fileSize = plainTextFile.Length;

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Plain email text file {plainTextFile.Name}({fileSize})");

                            using (var fs = plainTextFile.OpenText())
                            using (var ws = File.CreateText(Path.Combine(ClientWorkingDirectory, $"{fdest}.txt.cl2")))
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
                            catch
                            {
                            }
                        }

                        fileSize = new FileInfo(ClientWorkingDirectory + "\\" + fdest + ".txt.cl2").Length;

                        await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"SortFile({networkName}):: for file {fdest}({fileSize})");

                        await UnixWrapper.SortFile(ClientWorkingDirectory, fdest + ".txt.cl2", fdest + ".txt.srt", false, true, 300000, 4, SortBufferSize);

                        fileSize = new FileInfo(ClientWorkingDirectory + "\\" + fdest + ".txt.srt").Length;

                        await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Completed Cleaning({networkName}):: for file {fdest}({fileSize})");

                        var srcPath = Path.Combine(ClientWorkingDirectory, fdest + ".txt.srt");
                        var src = new FileInfo(srcPath);

                        if (!string.IsNullOrEmpty(FileCacheDirectory))
                        {
                            var dest = Path.Combine(FileCacheDirectory, fdest + ".txt.srt");

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Starting UploadToDirectory for Digest file {fdest} {srcPath} -> {dest} Exists: {src.Exists}");

                            src.CopyTo(dest, true);

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Completed UploadToDirectory for Digest file {fdest} {srcPath} -> {dest} Exists: {File.Exists(dest)}");

                            destinations.Add(dest);
                        }
                        else if (!string.IsNullOrEmpty(FileCacheFtpServer))
                        {
                            var dest = FileCacheFtpServerPath + "/" + fdest + ".txt.srt";

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Starting UploadToFtp for Digest file {fdest}  {srcPath} -> Host: {FileCacheFtpServer} {dest}");

                            await ProtocolClient.UploadFile(srcPath, dest, FileCacheFtpServer, FileCacheFtpUser, FileCacheFtpPassword);

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Completed UploadToFtp for Digest file {fdest}  {srcPath} -> Host: {FileCacheFtpServer} {dest}");
                        }

                        // Only write to the database if we've pulled the campaigns queued for mailing, or if we've been given a single campaign to run.
                        if ((_queuedCampaigns?.Any() == true || uris.Count == 1) && !string.IsNullOrWhiteSpace(SearchDirectory))
                        {
                            var searchDest = Path.Combine(SearchDirectory, fdest + ".txt.srt");

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Starting UploadToSearchDirectory for Digest file {fdest} {srcPath} -> {searchDest} Exists: {src.Exists}");

                            src.CopyTo(searchDest, true);

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Completed UploadToSearchDirectory for Digest file {fdest} {srcPath} -> {searchDest} Exists: {File.Exists(searchDest)}");

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Starting UploadToDatabase for Digest file {fdest}");

                            await Data.CallFn(Conn, "UploadUnsubFile", Jw.Serialize(new
                            {
                                filePath = $"{FileImportDBDirectory}/{fdest}.txt.srt",
                                fileId = fdest,
                                fileType = cf.ContainsKey(MD5HANDLER) ? "md5" : "sha512"
                            }), timeout: 600);

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Completed UploadToDatabase for Digest file {fdest}");
                        }

                        Fs.TryDeleteFile(src);

                        Fs.TryDeleteFile($"{ClientWorkingDirectory}\\{fdest}.txt");
                        Fs.TryDeleteFile($"{ClientWorkingDirectory}\\{fdest}.txt.cln");
                        Fs.TryDeleteFile($"{ClientWorkingDirectory}\\{fdest}.txt.cl2");
                    }

                    if (cf.ContainsKey(DOMAINHANDLER))
                    {
                        var fdom = cf[DOMAINHANDLER].ToString().ToLower();

                        if (!string.IsNullOrEmpty(FileCacheDirectory))
                        {
                            var src = Path.Combine(ClientWorkingDirectory, fdom + ".txt");
                            var dest = Path.Combine(FileCacheDirectory, fdom + ".txt");

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Starting UploadToDirectory for Domain file {fdom} {src} -> {dest} Exists: {File.Exists(src)}");

                            new FileInfo(src).MoveTo(dest);

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Completed UploadToDirectory for Domain file {fdom} {src} -> {dest} Exists: {File.Exists(dest)}");
                            destinations.Add(dest);
                        }
                        else if (!string.IsNullOrEmpty(FileCacheFtpServer))
                        {
                            var src = Path.Combine(ClientWorkingDirectory, fdom + ".txt");
                            var dest = FileCacheFtpServerPath + "/" + fdom + ".txt";

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Starting UploadToFtp for Domain file {fdom}  {src} -> Host: {FileCacheFtpServer} {dest}");

                            await ProtocolClient.UploadFile(
                                    src,
                                    dest,
                                    FileCacheFtpServer,
                                    FileCacheFtpUser,
                                    FileCacheFtpPassword);

                            await _fw.Trace($"{nameof(DownloadUnsubFiles)}-{networkName}", $"Completed Upload for Domain file {fdom}  {src} -> Host: {FileCacheFtpServer} {dest}");

                            Fs.TryDeleteFile($"{ClientWorkingDirectory}\\{fdom}.txt");
                        }
                    }

                    foreach (var c in uri.Value)
                    {
                        if (cf.ContainsKey(MD5HANDLER) || cf.ContainsKey(SHA512HANDLER))
                        {
                            string handler = cf.ContainsKey(MD5HANDLER) ? MD5HANDLER : SHA512HANDLER;
                            var fdest = cf[handler].ToString();

                            if (!networkCampaignFiles.TryAdd(c.GetS("Id"), fdest.ToLower()))
                            {
                                await _fw.Error($"{nameof(DownloadUnsubFiles)}-{networkName}", $"ncf.TryAdd failed {uri.Key}::{c.GetS("Id")}::{fdest.ToLower()}");
                            }

                            if (!networkCampaignTypes.TryAdd(c.GetS("Id"), handler))
                            {
                                await _fw.Error($"{nameof(DownloadUnsubFiles)}-{networkName}", $"nct.TryAdd failed {uri.Key}::{c.GetS("Id")}::{handler}");
                            }
                        }

                        if (cf.ContainsKey(DOMAINHANDLER))
                        {
                            var fdom = cf[DOMAINHANDLER].ToString();
                            if (!networkDomainFiles.TryAdd(c.GetS("Id"), fdom.ToLower()))
                            {
                                await _fw.Error($"{nameof(DownloadUnsubFiles)}-{networkName}", $"ndf.TryAdd failed {uri.Key}::{c.GetS("Id")}::{fdom.ToLower()}");
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
            await _fw.Log($"{nameof(DownloadUnsubFiles)}-{networkName}", Jw.Serialize(destinations.Select(d => new { path = d, exists = File.Exists(d) }).ToArray()));

            return (networkCampaignFiles, networkDomainFiles, networkCampaignTypes);
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
                catch
                {
                }
            }

            if (!string.IsNullOrEmpty(FileCacheDirectory))
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
            else if (!string.IsNullOrEmpty(FileCacheFtpServer))
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
                    await _fw.Error(nameof(CleanUnusedFiles), $"HttpPostAsync CleanUnusedFilesServer: {exClean}");
                }
#if DEBUG
            }
#endif

            try
            {
                await Data.CallFn(Conn, "CleanUnsubFiles");
            }
            catch (Exception ex)
            {
                await _fw.Error(nameof(CleanUnusedFiles), $"Database CleanUnsubFiles: {ex}");
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

            if (!string.IsNullOrEmpty(FileCacheDirectory))
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
            else if (!string.IsNullOrEmpty(FileCacheFtpServer))
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

                    if (!string.IsNullOrEmpty(FileCacheDirectory))
                    {
                        Fs.TryDeleteFile(FileCacheDirectory + "\\" + domFile + ".txt");
                    }
                    else if (!string.IsNullOrEmpty(FileCacheFtpServer))
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
            try
            {
                if (!string.IsNullOrEmpty(FileCacheDirectory))
                {
                    var fi = new FileInfo(FileCacheDirectory + "\\" + fileName);

                    if (!fi.Exists)
                    {
                        await _fw.Trace($"{nameof(GetFileSize)}", $"File not found {FileCacheDirectory}\\{fileName}");
                        return null;
                    }

                    return fi.Length;
                }
                else if (!string.IsNullOrEmpty(FileCacheFtpServer))
                {
                    return await ProtocolClient.FtpGetFileSize(
                            FileCacheFtpServerPath + "/" + fileName,
                            FileCacheFtpServer,
                            FileCacheFtpUser,
                            FileCacheFtpPassword);
                }
                else
                {
                    return new FileInfo(ClientWorkingDirectory + "\\" + fileName).Length;
                }
            }
            catch (Exception fileSizeException)
            {
                await _fw.Error(nameof(GetFileSize), fileName + "::" + fileSizeException.ToString());
                return null;
            }
        }

        public async Task<long?> GetFileSize2(string fileName)
        {
            try
            {
                var fi = new FileInfo(fileName);

                if (!fi.Exists)
                {
                    await _fw.Trace($"{nameof(GetFileSize2)}", $"File not found {fileName}");
                    return null;
                }

                return fi.Length;

            }
            catch (Exception fileSizeException)
            {
                await _fw.Error(nameof(GetFileSize2), fileName + "::" + fileSizeException.ToString());
                return null;
            }
        }

        public async Task<bool> MakeRoom(string fileName, long cacheSize)
        {
            try
            {
                long newFileSize = 0;

                if (!string.IsNullOrEmpty(FileCacheDirectory))
                {
                    newFileSize = new FileInfo(FileCacheDirectory + "\\" + fileName).Length;
                }
                else if (!string.IsNullOrEmpty(FileCacheFtpServer))
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
                        newFileSize -= file.Length;
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
            var dfileName = destFileName ?? fileName;
            var finalFile = new FileInfo($"{destDir}\\{dfileName}");

            if (!string.IsNullOrEmpty(FileCacheFtpServer) || !string.IsNullOrEmpty(FileCacheDirectory))
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
                            if (!string.IsNullOrEmpty(FileCacheDirectory))
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
                            else if (!string.IsNullOrEmpty(FileCacheFtpServer))
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

        public async Task<(string fileId, string type, DateTime mostRecentFileDate)> GetFileIdAndTypeFromCampaignId(string campaignId)
        {
            var args = Jw.Json(new { CId = campaignId });

            try
            {
                var c = await Data.CallFn(Conn, "SelectNetworkCampaign", args);
                var fileId = c.GetS("MostRecentUnsubFileId")?.ToLower();
                var type = c.GetS("SuppressionDigestType");
                var mostRecentFileDateString = c.GetS("MostRecentUnsubFileDate");
                DateTime.TryParse(mostRecentFileDateString, out var mostRecentFileDate);
                
                if (fileId == null)
                {
                    await _fw.Trace(nameof(GetFileIdAndTypeFromCampaignId), $"Missing unsub file id for campaign {campaignId} Response: {c.GetS("") ?? "[null]"}");
                    return (fileId: null, type, mostRecentFileDate);
                }

                return (fileId, type, mostRecentFileDate);
            }
            catch (Exception e)
            {
                await _fw.Error(nameof(GetFileIdAndTypeFromCampaignId), $"Failed to retrieve file id: {args} {e.UnwrapForLog()}");
                throw;
            }
        }

        public async Task<string> GetFileCampaignId(string fileId, string type, string ext, string destDir, long cacheSize)
        {
            try
            {
                return await GetFileFromFileId(fileId, ext, destDir, cacheSize);
            }
            catch (Exception e)
            {
                await _fw.Error(nameof(GetFileCampaignId), $"Failed to retrieve file for fileId: {fileId} {e.UnwrapForLog()}");
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
            var digest = dtve.GetS("EmailMd5");
            var email = dtve.GetS("Email");
            var globalSupp = dtve.GetS("GlobalSuppression").ParseBool() ?? false;
            var globalSuppGroup = FlexStringArray(dtve, "Groups") ?? FlexStringArray(_fw.StartupConfiguration, "Config/DefaultSignalGroup");

            try
            {
                (var fileId, var type, var mostRecentFileDate) = await GetFileIdAndTypeFromCampaignId(campaignId);
                if ((DateTime.Now - mostRecentFileDate).TotalDays > 14)
                {
                    throw new InvalidOperationException("File is greater than 14 days old.");
                }

                var fileName = await GetFileFromFileId(fileId, ".txt.srt", SearchDirectory, SearchFileCacheSize);

                if (!email.IsNullOrWhitespace()) digest = Hashing.CalculateMD5Hash(email.ToLower());
                else if (digest?.Contains("@") == true)
                {
                    email = digest;
                    digest = type.IsNullOrWhitespace() || type == "md5" ? Hashing.CalculateMD5Hash(digest.ToLower()) : Hashing.CalculateSHA512Hash(digest.ToLower());
                }

                if (fileName.IsNullOrWhitespace())
                {
                    await _fw.Error(nameof(IsUnsub), $"Unsub file missing for campaign id {campaignId}");
                    return Jw.Json(new { Result = false, Error = "Missing unsub file" });
                }

                await _fw.Trace(nameof(IsUnsub), $"Preparing to search {fileName} in {SearchDirectory} with digest type '{type ?? string.Empty}' returned from campaign record (md5 if empty)");
                var isUnsub = await UnixWrapper.BinarySearchSortedFile(Path.Combine(SearchDirectory, fileName), (type.IsNullOrWhitespace() || type == "md5" ? Hashing.Md5StringLength : Hashing.HexSHA512StringLength), digest);

                if (!isUnsub && globalSupp)
                {
                    var res = await Data.CallFn("Signal", "inSignalGroups", Jw.Serialize(new { group = globalSuppGroup, emailMd5 = email.IfNullOrWhitespace(digest) }));

                    isUnsub = res?.GetL("in").Any() ?? true;
                }

                return Jw.Json(new { Result = isUnsub });
            }
            catch (Exception ex)
            {
                await _fw.Error(nameof(IsUnsub), $"Search failed: {campaignId}::{digest}::{ex}");
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
            var campaignId = dtve.GetS("CampaignId");
            var globalSupp = dtve.GetS("GlobalSuppression").ParseBool() ?? false;
            var globalSuppGroup = FlexStringArray(dtve, "Groups") ?? FlexStringArray(_fw.StartupConfiguration, "Config/DefaultSignalGroup");

            List<string> emailsNotFound = null;

            try
            {
                (var fileId, var fileType, var mostRecentFileDate) = await GetFileIdAndTypeFromCampaignId(campaignId);
                if ((DateTime.Now - mostRecentFileDate).TotalDays > 14)
                {
                    throw new InvalidOperationException("File is greater than 14 days old.");
                }

                await _fw.Trace(nameof(IsUnsubList), $"Preparing to search {fileId} in database with digest type '{fileType ?? string.Empty}' returned from campaign record (md5 if empty)");

                try
                {
                    var result = await Data.CallFn(Conn, "AreSuppressed", Jw.Serialize(new
                    {
                        emails = dtve.GetL("EmailMd5").Select(e => e.GetS("")),
                        fileId,
                        fileType
                    }));

                    if (result.GetS("Result") == "OK")
                    {
                        emailsNotFound = result.GetL("NotUnsub").Select(e => e.GetS("")).ToList();
                    }
                }
                catch (Exception dbException)
                {
                    await _fw.Error(nameof(IsUnsubList), $"Database search failed: {campaignId}::{dbException.UnwrapForLog()}");
                }

                if (emailsNotFound == null)
                {
                    var digests = new List<string>();
                    var requestDigests = new List<string>();
                    var requestemails = new Dictionary<string, string>();
                    (List<string> found, List<string> notFound) binarySearchResults;

                    var fileName = await GetFileFromFileId(fileId, ".txt.srt", SearchDirectory, SearchFileCacheSize);

                    foreach (var y in dtve.GetL("EmailMd5"))
                    {
                        var digest = y.GetS("");

                        if (digest.Contains("@"))
                        {
                            var email = digest;

                            digest = fileType == "sha512" ? ("0x" + Hashing.CalculateSHA512Hash(email.ToLower())) : Hashing.CalculateMD5Hash(email.ToLower());

                            if (!requestemails.ContainsKey(digest))
                            {
                                digests.Add(digest);
                                requestemails.Add(digest, email);
                            }
                        }
                        else
                        {
                            requestDigests.Add(digest);
                            digests.Add(digest);
                        }
                    }

                    if (fileName.IsNullOrWhitespace())
                    {
                        await _fw.Error(nameof(IsUnsubList), $"Unsub file missing for campaign id {campaignId}");

                        return JsonConvert.SerializeObject(new { NotUnsub = Array.Empty<string>(), Error = "Missing unsub file" });
                    }

                    await _fw.Trace(nameof(IsUnsubList), $"Preparing to search {fileName} in {SearchDirectory} with digest type '{fileType ?? string.Empty}' returned from campaign record (md5 if empty)");
                    // SHA512 unsub files currently have a "0x" prefix.  Better handling needed if that's optional in the future
                    binarySearchResults = await UnixWrapper.BinarySearchSortedFile(Path.Combine(SearchDirectory, fileName), (fileType.IsNullOrWhitespace() || fileType == "md5" ? Hashing.Md5StringLength : Hashing.HexSHA512StringLength), digests);

                    emailsNotFound = requestemails.Where(kvp => binarySearchResults.notFound.Contains(kvp.Key)).Select(kvp => kvp.Value).ToList();
                    emailsNotFound.AddRange(requestDigests.Where(m => binarySearchResults.notFound.Contains(m.ToLower())).Select(m => m).ToList());
                }
            }
            catch (Exception ex)
            {
                await _fw.Error(nameof(IsUnsubList), $"Search failed: {campaignId}::{ex.UnwrapForLog()}");
                throw new Exception("Search failed.");
            }

            if (globalSupp)
            {
                try
                {
                    var args = Jw.Serialize(new { group = globalSuppGroup, emailMd5 = emailsNotFound });

                    await _fw.Trace(nameof(IsUnsubList), $"Checking global suppression\n{args}");

                    var res = await Data.CallFn("Signal", "inSignalGroups", args);

                    emailsNotFound = res?.GetL("out").Select(g => g.GetS("")).ToList();
                }
                catch (Exception e)
                {
                    await _fw.Error(nameof(IsUnsubList), $"Global suppression check failed: {campaignId}::{e.UnwrapForLog()}");
                    throw new Exception("Search failed.");
                }
            }

            return Jw.Serialize(new { NotUnsub = emailsNotFound });
        }

        public async Task<string> GetSuppressionFileUri(IGenericEntity network, string unsubRelationshipId, INetworkProvider networkProvider, int maxConnections, string fileDownloadUri)
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
                //new UnsubFileProviders.UnsubCentral(_fw),
                new UnsubFileProviders.UnsubCentralV2(_fw),
                new UnsubFileProviders.Ezepo(_fw),
                new UnsubFileProviders.Optizmo(_fw),
                new UnsubFileProviders.MidEnity(_fw),
                new UnsubFileProviders.W4(_fw),
                new UnsubFileProviders.Unsubly(_fw),
                new UnsubFileProviders.Ad1Media()
            };

            try
            {
                Uri locationUrl;
                if (!string.IsNullOrWhiteSpace(fileDownloadUri))
                {
                    locationUrl = new Uri(fileDownloadUri);
                }
                else
                {
                    locationUrl = await networkProvider.GetSuppressionLocationUrl(network, unsubRelationshipId);
                }

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

            if (unsubUrl.Contains("unsubly.com"))
            {
                var parts = unsubUrl.Split('|');
                var ge = JsonWrapper.ToGenericEntity(JsonWrapper.TryParse(parts[1]));
                var headers = new Dictionary<string, string>()
                {
                    ["nid"] = ge.GetS("nid"),
                    ["aid"] = ge.GetS("aid"),
                    ["fid"] = ge.GetS("fid"),
                    ["md5but"] = "Download Suppression List in MD5 format"
                };
                var csv = await ProtocolClient.HttpPostAsync(parts[0], headers, 30 * 60);
                var fileName = Guid.NewGuid();

                await File.WriteAllTextAsync($"{ClientWorkingDirectory}\\{fileName}.txt", csv);
                dr = new Dictionary<string, object>
                {
                    [MD5HANDLER] = fileName
                };
            }
            else
            {
                dr = await ProtocolClient.DownloadUnzipUnbuffered(unsubUrl, authString, ZipTester,
                    new Dictionary<string, Func<FileInfo, Task<object>>>()
                    {
                        { MD5HANDLER, f =>  Md5ZipHandler(f,logContext) },
                        { PLAINTEXTHANDLER, f =>  PlainTextHandler(f,logContext) },
                        { DOMAINHANDLER, f =>  DomainZipHandler(f,logContext) },
                        { SHA512HANDLER, f => Sha512ZipHandler(f, logContext) },
                        { UNKNOWNHANDLER, f => UnknownTypeHandler(f,logContext) }
                    },
                    ClientWorkingDirectory, 30 * 60, parallelism);
            }


            if (dr?.Any() == false) await _fw.Error($"{nameof(DownloadSuppressionFiles)}-{networkName}", $"No file downloaded {networkName} {unsubUrl} {logContext}");

            return dr;
        }

        private static string LineHandler(string s)
        {
            if (Hashing.MD5StringRegex().IsMatch(s))
                return MD5HANDLER;
            if (!string.IsNullOrEmpty(s) && !(!s.Contains("@") || (s[0] == '*') || (s[0] == '@')))
                return PLAINTEXTHANDLER;
            if (!string.IsNullOrEmpty(s) && s.Contains("."))
                return DOMAINHANDLER;
            if (Hashing.SHA512StringRegex().IsMatch(s))
                return SHA512HANDLER;
            return null;
        }

        private static (string firstMatch, string restMatch) LinesHandler(string[] lines)
        {
            // first line
            var firstLineType = LineHandler(lines[0]);
            string restLineType = null;
            // every other line but the first
            foreach (var line in lines.Skip(1))
            {
                // line status
                var restLineTypeTemp = LineHandler(line);
                // if we don't know, bust out
                if (restLineTypeTemp == null)
                {
                    restLineType = null;
                    break;
                }
                // did we find a type? set the type
                if (restLineType == null)
                    restLineType = restLineTypeTemp;
                // if we found a type, but some next line is different, error, and bust out
                else if (restLineType != restLineTypeTemp)
                {
                    restLineType = null;
                    break;
                }
            }
            return (firstLineType, restLineType);
        }

        private async Task<string> HandlerType(string[] lines, FileInfo f)
        {
            // if number of lines is 1 OR if number of lines is 2, and the second is empty
            // test the first line only
            if (lines.Length == 1 || (lines.Length == 2 && string.IsNullOrEmpty(lines[1])))
            {
                await _fw.Trace(nameof(HandlerType), $"SingleLine Match");
                return LineHandler(lines[0]);
            }

            // if the number of lines is 2 : 2, otherwise number of lines - 1 (don't test last possibly-partial line)
            var maxLines = lines.Length == 2 ? 2 : lines.Length - 1;
            var (firstMatch, restMatch) = LinesHandler(lines.Take(maxLines).ToArray());
            if ((restMatch != null) && (firstMatch != restMatch))
            {
                await _fw.Trace(nameof(HandlerType), $"Removing header");
                await UnixWrapper.RemoveFirstLine(f.DirectoryName, f.Name);
            }

            return restMatch; // which may be null - in which case we did not match a type
        }

        public async Task<string> ZipTester(FileInfo f)
        {
            if (f.Length == 0)
            {
                await _fw.Error(nameof(ZipTester), $"Zero-length file: {f.FullName}");
                return UNKNOWNHANDLER;
            }

            await _fw.Trace(nameof(ZipTester), $"File size before running {nameof(ZipTester)}: {f.Length} bytes");

            if (f.Length < ZipFileMinBytes)
                await _fw.Trace(nameof(ZipTester), $"File length {f.Length} less than {ZipFileMinBytes} bytes");

            // We read in xxx bytes, and ignore the last line, to avoid truncation
            var lines = await FileSystem.ReadLines(f.FullName, ZipFileReadBytes);

            await _fw.Trace(nameof(ZipTester), $"Lines in file: {f.Length}, capped to {ZipFileReadBytes} bytes");

            var handler = await HandlerType(lines, f);
            if (handler == null)
                await _fw.Error(nameof(ZipTester), $"Unknown file type: {f.FullName}");

            await _fw.Trace(nameof(ZipTester), $"Handling file {f.FullName} with {handler ?? UNKNOWNHANDLER}, length after {nameof(ZipTester)}: {GetFileSize2(f.FullName).GetAwaiter().GetResult()}");
            return handler ?? UNKNOWNHANDLER;
        }

        public Task<object> Md5ZipHandler(FileInfo f, string logContext)
        {
            var fileName = Guid.NewGuid();
            f.MoveTo($"{ClientWorkingDirectory}\\{fileName}.txt");
            return Task.FromResult<object>(fileName);
        }

        public Task<object> PlainTextHandler(FileInfo f, string logContext)
        {
            var fileName = Guid.NewGuid();
            f.MoveTo($"{ClientWorkingDirectory}\\{fileName}.txt");
            return Task.FromResult<object>(fileName);
        }

        public Task<object> DomainZipHandler(FileInfo f, string logContext)
        {
            var fileName = Guid.NewGuid();
            f.MoveTo($"{ClientWorkingDirectory}\\{fileName}.txt");
            return Task.FromResult<object>(fileName);
        }

        public Task<object> Sha512ZipHandler(FileInfo f, string logContext)
        {
            var fileName = Guid.NewGuid();
            f.MoveTo($"{ClientWorkingDirectory}\\{fileName}.txt");
            return Task.FromResult<object>(fileName);
        }

        public async Task<object> UnknownTypeHandler(FileInfo fi, string logContext)
        {
            await _fw.Error(nameof(UnknownTypeHandler), $"Unknown file type: {fi.FullName} {logContext}");
            return new object();
        }

        public async Task LoadQueuedCampaigns()
        {
            if (_queuedCampaigns == null)
            {
                var response = await new HttpClient().PostAsync(_queuedCampaignsUrl, _queuedCampaignsBody == null ? null : new StringContent(_queuedCampaignsBody));
                var result = await response.Content.ReadAsStringAsync();

                dynamic queued = JsonConvert.DeserializeObject(result);

                _queuedCampaigns = new HashSet<string>();
                foreach (var campaign in queued)
                {
                    _queuedCampaigns.Add(campaign["CampaignUId"].ToString());
                }
            }
        }
    }
}
