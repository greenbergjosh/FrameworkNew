using System.Collections.Generic;
using System.Linq;

namespace Utility.Mta
{
    public class MailResult
    {
        public MailResult()
        {
        }

        internal MailResult(Recipient recipient, ICollection<string> errors)
        {
            Recipient = recipient;
            Errors = errors;
        }

        public Recipient Recipient { get; internal set; }
        public ICollection<string> Errors { get; internal set; }
        public bool Success => Errors?.Any() != true;
    }
}