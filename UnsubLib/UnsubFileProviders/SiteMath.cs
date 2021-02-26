using System;
using System.Threading.Tasks;
using Utility.GenericEntity;

namespace UnsubLib.UnsubFileProviders
{
    public class SiteMath : IUnsubLocationProvider
    {
        public bool CanHandle(IGenericEntity network, string unsubRelationshipId, Uri uri) => uri.AbsolutePath.EndsWith("suppressionListDownload.php");
        public Task<string> GetFileUrl(IGenericEntity network, string unsubRelationshipId, Uri uri) => Task.FromResult(uri.ToString());
    }
}
