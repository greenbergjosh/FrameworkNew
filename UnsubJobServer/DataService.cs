using System;
using System.Diagnostics;
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
            _fw = fw;
        }

        public void OnStart()
        {
            _fw.Log(nameof(OnStart), "Service started").Wait();
        }

        public async Task Run(HttpContext context) => await HandleHttpRequest(context);

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
#if DEBUG
                        if (Debugger.IsAttached)
                        {
                            await nw.LoadUnsubFiles(dtv);
                        }
#else
                        Task.Run(() => nw.LoadUnsubFiles(dtv));
#endif

                        result = JsonWrapper.Json(new { Result = "Success" });
                        break;
                    case "alive":
                        await _fw.Log(nameof(HandleHttpRequest), "Someone asked if I was alive, I was");
                        result = JsonWrapper.Json(new { Result = "yes" });
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
