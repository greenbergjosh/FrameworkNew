using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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

                switch (dtve.GetS("m"))
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
