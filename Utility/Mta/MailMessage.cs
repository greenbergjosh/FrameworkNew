using System.Collections.Generic;

namespace Utility.Mta
{
    public class MailMessage
    {
        public MailMessage()
        {
        }

        public MailMessage(string fromLocalPart, string fromDomain, string friendlyFrom, Recipient to, string jobId, string sendId, string subject, string body, IEnumerable<KeyValuePair<string, string>> headers)
        {
            FriendlyFrom = friendlyFrom;
            FromLocalPart = fromLocalPart;
            FromDomain = fromDomain;
            To = new[] {to};
            JobId = jobId;
            SendId = sendId;
            Subject = subject;
            Body = body;
            Headers = headers;
        }

        public MailMessage(string fromLocalPart, string fromDomain, string friendlyFrom, IEnumerable<Recipient> to, string jobId, string sendId, string subject, string body, IEnumerable<KeyValuePair<string, string>> headers)
        {
            FriendlyFrom = friendlyFrom;
            FromLocalPart = fromLocalPart;
            FromDomain = fromDomain;
            To = to;
            JobId = jobId;
            SendId = sendId;
            Subject = subject;
            Body = body;
            Headers = headers;
        }

        public string FriendlyFrom { get; set; }
        public string FromLocalPart { get; set; }
        public string FromDomain { get; set; }
        public IEnumerable<Recipient> To { get; set; }
        public string JobId { get; set; }
        public string SendId { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public IEnumerable<KeyValuePair<string, string>> Headers { get; set; }
    }
}