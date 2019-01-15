using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Runtime.InteropServices;
using System.Security;
using Microsoft.Management.Infrastructure;
using Microsoft.Management.Infrastructure.Options;
using Utility;

namespace SystemHealthChecks
{
    class Program
    {
        private static FrameworkWrapper fw = null;

        static void Main(string[] args)
        {
            try
            {
                fw = new FrameworkWrapper();

                var relay = fw.StartupConfiguration.GetS("Config/SmtpRelay");
                var port = fw.StartupConfiguration.GetS("Config/SmtpPort").ParseInt();
                var to = fw.StartupConfiguration.GetS("Config/AlertEmailTo");
                var from = fw.StartupConfiguration.GetS("Config/AlertEmailFrom");

                if (!port.HasValue || new[] { relay, to, from }.Any(s => s.IsNullOrWhitespace()))
                {
                    fw.Err(ErrorSeverity.Error, nameof(Main), ErrorDescriptor.Exception, $"Invalid config: {fw.StartupConfiguration.GetS("")}");
                    return;
                }

                var sslEnabled = fw.StartupConfiguration.GetS("Config/DisableSSL").ParseBool() != true;
                var smtpCredsUser = fw.StartupConfiguration.GetS("Config/SmtpCredentials/User");
                var smtpCredsPassword = fw.StartupConfiguration.GetS("Config/SmtpCredentials/Password");
                var alert = args.FirstOrDefault()?.ToLower() == "test" ? (subject: "Email alert test", body: "Email alert test") : LowDiskSpaceChecks();

                if (!alert.subject.IsNullOrWhitespace())
                {
                    using (var smtp = new SmtpClient(relay, port.Value))
                    {
                        if (sslEnabled) smtp.EnableSsl = true;

                        if (smtpCredsUser != null)
                        {
                            smtp.Credentials = new NetworkCredential(smtpCredsUser, smtpCredsPassword);
                        }

                        smtp.Send(new MailMessage(from, to)
                        {
                            IsBodyHtml = true,
                            Subject = alert.subject,
                            Body = $"<html>{alert.body}</html>"
                        });
                    }
                }
            }
            catch (Exception e)
            {
                if (fw == null) Console.WriteLine($"Failed to load {nameof(FrameworkWrapper)}: {e}");
                else fw.Err(ErrorSeverity.Error, nameof(Main), ErrorDescriptor.Exception, e.ToString());
            }
        }

        private static (string subject, string body) LowDiskSpaceChecks()
        {
            var alerts = new List<string>();
            var config = fw.StartupConfiguration.GetE("Config/LowDiskSpace");
            var threshold = config.GetS("PercentThreshold").ParseUInt();
            var drives = config.GetD("Drives");
            var itemTemplate = config.GetS("EmailBodyItemTemplate");
            var failedItemTemplate = config.GetS("EmailBodyFailedItemTemplate");
            var subject = config.GetS("EmailSubject");
            var body = config.GetS("EmailBody");

            if (threshold.HasValue &&
                new[] { itemTemplate, failedItemTemplate, subject, body }.All(s => !s.IsNullOrWhitespace()))
            {
                foreach (var drive in drives)
                {
                    var stats = GetDriveUsageDetails(drive.Item2);

                    if (stats.capacity == 0)
                    {
                        alerts.Add(
                            failedItemTemplate.Replace("[label]", drive.Item1)
                                .Replace("[error]", "Drive unreachable"));
                    }
                    else
                    {
                        var percFree = stats.free * 100 / stats.capacity;

                        if (percFree < threshold)
                        {
                            alerts.Add(
                                itemTemplate.Replace("[label]", drive.Item1)
                                    .Replace("[free]", stats.free.ToString())
                                    .Replace("[used]", stats.used.ToString())
                                    .Replace("[capacity]", stats.capacity.ToString())
                                    .Replace("[percentFree]", percFree.ToString()));
                        }
                    }
                }
            }
            else
            {
                subject = "Invalid LowDiskSpace config";
                alerts.Add(config.GetS(""));
                fw.Err(ErrorSeverity.Error, nameof(LowDiskSpaceChecks), ErrorDescriptor.Exception, $"Invalid LowDiskSpace config: {config.GetS("")}");
            }

            if (alerts.Any())
            {
                return (subject: subject, body: body.Replace("[items]", alerts.Join("")).Replace("[percentThreshold]", threshold.ToString()));
            }

            return (null, null);
        }

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool GetDiskFreeSpaceEx(string lpDirectoryName,
            out ulong lpFreeBytesAvailable,
            out ulong lpTotalNumberOfBytes,
            out ulong lpTotalNumberOfFreeBytes);

        private static (ulong free, ulong used, ulong capacity) GetDriveUsageDetails1(string path)
        {
            const ulong div = 1048576L; // Math.Pow(1024,2)
            var d = GetDiskFreeSpaceEx(path, out var freeBytes, out var totalBytes, out var totalFreeBytes);

            if (totalBytes == 0) return (0, 0, 0);
            var dd = (totalBytes - freeBytes) / div;

            ulong bytesToMegs(ulong byteSize)
            {
                return (byteSize / div);
            }

            return (free: freeBytes / div, used: (totalBytes - freeBytes) / div, capacity: totalBytes / div);
        }

        private static (ulong free, ulong used, ulong capacity) GetDriveUsageDetails(string path)
        {
            return (0, 0, 0);
            string computer = "Computer_B";
            string domain = "Domain1";
            string username = "User1";

            var plaintextpassword = "";
            var securepassword = new SecureString();

            foreach (var c in plaintextpassword)
            {
                securepassword.AppendChar(c);
            }

            CimCredential Credentials = new CimCredential(PasswordAuthenticationMechanism.Default, domain, username, securepassword);

            WSManSessionOptions SessionOptions = new WSManSessionOptions();
            SessionOptions.AddDestinationCredentials(Credentials);

            CimSession Session = CimSession.Create(computer, SessionOptions);
        }

    }
}
