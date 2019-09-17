using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Utility.Mta.Pmta
{
    // This could be an LBM and keep the benefits of inheritance if we introduce the concept of late bound classes. Like plugins but without compiled DLLs
    public class PmtaPipeMailService : MailService
    {
        public PmtaPipeMailService(FrameworkWrapper fw, string configRootPath) : base(fw, configRootPath)
        {
            
        }

        public override async Task<IEnumerable<MailResult>> Send(MailPackage pkg)
        {
            if (pkg?.To?.Any() != true) return null;

            var conf = _fw.StartupConfiguration.GetE(_configRootPath);

            var ip = conf.GetS($"DomainIps/{pkg.From.Domain.ToLower()}") ?? conf.GetS("DomainIps/*") ?? conf.GetS("Ip");

            if (ip.IsNullOrWhitespace()) throw new Exception($"MTA configuration not found. ConfigRootPath: {_configRootPath}");

            if (ip.IsNullOrWhitespace()) throw new Exception($"Failed to retrieve VMTA IP. FromDomain: {pkg.From.Domain} Config: {conf.GetS("")}");

            return await GetRecipientMessages(pkg).SelectAsync(async rm => rm.Success ? await SendToPmta(ip, rm) : new MailResult(rm.To, rm.Errors));
        }

        private async Task<MailResult> SendToPmta(string ip, RecipientMessage msg)
        {
            var errors = new List<string>();

            try
            {
                throw new NotImplementedException();
            }
            catch (Exception e)
            {
                await _fw.Error(nameof(PmtaPipeMailService), $"Unhandled exception mailing {msg.To.Address} on {ip}: PMTA: {ToString()}\n\nException: {e.UnwrapForLog()}");
                errors.Add($"Unhandled exception: {e.Message}");
            }

            return new MailResult(msg.To, errors);
        }

        public override async Task<string> GetStatus(string jobId)
        {
            throw new NotImplementedException();
        }

        public override string ToString()
        {
            return _fw.StartupConfiguration.GetS(_configRootPath);
        }
    }
}