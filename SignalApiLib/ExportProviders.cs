using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.EDW.Queueing;

namespace SignalApiLib.ExportProviders
{
    public interface IPostingQueueProvider
    {
        PostingQueueEntry GetPostingQueueData(string feedSource, SourceData d);
    }

    public class Console : IPostingQueueProvider
    {
        private const string PostingQueueKey = "WebPost";
        private Dictionary<string, string> _sourceMap = new Dictionary<string, string>
        {
            { "fluent", "1d6b7dd9-6d97-44b8-a795-9d0e5e72a01f" }
        };

        public PostingQueueEntry GetPostingQueueData(string feedSource, SourceData d)
        {
            if (feedSource.IsNullOrWhitespace()) return null;

            var domainId = _sourceMap.GetValueOrDefault(feedSource);

            return domainId != null ? new PostingQueueEntry(PostingQueueKey, DateTime.Now, BuildConsolePostBody(d.@ref, new ConsolePostData(domainId, d.fn, d.ln, d.zip, d.em, d.dob, d.su, d.g, d.ip))) : null;
        }

        //public ConsolePostBody(SourceData sd, string domainId)
        //{
        //    first_name = sd.fn;
        //    last_name = sd.ln;
        //    zip_code = sd.zip;
        //    email = sd.em;
        //    dob = sd.dob;
        //    label_domain = sd.su.ParseWebUrl()?.Host;
        //    gender = sd.g;
        //    domain_id = domainId;
        //    user_ip = sd.ip;
        //}

        public string BuildConsolePostBody(string reference, ConsolePostData body, Dictionary<string, object> overrideConsoleHeaders = null, Dictionary<string, string> additionalHttpHeaders = null)
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
