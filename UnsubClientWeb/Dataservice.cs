using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;
using Utility.Http;
using Jw = Utility.JsonWrapper;

namespace UnsubClientWeb
{
    public class DataService
    {
        private FrameworkWrapper _fw;
        private UnsubLib.UnsubLib _unsub;

        public void Config(FrameworkWrapper fw)
        {
            _fw = fw;
            _unsub = new UnsubLib.UnsubLib(_fw);
        }

        public async Task Run(HttpContext context)
        {
            if (await HealthCheckHandler.Handle(context, _fw))
            {
                return;
            }

            var requestFromPost = "";
            var result = Jw.Json(new { Error = "SeeLogs" });
            var requestId = Guid.NewGuid();
            var method = string.Empty;

            try
            {
                var reader = new StreamReader(context.Request.Body);
                requestFromPost = await reader.ReadToEndAsync();

                var dtv = Jw.JsonToGenericEntity(requestFromPost);

                method = dtv.GetS("m");

                // Leaving out the await was on purpose, let's not hold up the call for trace logging
                _ = _fw.Trace($"Router:{method} RequestId: {requestId}", dtv.GetS(""));

                switch (method)
                {
                    case "IsUnsubList":
                        result = await _unsub.IsUnsubList(dtv);
                        break;
                    case "IsUnsubBatch":
                        result = await _unsub.IsUnsubBatch(dtv);
                        break;
                    case "GetCampaigns":
                        result = (await _unsub.GetCampaigns())?.GetS("") ?? result;
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
                        await _fw.Log(nameof(Run), "Someone asked if I was alive, I was");
                        result = JsonWrapper.Json(new { Result = "yes" });
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

                            sw.Restart(() => stats.Add("GetCampaigns", sw.Elapsed.TotalSeconds));

                            var resArr = res?.GetL("")?.ToArray();

                            if (resArr?.Any() != true) errors.Add($"{nameof(_unsub.GetCampaigns)} returned null or empty array. Result: {res?.GetS("")}");
                            else
                            {
                                var latestCampaign = resArr.OrderByDescending(c => c.GetS("MostRecentUnsubFileDate").ParseDate()).First();
                                var testEmails = Jw.TryParseArray(_fw.StartupConfiguration.GetS("Config/TestEmails"));
                                var isUnsubArgs = Jw.JsonToGenericEntity(Jw.Serialize(new { m = "IsUnsubList", CampaignId = latestCampaign.GetS("Id"), GlobalSuppression = true, EmailMd5 = testEmails }));

                                res = Jw.JsonToGenericEntity(await _unsub.IsUnsubList(isUnsubArgs));
                                sw.Restart(() => stats.Add("IsUnsub", sw.Elapsed.TotalSeconds));
                                resArr = res?.GetL("NotUnsub")?.ToArray();
                                if (resArr?.Any() != true) errors.Add($"{nameof(_unsub.IsUnsubList)} returned null or empty array. Result: {res?.GetS("")}");
                            }
                        }
                        catch (Exception e)
                        {
                            errors.Add($"Tests failed. {e.UnwrapForLog()}");
                        }

                        if (errors.Any())
                        {
                            await _fw.Error(testMethod, Jw.Serialize(new { stats, errors }));
                            await context.WriteFailureRespAsync("Tests failed, see logs");
                            return;
                        }
                        else
                        {
                            result = "All Ok";
                            await _fw.Log(testMethod, Jw.Serialize(new { stats }));
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

    }
}
