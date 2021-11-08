using System.Threading.Tasks;

namespace Utility.EDW
{
    public interface IEndpoint
    {
        string ConnectionString { get; }
        Task<LoadBalancedWriter.Result> Write(object w, bool secondaryWrite, int timeoutSeconds);
        Task<bool> Audit();
    }
}
