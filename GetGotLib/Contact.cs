using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Utility;

namespace GetGotLib
{

    public enum ContactType
    {
        Unknown = 0, Email = 1, USPhone = 2
    }

    public class Contact
    {
        private Regex _emailRx = new Regex(@"[^@]+@[^@]+\.[^@.]+", RegexOptions.Compiled | RegexOptions.IgnoreCase);
        private static string[] USPhoneRemoveChars = " +()-\u05BE\u1806\u2010\u2011\u2012\u2013\u2014\u2015\u207B\u208B\u2212\uFE58\uFE63\uFF0D".Select(c => c.ToString()).ToArray();
        private string _json = null;

        public Contact(string contact)
        {
            contact = contact.Trim();
            Raw = contact;

            if (_emailRx.IsMatch(contact))
            {
                Type = ContactType.Email;
                Cleaned = contact;
            }

            var cleanedUSPhone = USPhoneRemoveChars.Aggregate(contact, (s, c) => s.Replace(c, ""));

            cleanedUSPhone = cleanedUSPhone.TrimStart('1');

            var pi = cleanedUSPhone.ParseInt();

            if (pi.HasValue && cleanedUSPhone.Length == 10)
            {
                Type = ContactType.USPhone;
                Cleaned = cleanedUSPhone;
            }
        }

        public string ToJson()
        {
            if (_json == null)
            {
                switch (Type)
                {
                    case ContactType.Unknown:
                        _json = JsonWrapper.Serialize(new { handle = Raw });
                        break;
                    case ContactType.Email:
                        _json = JsonWrapper.Serialize(new {email = Cleaned});
                        break;
                    case ContactType.USPhone:
                        _json = JsonWrapper.Serialize(new {phone = Cleaned});
                        break;
                    default:
                        _json = JsonWrapper.Empty;
                        break;
                }
            }

            return _json;
        }

        public ContactType Type { get; } = ContactType.Unknown;

        public string Cleaned { get; }

        public string Raw { get; }

    }
}
