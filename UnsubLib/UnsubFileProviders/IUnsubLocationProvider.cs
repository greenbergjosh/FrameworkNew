using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utility.Entity;

namespace UnsubLib.UnsubFileProviders
{
    // TODO: Make this use Roslyn instead of OO style
    public interface IUnsubLocationProvider
    {
        Task<bool> CanHandle(Entity network, string unsubRelationshipId, Uri uri);
        Task<(string url, IDictionary<string, string> postData)> GetFileUrl(Entity network, string unsubRelationshipId, Uri uri);
    }

}
