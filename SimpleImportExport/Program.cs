using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.Entity;
using Utility.Entity.Implementations;

namespace SimpleImportExport
{
    internal class Program
    {
        public static FrameworkWrapper _fw;

        private delegate Task PostProcess(SourceFileInfo file, string directoryPath, Endpoint endpoint, Guid refId);

        public static async Task Main(string[] args)
        {
            if (!args.Any())
            {
                throw new Exception("Job name parameter not provided");
            }

            var jobName = args[0];

            try
            {
                _fw = await FrameworkWrapper.Create(args);
            }
            catch (Exception e)
            {
                Console.WriteLine($"Failed to load FrameworkWrapper {e.UnwrapForLog()}");
                throw;
            }

            try
            {
                _fw.LogMethodPrefix = $"{jobName}::";

                var jobIdStr = await _fw.StartupConfiguration.EvalS($"Jobs.{jobName}");

                if (!Guid.TryParse(jobIdStr, out var jobId))
                {
                    await _fw.Error($"{nameof(Program)}", $"Invalid Job Id: {jobName}:{jobIdStr}");
                    Console.WriteLine("Invalid Job Id");
                    return;
                }

                await _fw.Log($"{nameof(Program)}", $"Getting job config: {jobName}:{jobIdStr}");

                var sqlTimeoutSec = await _fw.StartupConfiguration.EvalI("SqlTimeoutSec", 5);
                ServicePointManager.DefaultConnectionLimit = await _fw.StartupConfiguration.EvalI("MaxConnections", 5);
                var jobCfg = await _fw.Entity.EvalE($"config://{jobId}");

                var src = await GetEnpointConfig(jobCfg, "Source");
                var dest = await GetEnpointConfig(jobCfg, "Destination");
                var commitAfterPost = await jobCfg.EvalB("CommitAfterPostProcess", false);
                var jobPost = await jobCfg.EvalS("JobPostProcess");
                var srcPost = await FilePostProcess(await jobCfg.EvalS("Source.PostProcess"), jobName, commitAfterPost);
                var destPost = await FilePostProcess(await jobCfg.EvalS("Destination.PostProcess"), jobName, commitAfterPost);
                var srcFiles = (await src.GetFiles()).ToArray();

                await _fw.Log($"{nameof(Program)}", $"{jobName}\tFound {srcFiles.Length} on {src}");

                foreach (var f in srcFiles)
                {
                    try
                    {
                        var shouldDownload = await Data.CallFn("SimpleImportExport", "shouldTransfer", JsonSerializer.Serialize(new { JobId = jobId, f.FileName }));

                        if (await shouldDownload.EvalAsS() == "1" || await shouldDownload.EvalB("result", true))
                        {
                            await _fw.Log($"{nameof(Program)}", $"{jobName}\tCopying {f.FileName}:\n\tFrom: {src}\n\tTo: {dest}");

                            var refId = Guid.NewGuid();
                            var (size, records, destinationDirectoryPath) = await dest.SendStream(f, src);
                            await _fw.Log($"{nameof(Program)}", $"{jobName}\tCopy complete {f.FileName}:\n\tFrom: {src}\n\tTo: {dest}");
                            var sargs = JsonSerializer.Serialize(new { JobId = jobId, f.FileName, FileSize = size, Records = records, Ref = refId, f.FileDate });

                            async Task Commit()
                            {
                                var res = await Data.CallFn("SimpleImportExport", "logTransfer", sargs, "", timeout: sqlTimeoutSec);

                                if (await res.EvalS("result") != "Success")
                                {
                                    throw new Exception($"Sql exception logging download: {res} Args: {sargs}");
                                }
                            }

                            if (!commitAfterPost)
                            {
                                await Commit();
                            }

                            await srcPost(f, f.SourceDirectory, src, refId);
                            await destPost(f, destinationDirectoryPath, dest, refId);

                            if (commitAfterPost)
                            {
                                await Commit();
                            }
                        }
                        else if (!string.IsNullOrWhiteSpace(await shouldDownload.EvalS("err")))
                        {
                            await _fw.Error(nameof(SimpleImportExport), $"ShouldDownload failed: {await shouldDownload.EvalS("err")}");
                        }
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
                var url = postProcessCmd[9..];

                await _fw.Log($"{nameof(JobPostProcess)}:JobPostProcess:Http:Get", $"{jobName}\t{url}");
                _ = await ProtocolClient.HttpGetAsync(url, null, 30);
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
                    var toRelativePath = postProcessCmd[5..];

                    return async (file, directoryPath, endpoint, refId) =>
                    {
                        await _fw.Log($"{nameof(FilePostProcess)}:Move", $"{jobName}\t{directoryPath}/{file.FileName} -> {toRelativePath}");
                        await endpoint.Move(directoryPath, file.FileName, toRelativePath);
                    };
                }

                var (parsed, ppge) = await _fw.Entity.TryParse("application/json", postProcessCmd);

                if (parsed && ppge != null)
                {
                    var cmd = await ppge.EvalS("cmd");

                    if (cmd == "Rename")
                    {
                        var pattern = await ppge.EvalS("pattern");
                        var replace = await ppge.EvalS("replace");
                        var overwrite = await ppge.EvalB("overwrite", false);

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

                        if (commitAfterPost)
                        {
                            throw new Exception(msg);
                        }

                        await _fw.Error($"{nameof(FilePostProcess)}:Rename", msg);
                    }

                    if (cmd == "CallFn")
                    {
                        var argsTemplate = await ppge.EvalS("args");
                        var payloadTemplate = await ppge.EvalS("payload");
                        var connection = await ppge.EvalS("connection");
                        var function = await ppge.EvalS("function");
                        var errorJsonPath = await ppge.EvalS("errorJsonPath");

                        return async (file, directoryPath, endpoint, refId) =>
                        {
                            if (endpoint is FtpEndPoint)
                            {
                                throw new NotImplementedException();
                            }

                            var argsStack = new EntityDocumentStack();
                            var args = _fw.Entity.Create(argsStack);

                            var (parsed, baseArgs) = await _fw.Entity.TryParse("application/json", (await ReplacePatternTokens(argsTemplate, file.Pattern))?
                                .Replace("{fileName}", file.FileName)
                                .Replace("{fileSourceDirectory}", file.SourceDirectory)
                                .Replace("{fileDate}", (file.FileDate?.ToString()).IfNullOrWhitespace(""))
                                .Replace("{directoryPath}", directoryPath)
                                .Replace("{ref}", refId.ToString()));

                            if (parsed)
                            {
                                argsStack.Push(baseArgs);
                            }

                            if (file.FileDate.HasValue)
                            {
                                argsStack.Push(_fw.Entity.Create(new Dictionary<string, DateTime?> { ["file_date"] = file.FileDate }));
                            }

                            var payload = (await ReplacePatternTokens(payloadTemplate, file.Pattern))?
                                .Replace("{fileName}", file.FileName)
                                .Replace("{fileSourceDirectory}", file.SourceDirectory)
                                .Replace("{fileDate}", (file.FileDate?.ToString()).IfNullOrWhitespace(""))
                                .Replace("{directoryPath}", directoryPath)
                                .Replace("{ref}", refId.ToString());

                            await _fw.Log($"{nameof(Program)}", $"{jobName}\tRunning post process. Ref: {refId} {endpoint}:\r\nConfig: {ppge}\r\nArgs: {args}\r\nPayload: {payload}");
                            var res = await Data.CallFn(connection, function, args.ToString(), payload);

                            if ((await res?.EvalAsS("@")).IsNullOrWhitespace() != false)
                            {
                                var msg = $"Post Process CallFn failed. DB null response. Ref: {refId} {endpoint}\r\nConfig: {ppge}\r\nArgs: {args}\r\nPayload: {payload}";

                                if (commitAfterPost)
                                {
                                    throw new Exception(msg);
                                }

                                await _fw.Error($"{nameof(FilePostProcess)}:{cmd}", msg);

                                return;
                            }

                            if ((await res.EvalS(errorJsonPath)).IsNullOrWhitespace() == false)
                            {
                                var msg = $"Post Process CallFn failed ({endpoint}). DB response: Ref: {refId} {res}\r\nConfig: {ppge}\r\nArgs: {args}\r\nPayload: {payload}";

                                if (commitAfterPost)
                                {
                                    throw new Exception(msg);
                                }

                                await _fw.Error($"{nameof(FilePostProcess)}:{cmd}", msg);

                                return;
                            }

                            await _fw.Log($"{nameof(FilePostProcess)}:{cmd}", $"Completed CallFn: \r\nArgs: {args}\r\nPayload: {payload}\r\nResult: {res}");
                        };
                    }
                }
            }

            return (file, directoryPath, endpoint, refId) => Task.CompletedTask;
        }

        private static async Task<string> ReplacePatternTokens(string str, Pattern pattern)
        {
            if (str.IsNullOrWhitespace() || pattern.TokenFields == null)
            {
                return str;
            }

            var start = 0;

            int GetNextIndex() => str.IndexOf("{ptrn_", start, StringComparison.CurrentCulture);

            while ((start = GetNextIndex()) > -1)
            {
                var end = str.IndexOf("}", start, StringComparison.CurrentCulture);
                var token = str.Substring(start, end - start + 1);

                var matchResult = new Regex(@"{ptrn_(?<fieldName>[^}]+)}").Match(token);

                var patternFieldName = matchResult.Success ? matchResult.Groups["fieldName"]?.Value : null;
                var value = await pattern.TokenFields.EvalS(patternFieldName, null);

                if (value == null)
                {
                    continue;
                }

                str = str.Replace(token, value);
            }

            return str;
        }

        private static async Task<Endpoint> GetEnpointConfig(Entity jobCfg, string name)
        {
            var ge = await jobCfg.EvalE($"{name}");

            try
            {
                var type = (EndpointType)Enum.Parse(typeof(EndpointType), await ge.EvalS("$meta.type"));

                return type switch
                {
                    EndpointType.Local => await LocalEndPoint.Create(ge, _fw),
                    EndpointType.Ftp => await FtpEndPoint.Create(ge),
                    _ => throw new ArgumentOutOfRangeException($"Invalid Endpoint Type {type}. Must be {EndpointType.Local} or {EndpointType.Ftp}"),
                };
            }
            catch (Exception e)
            {
                await _fw.Error(nameof(GetEnpointConfig), $"Failed to load endpoint: {ge} ex: ${e.UnwrapForLog()}");
                throw;
            }
        }
    }
}
