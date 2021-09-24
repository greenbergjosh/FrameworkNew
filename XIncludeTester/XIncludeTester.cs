using System;
using System.Threading.Tasks;
using System.Xml;
using Microsoft.AspNetCore.Http;
using Mvp.Xml.XInclude;
using Utility;

namespace XIncludeTester
{
    public class XIncludeTester
    {
        private FrameworkWrapper _fw;

        public void Config(FrameworkWrapper fw)
        {
            try
            {
                _fw = fw;
                _fw.TraceLogging = fw.StartupConfiguration.GetS("Config/Trace").ParseBool() ?? false;
            }
            catch (Exception ex)
            {
                _fw?.Error(nameof(Config), ex.UnwrapForLog());
                throw;
            }
        }

        public void OnStart()
        {
            _ = Task.Run(async () =>
            {
                await _fw.Log($"{nameof(XIncludeTester)}.OnStart", "Starting...");

                var response1111 = await ProtocolClient.HttpGetAsync("http://localhost:8002/1111");

                var xmlReader = XmlReader.Create(response1111.body);
                var includingReader = new XIncludingReader(xmlReader);
                var xmlDocument = new XmlDocument();
                xmlDocument.Load(includingReader);

                await _fw.Log($"{nameof(XIncludeTester)}.OnStart", "Started...");
            });
        }

        public void OnStop()
        {
            _ = _fw.Log($"{nameof(XIncludeTester)}.OnStop", "Stopping...");

            _ = _fw.Log($"{ nameof(XIncludeTester)}.OnStop", "Stopped");
        }

        public async Task<string> HandleHttpRequest(HttpContext ctx)
        {
            var path = ctx.Request.Path;

            if (path == "/1111")
            {
                await ctx.WriteSuccessRespAsync(@"<a><b><xi:include href=""http://localhost:8002/1234""  xmlns:xi=""http://www.w3.org/2003/XInclude""/></b></a>", contentType: "application/xml");
            }
            else if (path == "/1234")
            {
                await ctx.WriteSuccessRespAsync("<c><d>HELLO</d></c>", contentType: "application/xml");
            }
            else
            {
                ctx.Response.StatusCode = 404;
                await ctx.WriteFailureRespAsync("Unknown");
            }

            return null;
        }
    }
}
