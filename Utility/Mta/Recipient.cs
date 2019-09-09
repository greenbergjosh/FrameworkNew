using System.Collections.Generic;
using System.Net.Mail;

namespace Utility.Mta
{
    public class Recipient
    {
        public Recipient()
        {
        }

        public Recipient(MailAddress address, Dictionary<string, string> tokens)
        {
            Address = address;
            Tokens = tokens;
        }

        public MailAddress Address { get; set; }
        
        /// <summary>
        /// Tokens to replace in strings:
        /// With key = "rcp" & value = "John" 
        ///  "Hello ${rcp}, check this out" -> "Hello John, check this out"
        /// </summary>
        public Dictionary<string, string> Tokens { get; set; }
        public string SendId { get; set; }
    }
}