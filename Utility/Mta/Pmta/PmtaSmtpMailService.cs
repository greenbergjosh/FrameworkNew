using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Utility.Mta.Pmta
{
    public class PmtaSmtpMailService : MailService
    {
        private readonly string _pmtaAddress;
        private readonly int _port;
        private readonly bool _ssl;

        public PmtaSmtpMailService(FrameworkWrapper fw, string configRootPath) : base(fw, configRootPath) { }

        public override async Task<IEnumerable<MailResult>> Send(MailPackage pkg, string vmta = null)
        {
            CleanAndValidatePackage(pkg);

            vmta = GetVmtaIp(pkg, vmta);
            
            var recipients = GetRecipientMessages(pkg);
            var results = new List<MailResult>();

            using (var smtp = new SmtpClient(_pmtaAddress, _port))
            {
                smtp.EnableSsl = _ssl;

                foreach (var r in recipients)
                {
                    var errors = new List<string>();

                    try
                    {
                        var msg = new MailMessage(new MailAddress(r.From.Address), r.To.Address)
                        {
                            Subject = r.Subject,
                            Body = r.Body,
                            IsBodyHtml = true
                        };

                        msg.Headers.Add("x-job", pkg.JobId);
                        msg.Headers.Add("x-envid", r.To.SendId);

                        pkg.Headers?.ForEach(h => msg.Headers.Add(h.Key, h.Value));

                        smtp.Send(msg);
                    }
                    catch (Exception e)
                    {
                        await Fw.Error(nameof(PmtaPipeMailService), $"Unhandled exception mailing {r.To.Address} on {vmta}: PMTA: {ToString()}\n\nException: {e.UnwrapForLog()}");
                        errors.Add($"Unhandled exception: {e.Message}");
                    }

                    results.Add(new MailResult(r.To, errors));
                }
            }

            return results;
        }

        public override Task<string> GetStatus(string jobId)
        {
            throw new System.NotImplementedException();
        }
    }
}