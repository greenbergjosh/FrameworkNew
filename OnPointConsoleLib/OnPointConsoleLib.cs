using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
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
            var a = JsonConvert.DeserializeObject("{}");
        }

        public async Task Run(HttpContext context)
        {
            var requestFromPost = "";
            var result = Jw.Json(new { Error = "SeeLogs" });

            try
            {
                requestFromPost = await context.GetRawBodyStringAsync();

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

            await context.WriteSuccessRespAsync(result);
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
