using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.GenericEntity;


namespace Utility.Mta
{
    public class PmtaMailService : MailService
    {
        public PmtaMailService(FrameworkWrapper fw, string configRootPath) : base(fw, configRootPath)
        {
        }

        public override async Task<IEnumerable<MailResult>> Send(MailMessage msg)
        {
            if (msg?.To?.Any() != true) return null;

            var conf = _fw.StartupConfiguration.GetE(_configRootPath);

            if (conf == null) throw new Exception($"MTA configuration not found. ConfigRootPath: {_configRootPath}");

            var ip = conf.GetS($"DomainIps/{msg.FromDomain.ToLower()}") ?? conf.GetS("DomainIps/*") ?? conf.GetS("Ip");

            if (ip.IsNullOrWhitespace()) throw new Exception($"Failed to retrieve VMTA IP. FromDomain: {msg.FromDomain} Config: {conf.GetS("")}");

            return await GetRecipientMessages(msg).SelectAsync(async rm => rm.Success ? await SendToPmta(ip, rm) : new MailResult(rm.Recipient, rm.Errors));
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
                await _fw.Error(nameof(PmtaMailService), $"Unhandled exception mailing {msg.Recipient.Address} on {ip}: PMTA: {ToString()}\n\nException: {e.UnwrapForLog()}");
                errors.Add($"Unhandled exception: {e.Message}");
            }

            return new MailResult(msg.Recipient, errors);
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