using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
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

            var requestFromPost = "";
            var result = JsonSerializer.Serialize(new { Error = "SeeLogs" });
            var requestId = Guid.NewGuid();
            var method = string.Empty;

            try
            {
                var reader = new StreamReader(context.Request.Body);
                requestFromPost = await reader.ReadToEndAsync();

                var dtv = await _fw.Entity.Parse("application/json", requestFromPost);

                method = await dtv.GetS("m");

                // Leaving out the await was on purpose, let's not hold up the call for trace logging
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
                        result = (await _unsub.GetCampaigns())?.ToString() ?? result;
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
                    case "alive":
                        await _fw.Log(nameof(ProcessRequest), "Someone asked if I was alive, I was");
                        result = JsonSerializer.Serialize(new { Result = "yes" });
                        break;
                    case "test":
                        const string testMethod = "Monitor tests";

                        await _fw.Log(testMethod, "Starting tests");
                        var errors = new List<string>();
                        var stats = new Dictionary<string, double>();

                        try
                        {
                            var sw = Stopwatch.StartNew();
                            var res = await _unsub.GetCampaigns();

                            _ = sw.Restart(() => stats.Add("GetCampaigns", sw.Elapsed.TotalSeconds));

                            var resArr = await res?.GetL();

                            if (!resArr.Any())
                            {
                                errors.Add($"{nameof(_unsub.GetCampaigns)} returned null or empty array. Result: {res}");
                            }
                            else
                            {
                                var latestCampaign = resArr.OrderByDescending(async c => (await c.GetS("MostRecentUnsubFileDate")).ParseDate()).First();
                                var testEmails = await _fw.StartupConfiguration.GetL<string>("Config.TestEmails");
                                var isUnsubArgs = _fw.Entity.Create(new { m = "IsUnsubList", CampaignId = await latestCampaign.GetS("Id"), GlobalSuppression = true, EmailMd5 = testEmails });

                                res = await _fw.Entity.Parse("application/json", await _unsub.IsUnsubList(isUnsubArgs));
                                _ = sw.Restart(() => stats.Add("IsUnsub", sw.Elapsed.TotalSeconds));
                                resArr = await res.GetL("NotUnsub");
                                if (!resArr.Any())
                                {
                                    errors.Add($"{nameof(_unsub.IsUnsubList)} returned null or empty array. Result: {res}");
                                }
                            }
                        }
                        catch (Exception e)
                        {
                            errors.Add($"Tests failed. {e.UnwrapForLog()}");
                        }

                        if (errors.Any())
                        {
                            await _fw.Error(testMethod, JsonSerializer.Serialize(new { stats, errors }));
                            await context.WriteFailureRespAsync("Tests failed, see logs");
                            return;
                        }
                        else
                        {
                            result = "All Ok";
                            await _fw.Log(testMethod, JsonSerializer.Serialize(new { stats }));
                        }

                        await _fw.Log(testMethod, "Tests complete");
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
