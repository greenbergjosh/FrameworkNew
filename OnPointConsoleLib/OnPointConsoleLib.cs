using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Utility;
using Jw = Utility.JsonWrapper;

namespace OnPointConsoleLib
{
    public class OnPointConsoleLib
    {
        public FrameworkWrapper Fw;
        public string TowerDataDbConnectionString;

        public void Config(FrameworkWrapper fw)
        {
            this.Fw = fw;            
        }
        
        public async Task Run(HttpContext context)
        {
            string requestFromPost = "";
            var result = Jw.Json(new { Error = "SeeLogs" });
            try
            {
                StreamReader reader = new StreamReader(context.Request.Body);
                requestFromPost = await reader.ReadToEndAsync();

                if (!String.IsNullOrEmpty(context.Request.Query["m"]))
                {
                    string m = context.Request.Query["m"];
                    switch (m)
                    {
                        case "OnPointConsoleLiveFeed":
                            result = await SaveOnPointConsoleLiveFeed(requestFromPost);
                            break;
                        case "OnPointConsoleLiveEmailEvent":
                            result = await SaveOnPointConsoleLiveEmailEvent(requestFromPost);
                            break;
                        default:
                            await this.Fw.Err(1000, "Start", "Error", "Unknown request: " + requestFromPost);
                            break;
                    }
                }
                else
                {
                    await this.Fw.Err(1000, "Start", "Tracking", "Unknown request: " + requestFromPost);
                }
            }
            catch (Exception ex)
            {
                await this.Fw.Err(1000, "Start", "Exception", $@"{requestFromPost}::{ex.ToString()}");
            }
            await WriteResponse(context, result);
        }

        public async Task WriteResponse(HttpContext context, string resp)
        {
            context.Response.StatusCode = 200;
            context.Response.ContentType = "application/json";
            context.Response.ContentLength = resp.Length;
            await context.Response.WriteAsync(resp);
        }

        public async Task<string> SaveOnPointConsoleLiveFeed(string request)
        {
            string result = Jw.Json(new { Result = "Failure" });
            try
            {
                return await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                        "SaveOnPointConsoleLiveFeed",
                        "",
                        request);
            }
            catch (Exception ex)
            {
                await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                                "OnPointConsoleErrorLog",
                                Jw.Json(new
                                {
                                    Sev = 1000,
                                    Proc = "DataService",
                                    Meth = "SaveOnPointConsoleLiveFeed - SaveOnPointConsoleLiveFeed Failed",
                                    Desc = Utility.Hashing.EncodeTo64(request),
                                    Msg = Utility.Hashing.EncodeTo64(ex.ToString())
                                }),
                                "");
            }
            return result;
        }

        public async Task<string> SaveOnPointConsoleLiveEmailEvent(string request)
        {
            string result = Jw.Json(new { Result = "Failure" });
            try
            {
                return await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                        "SaveOnPointConsoleLiveEmailEvent",
                        "",
                        request);
            }
            catch (Exception ex)
            {
                await SqlWrapper.SqlServerProviderEntry(this.TowerDataDbConnectionString,
                                "OnPointConsoleErrorLog",
                                Jw.Json(new
                                {
                                    Sev = 1000,
                                    Proc = "DataService",
                                    Meth = "SaveOnPointConsoleLiveEmailEvent - Insert Failed",
                                    Desc = Utility.Hashing.EncodeTo64(request),
                                    Msg = Utility.Hashing.EncodeTo64(ex.ToString())
                                }),
                                "");
            }
            return result;
        }


    }
}
