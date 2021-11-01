using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Utility
{
    public interface IGenericDataService
    {
        Task Config(FrameworkWrapper frameworkWrapper);
        Task Reinitialize();
        Task ProcessRequest(HttpContext context);
    }
}
