using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;

namespace UnsubJobServer
{
    public class DataService
    {
        private FrameworkWrapper _fw;

        public void Config(FrameworkWrapper fw)
        {
            _fw = new FrameworkWrapper();
        }

        public async Task HandleHttpRequest(HttpContext context)
        {
            var requestFromPost = "";
            var result = JsonWrapper.Json(new { Error = "SeeLogs" });

            try
            {
                requestFromPost = await context.GetRawBodyStringAsync();

                var dtv = JsonWrapper.JsonToGenericEntity(requestFromPost);

                var nw = new UnsubLib.UnsubLib(_fw);

                switch (dtv.GetS("m"))
                {
                    case "LoadUnsubFiles":
                        Task.Run(() => nw.LoadUnsubFiles(dtv));
                        result = JsonWrapper.Json(new { Result = "Success" });
                        break;
                    default:
                        File.AppendAllText("UnsubJobServer.log", $"{DateTime.Now}::{requestFromPost}::Unknown method{Environment.NewLine}");
                        break;
                }
            }
            catch (Exception ex)
            {
                File.AppendAllText("UnsubJobServer.log", $"{DateTime.Now}::{requestFromPost}::{ex}{Environment.NewLine}");
            }

            await context.WriteSuccessRespAsync(result);
        }

    }
}
