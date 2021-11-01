using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utility.Entity;

namespace UnsubLib.UnsubFileProviders
{
    internal class DirectLink : IUnsubLocationProvider
    {
        public Task<bool> CanHandle(Entity network, string unsubRelationshipId, Uri uri) => Task.FromResult(true);

        public Task<(string url, IDictionary<string, string> postData)> GetFileUrl(Entity network, string unsubRelationshipId, Uri uri) => Task.FromResult((uri.ToString(), (IDictionary<string, string>)null));
    }
}
