using System;
using System.Threading.Tasks;
using Utility.GenericEntity;

namespace UnsubLib.UnsubFileProviders
{
    // TODO: Make this use Roslyn instead of OO style
    public interface IUnsubLocationProvider
    {
        bool CanHandle(IGenericEntity network, string unsubRelationshipId, Uri uri);
        Task<string> GetFileUrl(IGenericEntity network, string unsubRelationshipId, Uri uri);
    }

}
