using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using HtmlAgilityPack;
using MimeKit;
using Newtonsoft.Json;
using Utility;
using Utility.DataLayer;

namespace QuickTester
{
    internal class Ccpa
    {
        public static async Task CcpaBackfill(string[] _args)
        {
            var fw = new FrameworkWrapper(_args);

            var reader = new ImapReader("imap.gmail.com", "ccpa@onpointglobal.com", "Compliance@305", 993, true);

            var messages = reader.GetAllMailsSince(DateTime.UtcNow.AddDays(-7));

            var wordpressFroms = new string[]
            {
                "info@",
                "wordpress"
            };

            var skips = new string[]
            {
                "no-reply",
                "noreply",
                "mail-noreply",
                "npeshev"
            };

            var emailRegexes = new Regex[]
            {
                new Regex("Email\\: ([A-Za-z][^ <]+)", RegexOptions.IgnoreCase),
                new Regex("Email\\:</b> ([A-Za-z][^ <]+)", RegexOptions.IgnoreCase),
                new Regex("lt;([A-Za-z][^&]+)")
            };

            var i = 0;
            foreach (var message in messages)
            {
                string email = null;
                string requestType;

                var from = message.From.Cast<MailboxAddress>().First().Address;
                if (skips.Any(skip => from.StartsWith(skip)))
                {
                    continue;
                }
                else if (wordpressFroms.Any(wp => from.StartsWith(wp)))
                {
                    var doc = new HtmlDocument();
                    doc.LoadHtml(message.HtmlBody);

                    var emailLink = doc.DocumentNode.SelectSingleNode("//a[starts-with(@href, 'mailto')]");
                    if (emailLink is null)
                    {
                        foreach (var regex in emailRegexes)
                        {
                            var match = regex.Match(message.HtmlBody);
                            if (!match.Success)
                            {
                                continue;
                            }

                            email = match.Groups[1].Value;
                        }

                        if (string.IsNullOrWhiteSpace(email))
                        {
                            Console.WriteLine($"Couldn't find email for message: {message.MessageId} - {message.Subject} - {message.From}");
                            continue;
                        }
                    }
                    else
                    {
                        email = emailLink.InnerText;
                    }

                    requestType = message.Subject.StartsWith("CCPA Opt-Out") ? "CCPA_OptOut" : "CCPA_PrivacyRightsRequest";
                }
                else
                {
                    email = from;
                    requestType = "CCPA_OptOut";
                }

                if (string.IsNullOrWhiteSpace(email))
                {
                    Console.WriteLine($"Couldn't find email for message: {message.MessageId} - {message.Subject} - {message.From}");
                    continue;
                }

                await Data.CallFn("signal", "saveSignal", JsonConvert.SerializeObject(new { table = "ccpa_signal" }), JsonConvert.SerializeObject(new { email, requestType, date_acquired = message.Date }));
                //Console.WriteLine($"{i + 1}: {email} - {requestType}");
                i++;
                //if (i == 10) break;
            }
            //Console.WriteLine(message.HtmlBody);

            //Console.WriteLine(reader.Count());
            Console.WriteLine($"Complete {i}");
            //Console.ReadLine();
        }

    }
}
