using System;
using System.Collections.Generic;
using System.Text;

namespace SignalApiLib.ExportProviders
{
    public interface IPostingQueueProvider
    {
        PostingQueueData GetPostingQueueData(SourceData d);
    }

    public class Console : IPostingQueueProvider
    {
        private const string PostingQueueKey = "SignalApi-Console";
        //private const string Template = "{\"u\":\"forms.direct-market.com/PostExtra/pe/\",\"p\":\"https\",\"v\":\"POST\",\"h\":{\"Accept\":\"application/json\",\"Content-Type\":\"application/json\"},\"b\":{\"header\":{\"svc\":1,\"p\":-1},\"body\":{\"domain_id\":\"1d6b7dd9-6d97-44b8-a795-9d0e5e72a01f\",\"domain\":\"fluent feed\",\"isFinal\":true,\"email\":\"${email}\"}}}";
        private const string Template = "{\"ref\":\"${ref}\",\"u\":\"forms.direct-market.com/PostExtra/pe/\",\"p\":\"https\",\"v\":\"POST\",\"h\":{\"Accept\":\"application/json\",\"Content-Type\":\"application/json\"},\"b\":{\"header\":{\"svc\":1,\"p\":-1},\"body\":{\"domain_id\":\"${domainId}\",\"domain\":\"${domain}\",\"isFinal\":true,\"email\":\"${email}\"}}}";
        private Dictionary<string, (string domainId, string domain)?> _sourceMap = new Dictionary<string, (string domainId, string domain)?>
        {
            { "fluent", ("1d6b7dd9-6d97-44b8-a795-9d0e5e72a01f", "fluent feed") }
        };

        public PostingQueueData GetPostingQueueData(SourceData d)
        {
            if (d.src == null) return null;

            var src = _sourceMap.GetValueOrDefault(d.src);

            return src != null ? new PostingQueueData(PostingQueueKey, Template.Replace("${ref}", d.@ref).Replace("${email}", d.em).Replace("${domainId}", src.Value.domainId).Replace("${domain}", src.Value.domain)) : null;
        }
    }
}
