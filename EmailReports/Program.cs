using System;
using System.Linq;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;

namespace EmailReports
{
    public class Program
    {
        private static FrameworkWrapper _fw = null;

        static async Task Main(string[] args)
        {

            IGenericEntity jconf;
            var jobName = args.FirstOrDefault();

            if (jobName.IsNullOrWhitespace())
            {
                var msg = $"Job name not defined";

                await _fw.Error(nameof(Main), msg);
                Console.WriteLine(msg);
                return;
            }

            try
            {
                _fw = new FrameworkWrapper();

                jconf = _fw.StartupConfiguration.GetE($"Config/Jobs/{jobName}");

                if (jconf == null)
                {
                    var msg = $"No config found for job name {jobName}";

                    await _fw.Error(nameof(Main), msg);
                    Console.WriteLine(msg);
                    return;
                }
            }
            catch (Exception e)
            {
                await (_fw?.Error(nameof(Main), e.UnwrapForLog()) ?? Task.CompletedTask);
                Console.WriteLine(e.UnwrapForLog());
                return;
            }

            try
            {
                await RunJob(jobName, jconf);
            }
            catch (Exception e)
            {
                await _fw.Error(nameof(RunJob), e.UnwrapForLog());
            }
        }

        private static async Task RunJob(string jobName, IGenericEntity job)
        {
            var conn = job.GetS("Connection");
            var func = job.GetS("Method");
            var args = job.GetS("Args") ?? JsonWrapper.Empty;
            var payload = job.GetS("Payload") ?? JsonWrapper.Empty;
            var res = Data.CallFn(conn, func, args, payload);

            job.GetL("").Where(g => g.GetS("lastname") == "bec");
        }

    }
}
