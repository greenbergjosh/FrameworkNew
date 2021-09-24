using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utility.GenericEntity;

namespace UnsubLib.UnsubFileProviders
{
    internal class UnsubscribeMe : IUnsubLocationProvider
    {
        public bool CanHandle(IGenericEntity network, string unsubRelationshipId, Uri uri) => uri.ToString().Contains("unsubscribeme.email");

        public Task<(string url, IDictionary<string, string> postData)> GetFileUrl(IGenericEntity network, string unsubRelationshipId, Uri uri) => Task.FromResult((new Uri(uri, "download/file").ToString(), (IDictionary<string, string>)null));
    }
}
