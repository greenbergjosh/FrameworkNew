using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json.Linq;
using Utility;

namespace SignalApiLib.ExportProviders
{
    public interface IPostingQueueProvider
    {
        PostingQueueData GetPostingQueueData(string feedSource, SourceData d);
    }

    public class Console : IPostingQueueProvider
    {
        private const string PostingQueueKey = "SignalApi-Console";
        private Dictionary<string, string> _sourceMap = new Dictionary<string, string>
        {
            { "fluent", "1d6b7dd9-6d97-44b8-a795-9d0e5e72a01f" }
        };

        public PostingQueueData GetPostingQueueData(string feedSource, SourceData d)
        {
            if (feedSource.IsNullOrWhitespace()) return null;

            var domainId = _sourceMap.GetValueOrDefault(feedSource);

            return domainId != null ? new PostingQueueData(PostingQueueKey, BuildConsolePostBody(d.@ref, new ConsolePostBody(d, domainId))) : null;
        }

        public class ConsolePostBody
        {
            public ConsolePostBody(SourceData sd, string domainId)
            {
                first_name = sd.fn;
                last_name = sd.ln;
                zip_code = sd.zip;
                email = sd.em;
                dob = sd.dob;
                label_domain = sd.su.ParseWebUrl()?.Host;
                gender = sd.g;
                domain_id = domainId;
                user_ip = sd.ip;
            }

            public ConsolePostBody(string domainId,string firstName, string lastName, string zipCode, string email, string dob, string labelDomain, string gender,string ip)
            {
                first_name = firstName;
                last_name = lastName;
                zip_code = zipCode;
                this.email = email;
                this.dob = dob;
                label_domain = labelDomain;
                this.gender = gender;
                domain_id = domainId;
                user_ip = ip;
            }

            // ReSharper disable InconsistentNaming
            public string first_name { get; }
            public string last_name { get; }
            public string zip_code { get; }
            public string email { get; }
            public string dob { get; }
            public string label_domain { get; }
            public string gender { get; }
            public string domain_id { get; }
            public bool isFinal { get; } = true;
            public string user_ip { get; }
            // ReSharper restore InconsistentNaming

        }

        public string BuildConsolePostBody(string reference, ConsolePostBody body, Dictionary<string, object> overrideConsoleHeaders = null, Dictionary<string, string> additionalHttpHeaders = null)
        {
            if (body.domain_id.IsNullOrWhitespace()) throw new Exception("ConsolePostBody has empty domain_id");

            var httpHeaders = new Dictionary<string, string>
            {
                { "Accept", "application/json"},
                { "Content-Type", "application/json" }
            };

            if (additionalHttpHeaders != null)
            {
                foreach (var h in additionalHttpHeaders)
                {
                    if (!httpHeaders.ContainsKey(h.Key)) httpHeaders.Add(h.Key, h.Value);
                }
            }

            var consoleHeaders = new Dictionary<string, object>
            {
                { "svc", 1 },
                { "p", -1 }
            };

            if (overrideConsoleHeaders != null)
            {
                foreach (var h in overrideConsoleHeaders)
                {
                    if (consoleHeaders.ContainsKey(h.Key)) consoleHeaders[h.Key] = h.Value;
                    else consoleHeaders.Add(h.Key, h.Value);
                }
            }

            return JsonWrapper.Serialize(new
            {
                @ref = reference,
                u = "dpost.direct-market.com/api?pe=VisitorId",
                p = "http",
                v = "POST",
                h = httpHeaders,
                b = new
                {
                    header = consoleHeaders,
                    body
                }
            });
        }

    }
}
