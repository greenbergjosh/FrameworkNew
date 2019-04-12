using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace SignalApiLib
{
    public interface ISourceHandler
    {
        Task<string> HandleRequest(string requestFromPost, HttpContext ctx);
    }
}