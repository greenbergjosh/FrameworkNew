using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;

namespace UnsubServerWeb
{
    public class DataService
    {
        private FrameworkWrapper _fw;

        public void Config(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public async Task Run(HttpContext context)
        {
            string requestFromPost = "";
            string result = JsonWrapper.Json(new { Error = "SeeLogs" });

            try
            {
                requestFromPost = WebUtility.UrlDecode(await context.GetRawBodyStringAsync());

                var dtve = JsonWrapper.JsonToGenericEntity(requestFromPost);
                var nw = new UnsubLib.UnsubLib(_fw);
                var method = dtve.GetS("m");

                // Leaving out the await was on purpose, let's not hold up the call for trace logging
                _ = _fw.Trace($"Router:{method}", dtve.GetS(""));

                switch (method)
                {
                    case "IsUnsub":
                        result = await nw.IsUnsub(dtve);
                        break;
                    case "IsUnsubList":
                        result = await nw.IsUnsubList(dtve);
                        break;
                    case "ForceUnsub":
                        result = await nw.ForceUnsub(dtve);
                        break;

                    case "CleanUnusedFilesServer":
                        result = await nw.CleanUnusedFilesServer();
                        break;
                    case "setTrace":
                        _fw.TraceLogging = dtve.GetS("trace").ParseBool() == true;
                        result = JsonWrapper.Serialize(new { trace = _fw.TraceLogging });
                        break;
                    default:
                        File.AppendAllText("UnsubServer.log", $@"{DateTime.Now}::{requestFromPost}::Unknown method" +
                            Environment.NewLine);
                        break;
                }

            }
            catch (Exception ex)
            {
                File.AppendAllText("UnsubServer.log", $@"{DateTime.Now}::{requestFromPost}::{ex.ToString()}" +
                            Environment.NewLine);
            }

            await context.WriteSuccessRespAsync(result);
        }
    }
}
