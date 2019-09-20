using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using port25.pmta.api.submitter;
using Utility.GenericEntity;
using Port25Recipient = port25.pmta.api.submitter.Recipient;

namespace Utility.Mta.Pmta
{
    public class PmtaLibMailService : MailService
    {
        private readonly bool _enableStatistics;
        private readonly string _pmtaAddress;
        private readonly int _port;

        public PmtaLibMailService(FrameworkWrapper fw, string configRootPath) : base(fw, configRootPath)
        {
            var config = fw.StartupConfiguration.GetE(ConfigRootPath);

            if (config == null) throw new Exception($"MTA configuration not found. ConfigRootPath: {ConfigRootPath}");

            _enableStatistics = config.GetB("CollectStats");
            _pmtaAddress = config.GetS("Host");
            _port = config.GetS("Port").ParseInt() ?? 25;
        }

        public override async Task<IEnumerable<MailResult>> Send(MailPackage pkg, string vmta = null)
        {
            CleanAndValidatePackage(pkg);

            vmta = GetVmtaIp(pkg, vmta);

            var recipients = GetRecipientMessages(pkg);
            var results = new List<MailResult>();
            var stats = StartStats();
            var stat = stats.StartNewInstance("Connect", TimeSpan.FromMinutes(5));
            var mta = new Connection(_pmtaAddress, _port);

            stat.Completed();

            foreach (var r in recipients)
            {
                stat = stats.StartNewInstance("Building message", TimeSpan.FromSeconds(30));
                var errors = new List<string>();

                try
                {
                    var msg = new Message(r.From.Address)
                    {
                        Encoding = Encoding.EightBit,
                        ReturnType = ReturnType.Headers,
                        VirtualMTA = vmta,
                        EnvID = r.To.SendId,
                        JobID = pkg.JobId
                    };

                    msg.AddRecipient(new Port25Recipient(r.To.Address.Address));

                    var headerStr = r.Headers?.Select(h => $"{h.Key}: {h.Value}").Join("\n");

                    if (!headerStr.IsNullOrWhitespace()) msg.AddData(headerStr);

                    msg.AddData($"Content-Type: text/html; charset=utf-8\n\n{r.Body}");

                    stat.Completed();
                    stat = stats.StartNewInstance("Building message", TimeSpan.FromMinutes(1));
                    mta.Submit(msg);
                }
                catch (Exception e)
                {
                    await Fw.Error(nameof(PmtaPipeMailService), $"Unhandled exception mailing {r.To.Address} on {vmta}: PMTA: {ToString()}\n\nException: {e.UnwrapForLog()}");
                    errors.Add($"Unhandled exception: {e.Message}");
                }
                finally
                {
                    stat.Completed();
                    results.Add(new MailResult(r.To, errors));
                }
            }

            if (_enableStatistics)
            {
                await Fw.Log($"{nameof(PmtaPipeMailService)}.Statistics", JsonWrapper.Serialize(new {host = _pmtaAddress, port = _port, package = pkg, results, stats = stats.GetResults()}));
            }

            return results;
        }

        public override Task<string> GetStatus(string jobId)
        {
            throw new NotImplementedException();
        }

        private IStatsProvider StartStats() => _enableStatistics ? (IStatsProvider) new StatsProvider() : new NullStatsProvider();

        #region ConnectionPoolingBeta

        private readonly bool _useConnectionPooling = false;
        private readonly bool _maxConnections = false;
        private readonly ConcurrentBag<(Connection conn, DateTime? reserved)> _connections;
        private readonly ConcurrentQueue<Connection> _availableConnections;

        #endregion
    }
}