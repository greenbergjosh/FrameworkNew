using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using HPair = System.Collections.Generic.KeyValuePair<string, string>;

namespace Utility.Mta
{
    public abstract class MailService
    {
        protected FrameworkWrapper _fw;
        protected readonly string _configRootPath;
        private static readonly Regex HasTokenRx = new Regex(@"\$\{(?<token>[^}]*?)\}");

        protected MailService(FrameworkWrapper fw, string configRootPath)
        {
            _fw = fw;
            _configRootPath = configRootPath;
        }

        public abstract Task<IEnumerable<MailResult>> Send(MailMessage msg);

        public abstract Task<string> GetStatus(string jobId);

        protected string ReplaceTokens(string str, Dictionary<string, string> tokens) =>
            str.IsNullOrWhitespace() || tokens?.Any() != true ? str : tokens.Aggregate(str, (s, t) => Regex.Replace(s, $@"$\{{\s*?{t.Key}\s*?\}}", t.Value));

        protected IEnumerable<string> HasTokens(string str) => HasTokenRx.Matches(str).Select(m => m.Groups["token"].Value).Distinct();

        protected string GenerateMissingEnvelopeId(MailMessage msg, Recipient recipient)
        {
            return Hashing.CalculateMD5Hash($"{msg.JobId}:{recipient.Address.Address}");
        }

        protected ICollection<RecipientMessage> GetRecipientMessages(MailMessage msg)
        {
            return msg?.To?.Where(r => r.Address != null).Select(r =>
            {
                if (r.SendId.IsNullOrWhitespace()) r.SendId = GenerateMissingEnvelopeId(msg, r);

                var result = new RecipientMessage
                {
                    Recipient = r,
                    Subject = ReplaceTokens(msg.Subject, r.Tokens),
                    Body = ReplaceTokens(msg.Body, r.Tokens),
                    Headers = msg.Headers?.Select(h => new HPair(ReplaceTokens(h.Key, r.Tokens), ReplaceTokens(h.Value, r.Tokens))) ?? Enumerable.Empty<HPair>(),
                    From = new Sender(ReplaceTokens(msg.FriendlyFrom, r.Tokens), ReplaceTokens(msg.FromLocalPart, r.Tokens), ReplaceTokens(msg.FromDomain, r.Tokens))
                };

                var errors = new List<string>();
                var unreplaced = HasTokens(result.Subject).ToArray();

                if (unreplaced.Any()) errors.Add($"Missing tokens for {nameof(result.Subject)}: {unreplaced.Join(", ")}");

                unreplaced = HasTokens(result.Body).ToArray();

                if (unreplaced.Any()) errors.Add($"Missing tokens for {nameof(result.Body)}: {unreplaced.Join(", ")}");

                unreplaced = HasTokens(result.From.Name).ToArray();

                if (unreplaced.Any()) errors.Add($"Missing tokens for {nameof(result.From)}: {unreplaced.Join(", ")}");

                unreplaced = HasTokens(result.From.LocalPart).ToArray();

                if (unreplaced.Any()) errors.Add($"Missing tokens for {nameof(result.From.LocalPart)}: {unreplaced.Join(", ")}");

                unreplaced = HasTokens(result.From.Domain).ToArray();

                if (unreplaced.Any()) errors.Add($"Missing tokens for {nameof(result.From.Domain)}: {unreplaced.Join(", ")}");

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
            public Recipient Recipient { get; set; }
            public string Subject { get; set; }
            public string Body { get; set; }
            public IEnumerable<HPair> Headers { get; set; }
            public Sender From { get; set; }
            public ICollection<string> Errors { get; internal set; }
            public bool Success => Errors?.Any() != true;
        }
    }
}