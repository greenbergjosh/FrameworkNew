using System;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace SimpleImportExport
{
    class Program
    {
        public static FrameworkWrapper _fw;

        private delegate Task PostProcess(SourceFileInfo file, string directoryPath, Endpoint endpoint, Guid refId);

        public static async Task Main(string[] args)
        {
            if (!args.Any()) throw new Exception("Job name parameter not provided");

            var jobName = args[0];

            try
            {
                _fw = new FrameworkWrapper();
            }
            catch (Exception e)
            {
                Console.WriteLine($"Failed to load FrameworkWrapper {e.UnwrapForLog()}");
                throw;
            }

            try
            {
                _fw.LogMethodPrefix = $"{jobName}::";

                var jobIdStr = _fw.StartupConfiguration.GetS("Config/Jobs/" + jobName);

                if (!Guid.TryParse(jobIdStr, out var jobId))
                {
                    await _fw.Error($"{nameof(Program)}", $"Invalid Job Id: {jobName}:{jobIdStr}");
                    Console.WriteLine("Invalid Job Id");
                    return;
                }

                await _fw.Log($"{nameof(Program)}", $"Getting job config: {jobName}:{jobIdStr}");

                var sqlTimeoutSec = _fw.StartupConfiguration.GetS("Config/SqlTimeoutSec").ParseInt() ?? 5;
                ServicePointManager.DefaultConnectionLimit = _fw.StartupConfiguration.GetS("Config/MaxConnections").ParseInt() ?? 5;
                var jobCfg = (await _fw.Entities.GetEntity(jobId)).GetE("Config");

                var src = await GetEnpointConfig(jobCfg, "Source");
                var dest = await GetEnpointConfig(jobCfg, "Destination");
                var commitAfterPost = jobCfg.GetS("CommitAfterPostProcess").ParseBool() ?? false;
                var jobPost = jobCfg.GetS("JobPostProcess");
                var srcPost = await FilePostProcess(jobCfg.GetS("Source/PostProcess"), jobName, commitAfterPost);
                var destPost = await FilePostProcess(jobCfg.GetS("Destination/PostProcess"), jobName, commitAfterPost);
                var srcFiles = (await src.GetFiles()).ToArray();

                await _fw.Log($"{nameof(Program)}", $"{jobName}\tFound {srcFiles.Length} on {src}");

                foreach (var f in srcFiles)
                {
                    try
                    {
                        var shouldDownload = await Data.CallFn("SimpleImportExport", "shouldTransfer", Jw.Serialize(new { JobId = jobId, f.FileName }));

                        if (shouldDownload.GetS("") == "1" || shouldDownload?.GetS("result")?.ParseBool() == true)
                        {
                            await _fw.Log($"{nameof(Program)}", $"{jobName}\tCopying {f.FileName}:\n\tFrom: {src}\n\tTo: {dest}");

                            var refId = Guid.NewGuid();
                            var (size, records, destinationDirectoryPath) = await dest.SendStream(f, src);
                            await _fw.Log($"{nameof(Program)}", $"{jobName}\tCopy complete {f.FileName}:\n\tFrom: {src}\n\tTo: {dest}");
                            var sargs = Jw.Serialize(new { JobId = jobId, f.FileName, FileSize = size, Records = records, Ref = refId, f.FileDate });
                            async Task Commit()
                            {
                                var res = await Data.CallFn("SimpleImportExport", "logTransfer", sargs, "", timeout: sqlTimeoutSec);

                                if (res.GetS("result") != "Success") throw new Exception($"Sql exception logging download: {res.GetS("").IfNullOrWhitespace("null response")} Args: {sargs}");
                            };

                            if (!commitAfterPost) await Commit();

                            await srcPost(f, f.SourceDirectory, src, refId);
                            await destPost(f, destinationDirectoryPath, dest, refId);

                            if (commitAfterPost) await Commit();
                        }
                        else if (!shouldDownload.GetS("err").IsNullOrWhitespace()) await _fw.Error(nameof(SimpleImportExport), $"ShouldDownload failed: {shouldDownload.GetS("err")}");
                    }
                    catch (Exception e)
                    {
                        await _fw.Error($"{nameof(SimpleImportExport)}", $"{jobName}\tError processing {f.FileName}: {e.UnwrapForLog()}");
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
                        await _fw.Error($"{nameof(SimpleImportExport)}", $"{jobName}\tError Post Processing: {e.UnwrapForLog()}");
                    }
                }

                await _fw.Log($"{nameof(SimpleImportExport)}", $"{jobName}\tCompleted");
            }
            catch (Exception e)
            {
                await _fw.Error($"{nameof(SimpleImportExport)}", $"{jobName}\tFailed to load: {e}");
            }
        }

        private static async Task JobPostProcess(string postProcessCmd, string jobName)
        {
            if (postProcessCmd?.StartsWith("Http:Get:") == true)
            {
                var url = postProcessCmd.Substring(9);

                await _fw.Log($"{nameof(JobPostProcess)}:JobPostProcess:Http:Get", $"{jobName}\t{url}");
                await ProtocolClient.HttpGetAsync(url, null, 30);
            }
        }

        private static async Task<PostProcess> FilePostProcess(string postProcessCmd, string jobName, bool commitAfterPost)
        {
            if (!postProcessCmd.IsNullOrWhitespace())
            {
                if (postProcessCmd == "Delete")
                {
                    return async (file, directoryPath, endpoint, refId) =>
                    {
                        await _fw.Log($"{nameof(FilePostProcess)}:Delete", $"{jobName}\t{directoryPath}/{file.FileName}");
                        await endpoint.Delete(directoryPath, file.FileName);
                    };
                }

                if (postProcessCmd.StartsWith("Move:"))
                {
                    var toRelativePath = postProcessCmd.Substring(5);

                    return async (file, directoryPath, endpoint, refId) =>
                    {
                        await _fw.Log($"{nameof(FilePostProcess)}:Move", $"{jobName}\t{directoryPath}/{file.FileName} -> {toRelativePath}");
                        await endpoint.Move(directoryPath, file.FileName, toRelativePath);
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

                            return async (file, directoryPath, endpoint, refId) =>
                            {
                                await _fw.Log($"{nameof(FilePostProcess)}:Rename", $"{jobName}\t{directoryPath}/{file.FileName} rename with regex {pattern} replace {replace}");
                                await endpoint.Rename(directoryPath, file.FileName, rx, replace, overwrite);
                            };
                        }
                        var msg = $"Invalid config for Rename: {postProcessCmd}";

                        if (commitAfterPost) throw new Exception(msg);

                        await _fw.Error($"{nameof(FilePostProcess)}:Rename", msg);
                    }

                    if (cmd == "CallFn")
                    {
                        var argsTemplate = ppge.GetS("args");
                        var payloadTemplate = ppge.GetS("payload");
                        var connection = ppge.GetS("connection");
                        var function = ppge.GetS("function");
                        var errorJsonPath = ppge.GetS("errorJsonPath");

                        return async (file, directoryPath, endpoint, refId) =>
                        {
                            if (endpoint is FtpEndPoint) throw new NotImplementedException();

                            var args = Jw.TryParseObject(ReplacePatternTokens(argsTemplate, file.Pattern)?
                                .Replace("{fileName}", file.FileName)
                                .Replace("{fileSourceDirectory}", file.SourceDirectory)
                                .Replace("{fileDate}", (file.FileDate?.ToString()).IfNullOrWhitespace(""))
                                .Replace("{directoryPath}", directoryPath)
                                .Replace("{ref}",
                                    refId.ToString()));

                            if (file.FileDate.HasValue) args["file_date"] = file.FileDate;

                            bool SearchForAdditionalFields(JObject jo)
                            {
                                if (jo.ContainsKey("__additionalFields__"))
                                {
                                    jo.Remove("__additionalFields__");
                                    foreach (var f in file.AdditionalFields)
                                    {
                                        jo.Add(f.Key, f.Value);
                                    }
                                    return true;
                                }

                                foreach (var p in jo.Properties())
                                {
                                    if (p.Value.Type == JTokenType.Object && SearchForAdditionalFields(p.Value as JObject)) return true;
                                }

                                return false;
                            }

                            SearchForAdditionalFields(args);

                            var payload = ReplacePatternTokens(payloadTemplate, file.Pattern)?
                                .Replace("{fileName}", file.FileName)
                                .Replace("{fileSourceDirectory}", file.SourceDirectory)
                                .Replace("{fileDate}", (file.FileDate?.ToString()).IfNullOrWhitespace(""))
                                .Replace("{directoryPath}", directoryPath)
                                .Replace("{ref}",
                                    refId.ToString());
                            await _fw.Log($"{nameof(Program)}", $"{jobName}\tRunning post process. Ref: {refId} {endpoint}:\r\nConfig: {ppge.GetS("")}\r\nArgs: {args}\r\nPayload: {payload}");
                            var res = await Data.CallFn(connection, function, args.ToString(), payload);

                            if (res?.GetS("").IsNullOrWhitespace() != false)
                            {
                                var msg = $"Post Process CallFn failed. DB null response. Ref: {refId} {endpoint}\r\nConfig: {ppge.GetS("")}\r\nArgs: {args}\r\nPayload: {payload}";

                                if (commitAfterPost) throw new Exception(msg);

                                await _fw.Error($"{nameof(FilePostProcess)}:{cmd}", msg);

                                return;
                            }

                            if (res.GetS(errorJsonPath).IsNullOrWhitespace() == false)
                            {
                                var msg = $"Post Process CallFn failed ({endpoint}). DB response: Ref: {refId} {res.GetS("")}\r\nConfig: {ppge.GetS("")}\r\nArgs: {args}\r\nPayload: {payload}";

                                if (commitAfterPost) throw new Exception(msg);

                                await _fw.Error($"{nameof(FilePostProcess)}:{cmd}", msg);

                                return;
                            }

                            await _fw.Log($"{nameof(FilePostProcess)}:{cmd}", $"Completed CallFn: \r\nArgs: {args}\r\nPayload: {payload}\r\nResult: {res.GetS("")}");
                        };
                    }
                }
            }

            return (file, directoryPath, endpoint, refId) => Task.CompletedTask;
        }

        private static string ReplacePatternTokens(string str, Pattern pattern)
        {
            if (str.IsNullOrWhitespace() || pattern.TokenFields == null) return str;

            int start = 0;

            int GetNextIndex() => str.IndexOf("{ptrn_", start, StringComparison.CurrentCulture);

            while ((start = GetNextIndex()) > -1)
            {
                var end = str.IndexOf("}", start, StringComparison.CurrentCulture);
                var token = str.Substring(start, end - start + 1);
                var patternFieldName = token.Match(new Regex(@"{ptrn_(?<fieldName>[^}]+)}"), "fieldName");
                var value = pattern.TokenFields.GetS(patternFieldName);

                if (value == null) continue;

                str = str.Replace(token, value);
            }

            return str;
        }

        private static async Task<Endpoint> GetEnpointConfig(IGenericEntity jobCfg, string name)
        {
            var ge = jobCfg.GetE($"{name}");

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
