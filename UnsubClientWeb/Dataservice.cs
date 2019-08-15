using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
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
            _fw = fw;
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
                        result = (await nw.GetCampaigns())?.GetS("") ?? result;
                        break;
                    case "ForceUnsub":
                        result = await nw.ServerForceUnsub(requestFromPost);
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
                            var res = await nw.GetCampaigns();

                            sw.Restart(() => stats.Add("GetCampaigns", sw.Elapsed.TotalSeconds));

                            var resArr = res?.GetL("")?.ToArray();

                            if (resArr?.Any() != true) errors.Add($"{nameof(nw.GetCampaigns)} returned null or empty array. Result: {res?.GetS("")}");
                            else
                            {
                                var latestCampaign = resArr.OrderByDescending(c => c.GetS("MostRecentUnsubFileDate").ParseDate()).First();
                                var testEmails = Jw.TryParseArray(_fw.StartupConfiguration.GetS("Config/TestEmails"));
                                var isUnsubArgs = Jw.Serialize(new { m = "IsUnsubList", CampaignId = latestCampaign.GetS("Id"), GlobalSuppression = true, EmailMd5 = testEmails });

                                res = Jw.JsonToGenericEntity(await nw.ServerIsUnsubList(isUnsubArgs));
                                sw.Restart(() => stats.Add("IsUnsub", sw.Elapsed.TotalSeconds));
                                resArr = res?.GetL("NotUnsub")?.ToArray();
                                if (resArr?.Any() != true) errors.Add($"{nameof(nw.ServerIsUnsubList)} returned null or empty array. Result: {res?.GetS("")}");
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
                File.AppendAllText("UnsubClient.log", $"{DateTime.Now}::{requestFromPost}::{ex.UnwrapForLog()}{Environment.NewLine}");
            }

            await context.WriteSuccessRespAsync(result);
        }

    }
}
