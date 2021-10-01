using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
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
                try
                {
                    await _fw.Log($"{nameof(XIncludeTester)}.OnStart", "Starting...");



                    await _fw.Log($"{nameof(XIncludeTester)}.OnStart", "Started...");
                }
                catch (Exception ex)
                {
                    throw;
                }
                
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
                await ctx.WriteSuccessRespAsync("<c><d type='BOB'>HELLO</d></c>", contentType: "application/xml");
                Console.WriteLine("Requested 1234");
            }
            else if (path == "/10")
            {
                await ctx.WriteSuccessRespAsync(@"{""a"": { ""b11"":{ ""ref$"": ""http://localhost:8002/11#/c""}, ""b10"": ""@@http://localhost:8002/11#$.c.d3[*]"", ""b0"": ""@@http://localhost:8002/11#/c"", ""b"": ""@@http://localhost:8002/11"", ""b2"": ""bob"", ""b3"": [1,2,3], ""b4"": [""@@http://localhost:8002/11"", ""@@http://localhost:8002/11"", ""@@http://localhost:8002/11""], ""b5"": ""@@http://localhost:8002/16""} }", contentType: "application/json");
                Console.WriteLine("Requested 10");
            }
            else if (path == "/11")
            {
                await ctx.WriteSuccessRespAsync(@"{""c"": {""d"": ""Hello"", ""d2"": [4,5,6], ""d3"": [{ ""ref$"": ""http://localhost:8002/12#/e""}, ""@@http://localhost:8002/12"", ""@@http://localhost:8002/13"", ""@@http://localhost:8002/14""]}}", contentType: "application/json");
                Console.WriteLine("Requested 11");
            }
            else if (path == "/12")
            {
                await ctx.WriteSuccessRespAsync(@"{""e"": {""f"": ""Hello12"", ""d2"": [4,5,6] }}", contentType: "application/json");
                Console.WriteLine("Requested 12");
            }
            else if (path == "/13")
            {
                await ctx.WriteSuccessRespAsync(@"{""e"": {""f"": ""Hello3"", ""d2"": [4,5,6] }}", contentType: "application/json");
                Console.WriteLine("Requested 13");
            }
            else if (path == "/14")
            {
                await ctx.WriteSuccessRespAsync(@"{""e"": {""f"": ""Hello14"", ""d2"": [4,5,6] }}", contentType: "application/json");
                Console.WriteLine("Requested 14");
            }
            else if (path == "/15")
            {
                await ctx.WriteSuccessRespAsync(@"{""a"": { ""b"": {""c"": {""d"": ""Hello"", ""d2"": [4,5,6], ""d3"": [{""e"": {""f"": ""Hello12"", ""d2"": [4,5,6] }}, {""e"": {""f"": ""Hello3"", ""d2"": [4,5,6] }}, {""e"": {""f"": ""Hello14"", ""d2"": [4,5,6] }}]}}, ""b2"": ""bob"", ""b3"": [1,2,3], ""b4"": [{""c"": {""d"": ""Hello"", ""d2"": [4,5,6], ""d3"": [{""e"": {""f"": ""Hello12"", ""d2"": [4,5,6] }}, {""e"": {""f"": ""Hello3"", ""d2"": [4,5,6] }}, {""e"": {""f"": ""Hello14"", ""d2"": [4,5,6] }}]}}, {""c"": {""d"": ""Hello"", ""d2"": [4,5,6], ""d3"": [{""e"": {""f"": ""Hello12"", ""d2"": [4,5,6] }}, {""e"": {""f"": ""Hello3"", ""d2"": [4,5,6] }}, {""e"": {""f"": ""Hello14"", ""d2"": [4,5,6] }}]}}, {""c"": {""d"": ""Hello"", ""d2"": [4,5,6], ""d3"": [{""e"": {""f"": ""Hello12"", ""d2"": [4,5,6] }}, {""e"": {""f"": ""Hello3"", ""d2"": [4,5,6] }}, {""e"": {""f"": ""Hello14"", ""d2"": [4,5,6] }}]}}], ""b5"": [{""aa"": ""Frog""}, {""aa"": ""Toad""}, {""aa"": ""Mole""}]} }", contentType: "application/json");
                Console.WriteLine("Requested 15");
            }
            else if (path == "/16")
            {
                await ctx.WriteSuccessRespAsync(@"[{""aa"": ""Frog""}, {""aa"": ""Toad""}, {""aa"": ""Mole""}]", contentType: "application/json");
                Console.WriteLine("Requested 16");
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
