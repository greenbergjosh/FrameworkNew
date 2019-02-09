using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;
using Jw = Utility.JsonWrapper;

namespace UnsubClientWeb
{
    public class DataService
    {
        private FrameworkWrapper _fw;

        public void Config(FrameworkWrapper fw)
        {
            _fw = new FrameworkWrapper();
        }

        public async Task Run(HttpContext context)
        {
            var requestFromPost = "";
            var result = Jw.Json(new { Error = "SeeLogs" });

            try
            {
                var reader = new StreamReader(context.Request.Body);
                requestFromPost = await reader.ReadToEndAsync();

                var dtv = Jw.JsonToGenericEntity(requestFromPost);

                var nw = new UnsubLib.UnsubLib(_fw);

                switch (dtv.GetS("m"))
                {
                    case "IsUnsub":
                        result = await nw.ServerIsUnsub(requestFromPost);
                        break;
                    case "IsUnsubList":
                        result = await nw.ServerIsUnsubList(requestFromPost);
                        break;
                    case "GetCampaigns":
                        result = await nw.GetCampaigns();
                        break;
                    case "ForceUnsub":
                        result = await nw.ServerForceUnsub(requestFromPost);
                        break;
                    default:
                        File.AppendAllText("UnsubClient.log", $"{DateTime.Now}::{requestFromPost}::Unknown method{Environment.NewLine}");
                        break;
                }
            }
            catch (Exception ex)
            {
                File.AppendAllText("UnsubClient.log", $"{DateTime.Now}::{requestFromPost}::{ex.UnwrapForLog()}{Environment.NewLine}");
            }

            await context.WriteSuccessRespAsync(result);
        }

    }
}
