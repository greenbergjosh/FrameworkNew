using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.EDW.Logging;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace SimpleImportExport
{
    class Program
    {
        public static FrameworkWrapper _fw;

        public static async Task Main(string[] args)
        {
            var jobName = args[0];

            try
            {
                _fw = new FrameworkWrapper();

                _fw.LogMethodPrefix = $"{jobName}::";

                var jobIdStr = _fw.StartupConfiguration.GetS("Config/Jobs/" + jobName);

                if (!Guid.TryParse(jobIdStr, out var jobId))
                {
                    await _fw.Error($"{nameof(Program)}", $"Invalid Job Id: {jobName}:{jobIdStr}");
                    Console.WriteLine("Invalid Job Id");
                    return;
                }

                var sqlTimeoutSec = _fw.StartupConfiguration.GetS("Config/SqlTimeoutSec").ParseInt() ?? 5;
                ServicePointManager.DefaultConnectionLimit = _fw.StartupConfiguration.GetS("Config/MaxConnections").ParseInt() ?? 5;
                var jobCfg = await _fw.Entities.GetEntityGe(jobId);

                var src = await GetEnpointConfig(jobCfg, "Source");
                var dest = await GetEnpointConfig(jobCfg, "Destination");
                var commitAfterPost = jobCfg.GetS("Config/CommitAfterPostProcess").ParseBool() ?? false;
                var jobPost = jobCfg.GetS("Config/JobPostProcess");
                var srcPost = await FilePostProcess(jobCfg.GetS("Config/Source/PostProcess"), jobName);
                var destPost = await FilePostProcess(jobCfg.GetS("Config/Destination/PostProcess"), jobName);
                var srcFiles = (await src.GetFiles()).ToArray();

                await _fw.Log($"{nameof(Program)}", $"{jobName}\tFound {srcFiles.Length} on {src}");

                foreach (var f in srcFiles)
                {
                    try
                    {
                        var shouldDownload = await Data.CallFn("SimpleImportExport", "spShouldTransfer", Jw.Serialize(new { JobId = jobId, FileName = f.name }));

                        if (shouldDownload.GetS("") == "1" || shouldDownload?.GetS("Result")?.ParseBool() == true)
                        {
                            await _fw.Log($"{nameof(Program)}", $"{jobName}\tCopying {f.name}:\n\tFrom: {src}\n\tTo: {dest}\n\t{f.srcPath} -> {f.destPath}");

                            var fileSize = await dest.SendStream(f, src);
                            var sargs = Jw.Json(new { JobId = jobId, FileName = f.name, FileSize = fileSize, FileLineCount = 0 });
                            async Task Commit()
                            {
                                var res = await Data.CallFn("SimpleImportExport", "LogTransfer", sargs, "", timeout: sqlTimeoutSec);

                                if (res.GetS("Result") != "Success") throw new Exception($"Sql exception logging download: {res.GetS("Message")} Args: {sargs}");
                            };

                            if (!commitAfterPost) await Commit();

                            await srcPost(f.srcPath, src);
                            await destPost(f.destPath, dest);

                            if (commitAfterPost) await Commit();
                        }
                    }
                    catch (Exception e)
                    {
                        await _fw.Error($"{nameof(Program)}", $"{jobName}\tError processing {f.name}: {e.UnwrapForLog()}");
                    }
                }

                if (srcFiles.Any())
                {
                    try
                    {
                        await JobPostProcess(jobPost, jobName);
                    }
                    catch (Exception e)
                    {
                        await _fw.Error($"{nameof(Program)}", $"{jobName}\tError Post Processing: {e.UnwrapForLog()}");
                    }
                }

                await _fw.Error($"{nameof(Program)}", $"{jobName}\tCompleted");
            }
            catch (Exception e)
            {
                await _fw.Error($"{nameof(Program)}", $"{jobName}\tFailed to load: {e}");
            }
        }

        private static async Task JobPostProcess(string postProcessCmd, string jobName)
        {
            if (postProcessCmd?.StartsWith("Http:Get:") == true)
            {
                var url = postProcessCmd.Substring(9);

                await _fw.Log($"{nameof(JobPostProcess)}:Http:Get", $"{jobName}\t{url}");
                await ProtocolClient.HttpGetAsync(url, null, 30);
            }
        }

        private static async Task<Func<string, Endpoint, Task>> FilePostProcess(string postProcessCmd, string jobName)
        {
            if (!postProcessCmd.IsNullOrWhitespace())
            {
                if (postProcessCmd == "Delete")
                {
                    return async (fileRelativePath, endpoint) =>
                    {
                        await _fw.Log($"{nameof(FilePostProcess)}:Delete", $"{jobName}\t{fileRelativePath}");
                        await endpoint.Delete(fileRelativePath);
                    };
                }

                if (postProcessCmd.StartsWith("Move:"))
                {
                    var toRelativePath = postProcessCmd.Substring(5);

                    return async (fileRelativePath, endpoint) =>
                    {
                        await _fw.Log($"{nameof(FilePostProcess)}:Move", $"{jobName}\t{fileRelativePath} -> {toRelativePath}");
                        await endpoint.Move(fileRelativePath, toRelativePath);
                    };
                }

                var ppge = Jw.JsonToGenericEntity(postProcessCmd);

                if (ppge != null)
                {
                    var cmd = ppge.GetS("cmd");

                    if (cmd == "Rename")
                    {
                        var pattern = ppge.GetS("pattern");
                        var replace = ppge.GetS("replace");
                        var overwrite = ppge.GetS("overwrite").ParseBool() ?? false;

                        if (!pattern.IsNullOrWhitespace() && !replace.IsNullOrWhitespace())
                        {
                            var rx = new Regex(pattern, RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Singleline);

                            return async (fileRelativePath, endpoint) =>
                            {
                                await _fw.Log($"{nameof(FilePostProcess)}:Rename", $"{jobName}\t{fileRelativePath} rename with regex {pattern} replace {replace}");
                                await endpoint.Rename(fileRelativePath, rx, replace, overwrite);
                            };
                        }

                        await _fw.Error($"{nameof(FilePostProcess)}", $"Invalid config for Rename: {postProcessCmd}");
                    }

                    if (cmd == "CallFn")
                    {
                        var argsTemplate = ppge.GetS("args");
                        var payloadTemplate = ppge.GetS("payload");
                        var connection = ppge.GetS("connection");
                        var function = ppge.GetS("function");
                        var errorJsonPath = ppge.GetS("errorJsonPath");

                        return async (fileRelativePath, endpoint) =>
                        {
                            var args = argsTemplate?.Replace("{fileRelativePath}", fileRelativePath);
                            var payload = payloadTemplate?.Replace("{fileRelativePath}", fileRelativePath);
                            var res = await Data.CallFn(connection, function, args, payload);

                            if (res?.GetS("").IsNullOrWhitespace() != false) throw new Exception($"Post Process CallFn failed. DB null response. {endpoint}\r\nConfig: {ppge.GetS("")}");

                            if (res?.GetS(errorJsonPath).IsNullOrWhitespace() == false) throw new Exception($"Post Process CallFn failed ({endpoint}). DB response: {res.GetS("")}\r\nConfig: {ppge.GetS("")}");
                        };
                    }

                }
            }

            return (s, endpoint) => Task.CompletedTask;
        }

        private static async Task<Endpoint> GetEnpointConfig(IGenericEntity jobCfg, string name)
        {
            var ge = jobCfg.GetE($"Config/{name}");

            try
            {
                var type = (EndpointType)Enum.Parse(typeof(EndpointType), ge.GetS("Type"));

                switch (type)
                {
                    case EndpointType.Local:
                        return new LocalEndPoint(ge, _fw);
                    case EndpointType.Ftp:
                        return new FtpEndPoint(ge);
                    default:
                        throw new ArgumentOutOfRangeException($"Invalid Endpoint Type {type}. Must be {EndpointType.Local} or {EndpointType.Ftp}");
                }
            }
            catch (Exception e)
            {
                await _fw.Error(nameof(GetEnpointConfig), $"Failed to load endpoint: {ge.GetS("")}");
                throw;
            }
        }

    }
}
