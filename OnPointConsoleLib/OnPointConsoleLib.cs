using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Utility;
using Jw = Utility.JsonWrapper;

namespace OnPointConsoleLib
{
    public class OnPointConsoleLib
    {
        public FrameworkWrapper Fw;

        public void Config(FrameworkWrapper fw)
        {
            Fw = fw;
        }

        public async Task Run(HttpContext context)
        {
            var requestFromPost = "";
            var result = Jw.Json(new { Error = "SeeLogs" });

            try
            {
                var reader = new StreamReader(context.Request.Body);

                requestFromPost = await reader.ReadToEndAsync();

                if (!String.IsNullOrEmpty(context.Request.Query["m"]))
                {
                    string m = context.Request.Query["m"];

                    switch (m)
                    {
                        case "OnPointConsoleLiveFeed":
                            result = await SaveLiveFeed(requestFromPost);
                            break;
                        case "OnPointConsoleLiveEmailEvent":
                            result = await SaveEmailEvent(requestFromPost);
                            break;
                        default:
                            await Fw.Err(ErrorSeverity.Error, "Start", "Error", "Unknown request: " + requestFromPost);
                            break;
                    }
                }
                else
                {
                    await Fw.Err(ErrorSeverity.Error, "Start", "Tracking", "Unknown request: " + requestFromPost);
                }
            }
            catch (Exception ex)
            {
                await Fw.Err(ErrorSeverity.Error, "Start", "Exception", $@"{requestFromPost}::{ex}");
            }

            await WriteResponse(context, result);
        }

        public async Task WriteResponse(HttpContext context, string resp)
        {
            context.Response.StatusCode = (int) HttpStatusCode.OK;
            context.Response.ContentType = "application/json";
            context.Response.ContentLength = resp.Length;
            await context.Response.WriteAsync(resp);
        }

        public async Task<string> SaveLiveFeed(string request)
        {
            var result = Jw.Json(new { Result = "Failure" });

            try
            {
                return await SqlWrapper.SqlServerProviderEntry("OnPointConsole", "SaveLiveFeed", "", request);
            }
            catch (Exception ex)
            {
                await Fw.Err(ErrorSeverity.Error, nameof(SaveLiveFeed), "Exception", $@"{ex}::{request}");
            }
            return result;
        }

        public async Task<string> SaveEmailEvent(string request)
        {
            var result = Jw.Json(new { Result = "Failure" });

            try
            {
                return await SqlWrapper.SqlServerProviderEntry("OnPointConsole", "SaveEmailEvent", "", request);
            }
            catch (Exception ex)
            {
                await Fw.Err(ErrorSeverity.Error, nameof(SaveEmailEvent), "Exception", $@"{ex}::{request}");
            }
            return result;
        }


    }
}
