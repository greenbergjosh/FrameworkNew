using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;
using Utility.Http;

namespace UnsubClientWeb
{
    public class DataService : IGenericDataService
    {
        private FrameworkWrapper _fw;
        private UnsubLib.UnsubLib _unsub;

        public async Task Config(FrameworkWrapper fw)
        {
            _fw = fw;
            _unsub = await UnsubLib.UnsubLib.Create(_fw);
        }

        public async Task ProcessRequest(HttpContext context)
        {
            if (await HealthCheckHandler.Handle(context, _fw))
            {
                return;
            }

            if (context.IsLocal() && context.Request.Query["m"] == "config")
            {
                await context.WriteSuccessRespAsync(JsonSerializer.Serialize(_fw.StartupConfiguration));
                return;
            }

            var requestFromPost = "";
            var result = JsonSerializer.Serialize(new { Error = "SeeLogs" });
            var requestId = Guid.NewGuid();
            var method = string.Empty;

            try
            {
                var reader = new StreamReader(context.Request.Body);
                requestFromPost = await reader.ReadToEndAsync();

                var dtv = await _fw.Entity.Parse("application/json", requestFromPost);

                method = await dtv.EvalS("m");

                _ = _fw.Trace($"Router:{method} RequestId: {requestId}", dtv.ToString());

                switch (method)
                {
                    case "IsUnsubList":
                        result = await _unsub.IsUnsubList(dtv);
                        break;
                    case "IsUnsubBatch":
                        result = await _unsub.IsUnsubBatch(dtv);
                        break;
                    case "GetCampaigns":
                        result = JsonSerializer.Serialize(await _unsub.GetCampaigns());
                        break;
                    case "ManualDownload":
                        result = await _unsub.ManualDownload(dtv);
                        break;
                    case "RefreshCampaigns":
                        result = await _unsub.RefreshCampaigns(dtv);
                        break;
                    case "RunCampaign":
                        result = await _unsub.RunCampaign(dtv);
                        break;
                    case "ForceUnsub":
                        result = await _unsub.ForceUnsub(dtv);
                        break;
                    default:
                        File.AppendAllText("UnsubClient.log", $"{DateTime.Now}::{requestFromPost}::Unknown method{Environment.NewLine}");
                        break;
                }
            }
            catch (Exception ex)
            {
                FileSystem.WriteLineToFileThreadSafe("UnsubClient.log", $"{DateTime.Now}::{requestFromPost}::{ex.UnwrapForLog()}{Environment.NewLine}");
            }

            _ = _fw.Trace($"Router:{method} RequestId: {requestId} Response", result);

            await context.WriteSuccessRespAsync(result);
        }

        public Task Reinitialize() => Task.CompletedTask;
    }
}
