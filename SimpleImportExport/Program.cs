﻿using System;
using System.Linq;
using System.Net;
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
            var jobName = args[0];

            try
            {
                Fw = new FrameworkWrapper();
                var jobIdStr = Fw.StartupConfiguration.GetS("Config/Jobs/" + jobName);

                if (!Guid.TryParse(jobIdStr, out var jobId))
                {
                    await Fw.Err(ErrorSeverity.Error, $"{nameof(Program)}", ErrorDescriptor.Exception, $"Invalid Job Id: {jobName}:{jobIdStr}");
                    Console.WriteLine("Invalid Job Id");
                    return;
                }

                var sqlTimeoutSec = Fw.StartupConfiguration.GetS("Config/SqlTimeoutSec").ParseInt() ?? 5;
                ServicePointManager.DefaultConnectionLimit = Fw.StartupConfiguration.GetS("Config/MaxConnections").ParseInt() ?? 5;
                var jobCfg = await Fw.Entities.GetEntityGe(jobId);

                var src = GetEnpointConfig(jobCfg, "Source");
                var dest = GetEnpointConfig(jobCfg, "Destination");
                var jobPost = jobCfg.GetS("Config/JobPostProcess");
                var srcPost = FilePostProcess(jobCfg.GetS("Config/Source/PostProcess"), jobName);
                var destPost = FilePostProcess(jobCfg.GetS("Config/Destination/PostProcess"), jobName);
                var srcFiles = (await src.GetFiles()).ToArray();

                await Fw.Err(ErrorSeverity.Log, $"{nameof(Program)}", ErrorDescriptor.Log, $"{jobName}\tFound {srcFiles.Length} on {src}");

                foreach (var f in srcFiles)
                {
                    try
                    {
                        var shouldDownload = await SqlWrapper.SqlServerProviderEntry("SimpleImportExport", "spShouldTransfer", Jw.Json(new { JobId = jobId, FileName = f.name }), "", sqlTimeoutSec);

                        if (shouldDownload == "1")
                        {
                            await Fw.Err(ErrorSeverity.Log, $"{nameof(Program)}", ErrorDescriptor.Log, $"{jobName}\tCopying {f.name}:\n\tFrom: {src}\n\tTo: {dest}\n\t{f.srcPath} -> {f.destPath}");

                            var fileSize = await dest.SendStream(f, src);
                            var sargs = Jw.Json(new { JobId = jobId, FileName = f.name, FileSize = fileSize, FileLineCount = 0 });
                            var res = await SqlWrapper.SqlToGenericEntity("SimpleImportExport", "LogTransfer", sargs, "", timeout: sqlTimeoutSec);

                            if (res.GetS("Result") != "Success") throw new Exception($"Sql exception logging download: {res.GetS("Message")} Args: {sargs}");

                            await srcPost(f.srcPath, src);
                            await destPost(f.destPath, dest);
                        }
                    }
                    catch (Exception e)
                    {
                        await Fw.Err(ErrorSeverity.Error, $"{nameof(Program)}", ErrorDescriptor.Exception, $"{jobName}\tError processing {f.name}: {e}");
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
                        await Fw.Err(ErrorSeverity.Error, $"{nameof(Program)}", ErrorDescriptor.Exception, $"{jobName}\tError Post Processing: {e}");
                    }
                }

                await Fw.Err(ErrorSeverity.Log, $"{nameof(Program)}", ErrorDescriptor.Log, $"{jobName}\tCompleted");
            }
            catch (Exception e)
            {
                await Fw.Err(ErrorSeverity.Error, $"{nameof(Program)}", ErrorDescriptor.Exception, $"{jobName}\tFailed to load: {e}");
            }
        }

        private static async Task JobPostProcess(string postProcessCmd, string jobName)
        {
            if (postProcessCmd?.StartsWith("Http:Get:") == true)
            {
                var url = postProcessCmd.Substring(9);

                await Fw.Err(ErrorSeverity.Log, $"{nameof(JobPostProcess)}:Http:Get", ErrorDescriptor.Log, $"{jobName}\t{url}");
                await ProtocolClient.HttpGetAsync(url, 30);
            }
        }

        private static Func<string, Endpoint, Task> FilePostProcess(string postProcessCmd, string jobName)
        {
            if (postProcessCmd == "Delete")
            {
                return async (fileRelativePath, endpoint) =>
                {
                    await Fw.Err(ErrorSeverity.Log, $"{nameof(FilePostProcess)}:Delete", ErrorDescriptor.Log, $"{jobName}\t{fileRelativePath}");
                    await endpoint.Delete(fileRelativePath);
                };
            }

            if (postProcessCmd?.StartsWith("Move:") == true)
            {
                var toRelativePath = postProcessCmd.Substring(5);

                return async (fileRelativePath, endpoint) =>
                {
                    await Fw.Err(ErrorSeverity.Log, $"{nameof(FilePostProcess)}:Move", ErrorDescriptor.Log, $"{jobName}\t{fileRelativePath} -> {toRelativePath}");
                    await endpoint.Move(fileRelativePath, toRelativePath);
                };
            }

            return async (s, endpoint) => await Task.CompletedTask;
        }

        private static Endpoint GetEnpointConfig(IGenericEntity jobCfg, string name)
        {
            var ge = jobCfg.GetE($"Config/{name}");
            var type = (EndpointType)Enum.Parse(typeof(EndpointType), ge.GetS("Type"));

            switch (type)
            {
                case EndpointType.Local:
                    return new LocalEndPoint(ge);
                case EndpointType.Ftp:
                    return new FtpEndPoint(ge);
                default:
                    throw new ArgumentOutOfRangeException($"Invalid Endpoint Type {type}. Must be {EndpointType.Local} or {EndpointType.Ftp}");
            }
        }

    }
}
