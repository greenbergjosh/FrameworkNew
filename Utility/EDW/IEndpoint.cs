using System.Threading.Tasks;

namespace Utility.EDW
{
    public interface IEndpoint
    {
        Task<LoadBalancedWriter.Result> Write(object w, bool secondaryWrite, int timeoutSeconds);
        Task<bool> Audit();
    }
}
