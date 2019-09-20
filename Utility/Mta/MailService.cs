using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using HPair = System.Collections.Generic.KeyValuePair<string, string>;

namespace Utility.Mta
{
    public abstract class MailService
    {
        protected FrameworkWrapper Fw;
        protected readonly string ConfigRootPath;
        private static readonly Regex HasTokenRx = new Regex(@"\$\{(?<token>[^}]*?)\}");

        protected MailService(FrameworkWrapper fw, string configRootPath)
        {
            Fw = fw;
            ConfigRootPath = configRootPath;
        }

        public abstract Task<IEnumerable<MailResult>> Send(MailPackage pkg, string vmta = null);

        public abstract Task<string> GetStatus(string jobId);

        protected string ReplaceTokens(string str, Dictionary<string, string> tokens) =>
            str.IsNullOrWhitespace() || tokens?.Any() != true ? str : tokens.Aggregate(str, (s, t) => Regex.Replace(s, $@"$\{{\s*?{t.Key}\s*?\}}", t.Value));

        public static IEnumerable<string> HasTokens(string str) => HasTokenRx.Matches(str).Select(m => m.Groups["token"].Value).Distinct();

        protected string GetVmtaIp(MailPackage pkg, string vmta)
        {
            var conf = Fw.StartupConfiguration.GetE(ConfigRootPath);

            if (conf == null) throw new Exception($"MTA configuration not found. ConfigRootPath: {ConfigRootPath}");

            if (vmta.IsNullOrWhitespace()) vmta = conf.GetS($"DomainIps/{pkg.From.Domain.ToLower()}") ?? conf.GetS("DefaultIp");

            vmta = vmta.Trim();

            if (vmta == "." && conf.GetB("AllowRootVmta")) return null;

            if (vmta.IsNullOrWhitespace()) throw new Exception($"Failed to retrieve VMTA IP. FromDomain: {pkg.From.Domain} Config: {conf.GetS("")}");

            return vmta.Trim();
        }

        protected string GenerateMissingEnvelopeId(MailPackage msg, Recipient recipient)
        {
            return Hashing.CalculateMD5Hash($"{msg.JobId}:{recipient.Address.Address}");
        }

        protected void CleanAndValidatePackage(MailPackage pkg)
        {
            if (pkg == null) throw new ArgumentException($"{nameof(MailPackage)} is invalid: [null]");

            var msgErrors = new List<string>();

            if (pkg.Subject.IsNullOrWhitespace()) msgErrors.Add($"{nameof(pkg.Subject)}: {pkg.Subject}");
            if (pkg.Body.IsNullOrWhitespace()) msgErrors.Add($"{nameof(pkg.Body)}: {pkg.Body}");
            if (pkg.From == null) msgErrors.Add($"{nameof(pkg.From)}: {pkg.From}");

            if (msgErrors.Any()) throw new ArgumentException($"{nameof(MailPackage)} is invalid:\n\t{msgErrors.Join("\n\t")}");

            if (pkg.JobId.IsNullOrWhitespace()) pkg.JobId = Guid.NewGuid().ToString();
        }

        protected ICollection<RecipientMessage> GetRecipientMessages(MailPackage pkg)
        {
            return pkg?.To?.Where(r => r?.Address != null).Select(r =>
            {
                var result = new RecipientMessage();
                var errors = new List<string>();

                if (r.SendId.IsNullOrWhitespace()) r.SendId = GenerateMissingEnvelopeId(pkg, r);

                result.To = r;
                result.Subject = ReplaceTokens(pkg.Subject, r.Tokens);
                result.Body = ReplaceTokens(pkg.Body, r.Tokens);
                result.Headers = pkg.Headers?.Select(h => new HPair(ReplaceTokens(h.Key, r.Tokens), ReplaceTokens(h.Value, r.Tokens))) ?? Enumerable.Empty<HPair>();
                result.From = pkg.FromHasTokens
                    ? new Sender(ReplaceTokens(pkg.From.Name, r.Tokens), ReplaceTokens(pkg.From.LocalPart, r.Tokens), ReplaceTokens(pkg.From.Domain, r.Tokens))
                    : pkg.From;

                var unreplaced = HasTokens(result.Subject).ToArray();

                if (unreplaced.Any()) errors.Add($"Missing tokens for {nameof(result.Subject)}: {unreplaced.Join(", ")}");

                unreplaced = HasTokens(result.Body).ToArray();

                if (unreplaced.Any()) errors.Add($"Missing tokens for {nameof(result.Body)}: {unreplaced.Join(", ")}");

                unreplaced = HasTokens(result.From.Name).ToArray();

                if (unreplaced.Any()) errors.Add($"Missing tokens for {nameof(result.From)}: {unreplaced.Join(", ")}");

                var badFrom = false;

                unreplaced = HasTokens(result.From.LocalPart).ToArray();

                if (unreplaced.Any())
                {
                    badFrom = true;
                    errors.Add($"Missing tokens for {nameof(result.From.LocalPart)}: {unreplaced.Join(", ")}");
                }

                unreplaced = HasTokens(result.From.Domain).ToArray();

                if (unreplaced.Any())
                {
                    badFrom = true;
                    errors.Add($"Missing tokens for {nameof(result.From.Domain)}: {unreplaced.Join(", ")}");
                }

                if (!badFrom)
                {
                    try
                    {
                        new MailAddress(result.From.Address);
                    }
                    catch (Exception)
                    {
                        errors.Add($"Invalid from address {result.From.Address}");
                    }
                }

                unreplaced = result.Headers.Select(h =>
                {
                    var keyTokens = HasTokens(h.Key).ToArray();
                    var valTokens = HasTokens(h.Value).ToArray();


                    if (!keyTokens.Any() && !valTokens.Any()) return null;

                    if (valTokens.Any()) return $"Key: \"{h.Key}\" Value: \"{h.Value}\"";

                    return $"Key: \"{h.Key}\"";
                }).Where(e => e != null).ToArray();

                if (unreplaced.Any()) errors.Add($"Missing tokens for {nameof(result.Headers)}:\n{unreplaced.Join("\n")}");

                result.Errors = errors;

                return result;
            }).ToArray();
        }

        protected class RecipientMessage
        {
            public Recipient To { get; set; }
            public string Subject { get; set; }
            public string Body { get; set; }
            public IEnumerable<HPair> Headers { get; set; }
            public Sender From { get; set; }
            public ICollection<string> Errors { get; internal set; }
            public bool Success => Errors?.Any() != true;
        }
    }
}