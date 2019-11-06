using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;

namespace Utility.Mta
{
    public class MailPackage
    {
        public MailPackage() { }

        public MailPackage(Sender sender, Recipient to, string jobId, string subject, string body, IEnumerable<KeyValuePair<string, string>> headers)
        {
            From = sender;
            To = new[] {to};
            JobId = jobId;
            Subject = subject;
            Body = body;
            Headers = headers;
            FromHasTokens = MailService.HasTokens(From.Address).Any() || MailService.HasTokens(From.LocalPart).Any() || MailService.HasTokens(From.Domain).Any();
        }

        public MailPackage(Sender sender, string to, string jobId, string subject, string body, IEnumerable<KeyValuePair<string, string>> headers)
        {
            From = sender;
            To = new[] {new Recipient(new MailAddress(to), null),};
            JobId = jobId;
            Subject = subject;
            Body = body;
            Headers = headers;
            FromHasTokens = MailService.HasTokens(From.Address).Any() || MailService.HasTokens(From.LocalPart).Any() || MailService.HasTokens(From.Domain).Any();
        }

        public MailPackage(Sender sender, IEnumerable<Recipient> to, string jobId, string subject, string body, IEnumerable<KeyValuePair<string, string>> headers)
        {
            From = sender;
            To = to;
            JobId = jobId;
            Subject = subject;
            Body = body;
            Headers = headers;
            FromHasTokens = MailService.HasTokens(From.Address).Any() || MailService.HasTokens(From.LocalPart).Any() || MailService.HasTokens(From.Domain).Any();
        }

        public Sender From { get; set; }
        public bool FromHasTokens { get; }
        public IEnumerable<Recipient> To { get; set; }
        public string JobId { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public IEnumerable<KeyValuePair<string, string>> Headers { get; set; }
    }
}