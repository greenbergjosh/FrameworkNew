using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;


namespace ClickagyDataLib
{
    public class Dataservice
    {
        private FrameworkWrapper _fw;

        public void Config(FrameworkWrapper fw)
        {
            _fw = fw;
            // Any other bootstrapping
        }

        public void OnStart()
        {

        }

        public void OnStop()
        {

        }

        public async Task<string> HandleHttpRequest(HttpContext ctx)
        {

        }

    }
}
