using Microsoft.AspNetCore.Http;
using System;
using System.Text;
using System.Threading.Tasks;
using Utility;
using Jw = Utility.JsonWrapper;

namespace AwsCommandGatewayLib

{
    public class AwsDispatchService
    {

        public FrameworkWrapper Fw;

        public void Config(FrameworkWrapper fw)
        {
            Fw = fw;
        }

        public async Task Run (HttpContext context)
        {
            try
            {
                await context.Response.Body.WriteAsync(Encoding.UTF8.GetBytes(PL.O(new { foobar = Fw.StartupConfiguration.GetS("Config/TestValue") }).ToString()));
            }
            catch (Exception ex)
            {
                await Fw.Error(nameof(Run), $@"Caught exception processing request: {ex.Message} : {ex.UnwrapForLog()}");
            }
        }
    }
}
