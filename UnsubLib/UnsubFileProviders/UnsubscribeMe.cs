using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utility.Entity;

namespace UnsubLib.UnsubFileProviders
{
    internal class UnsubscribeMe : IUnsubLocationProvider
    {
        public Task<bool> CanHandle(Entity network, string unsubRelationshipId, Uri uri) => Task.FromResult(uri.ToString().Contains("unsubscribeme.email"));

        public Task<(string url, IDictionary<string, string> postData)> GetFileUrl(Entity network, string unsubRelationshipId, Uri uri) => Task.FromResult((new Uri(uri, "download/file").ToString(), (IDictionary<string, string>)null));
    }
}
