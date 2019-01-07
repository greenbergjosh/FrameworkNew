using System;
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
            Fw = new FrameworkWrapper();

            if (!Guid.TryParse(Fw.StartupConfiguration.GetS("Config/Jobs/" + args[0]), out var jobId))
            {
                Console.WriteLine("Invalid Job Id");
                return;
            }

            var sqlTimeoutSec = Fw.StartupConfiguration.GetS("Config/SqlTimeoutSec").ParseInt() ?? 5;
            ServicePointManager.DefaultConnectionLimit = Fw.StartupConfiguration.GetS("Config/MaxConnections").ParseInt() ?? 5;
            var jobCfg = await Fw.Entities.GetEntityGe(jobId);

            var src = GetEnpointConfig(jobCfg, "Source");
            var dest = GetEnpointConfig(jobCfg, "Destination");
            var jobPost = jobCfg.GetS("JobPostProcess");
            var srcPost = FilePostProcess(jobCfg.GetS("SourcePostProcess"));
            var destPost = FilePostProcess(jobCfg.GetS("DestinationPostProcess"));

            foreach (var f in await src.GetFiles())
            {
                var shouldDownload = await SqlWrapper.SqlServerProviderEntry("SimpleImportExport", "ShouldDownload", Jw.Json(new { JobId = jobId, FileName = f.name }), "", sqlTimeoutSec);

                if (shouldDownload == "1")
                {
                    var fileSize = await dest.SendStream(f, src);
                    var sargs = Jw.Json(new { JobId = jobId, FileName = f.name, FileSize = fileSize, FileLineCount = 0 });
                    var res = await SqlWrapper.SqlToGenericEntity("SimpleImportExport", "LogTransfer", sargs, "", timeout: sqlTimeoutSec);

                    if (res.GetS("Result") != "Success") throw new Exception($"Sql exception logging download: {res.GetS("Message")} Args: {sargs}");

                    await srcPost(f.srcPath, src);
                    await destPost(f.destPath, dest);
                }
            }

            await JobPostProcess(jobPost);
        }

        private static async Task JobPostProcess(string postProcessCmd)
        {
            if (postProcessCmd.StartsWith("Http:Get:"))
            {
                var url = postProcessCmd.Substring(9);

                await ProtocolClient.HttpGetAsync(url, 30);
            }
        }

        private static Func<string, Endpoint, Task> FilePostProcess(string postProcessCmd)
        {
            if (postProcessCmd == "Delete")
            {
                return async (fileRelativePath, endpoint) => await endpoint.Delete(fileRelativePath);
            }

            if (postProcessCmd.StartsWith("Move:"))
            {
                var toRelativePath = postProcessCmd.Substring(5);

                return async (fileRelativePath, endpoint) => await endpoint.Move(fileRelativePath, toRelativePath);
            }

            return async (s, endpoint) => await Task.CompletedTask;
        }

        private static Endpoint GetEnpointConfig(IGenericEntity jobCfg, string name)
        {
            var ge = jobCfg.GetE($"{name}");
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
