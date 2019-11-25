using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using Utility;

namespace CachingServiceLib
{
    public class CachingService
    {
        public FrameworkWrapper Fw;

        public void Config(FrameworkWrapper fw)
        {
            Fw = fw;
        }

        public async Task Run(HttpContext context)
        {
            try
            {
                return;
            }
            catch (Exception ex)
            {
                await Fw.Error(nameof(Run), $@"Caught exception processing request: {ex.Message} : {ex.UnwrapForLog()}");
            }
        }

    }
}
