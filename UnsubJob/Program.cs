using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UnsubLib;
using UnsubLib.NetworkProviders;
using Utility;
using Utility.Entity;

namespace UnsubJob
{
    internal class Program
    {
        private static FrameworkWrapper Fw = null;

        public static async Task Main(string[] args)
        {

            Fw = await FrameworkWrapper.Create();

            await Fw.Log(nameof(Main), "Starting...");

            var unsub = await UnsubLib.UnsubLib.Create(Fw);

            IEnumerable<Entity> networks = null;

            try
            {
                if (args.Any(a => string.Equals(a, "skipClean", StringComparison.CurrentCultureIgnoreCase)))
                {
                    await Fw.Log(nameof(Main), "Skipping CleanUnusedFiles");
                }
                else
                {
                    await Fw.Log(nameof(Main), "Starting CleanUnusedFiles");
                    await unsub.CleanUnusedFiles();
                    await Fw.Log(nameof(Main), "Completed CleanUnusedFiles");
                }
            }
            catch (Exception exClean)
            {
                await Fw.Error(nameof(Main), $"CleanUnusedFiles:: {exClean}");
            }

            if (args.Any(a => string.Equals(a, "useLocal", StringComparison.CurrentCultureIgnoreCase)))
            {
                unsub.UseLocalNetworkFile = true;
            }

            if (args.Any(a => string.Equals(a, "singleThread", StringComparison.CurrentCultureIgnoreCase)))
            {
                unsub.MaxParallelism = 1;
            }

            var manualOnly = args.Any(a => string.Equals(a, "mo", StringComparison.CurrentCultureIgnoreCase));
            var singleNetworkName = args.Where(a => a.StartsWith("n:", StringComparison.CurrentCultureIgnoreCase)).Select(a => a[2..]).FirstOrDefault();
            string networkCampaignId = null;

            var skipQueuedCheck = args.Any(a => string.Equals(a, "skipQueuedCheck", StringComparison.CurrentCultureIgnoreCase));

            if (singleNetworkName != null)
            {
                networkCampaignId = args.Where(a => a.StartsWith("c:", StringComparison.CurrentCultureIgnoreCase)).Select(a => a[2..]).FirstOrDefault();
            }

            try
            {
                var res = await unsub.GetNetworks(singleNetworkName);

                networks = await res.GetL();

                if (networks == null)
                {
                    await Fw.Error(nameof(Main), $"GetNetworks DB call failed. Response: {res}");
                    return;
                }

                if (!networks.Any())
                {
                    await Fw.Error(nameof(Main), $"Network(s) not found {args.Join(" ")}  Response: {res}");
                    return;
                }
            }
            catch (Exception exGetNetworks)
            {
                await Fw.Error(nameof(Main), $"GetNetworksAndCreateLockFiles: {exGetNetworks}");
                return;
            }

            if (args.Any(a => string.Equals(a, "gsl", StringComparison.CurrentCultureIgnoreCase)))
            {
                var campaigns = args.Where(a => a.StartsWith("c:", StringComparison.CurrentCultureIgnoreCase)).Select(a => a[2..]).ToList();

                try
                {
                    foreach (var n in networks)
                    {
                        var np = Factory.GetInstance(Fw, n);

                        foreach (var c in campaigns)
                        {
                            try
                            {
                                await Fw.Log(nameof(Main), $"Starting ScheduledUnsubJob({n.GetS("Name")}, {c})...");
                                await unsub.ScheduledUnsubJob(n, c, skipQueuedCheck);
                                await Fw.Log(nameof(Main), $"Completed ScheduledUnsubJob({n.GetS("Name")}, {c})...");
                            }
                            catch (Exception e)
                            {
                                Console.WriteLine(e.Message);
                            }
                        }
                    }
                }
                catch
                {

                }
                finally
                {

                }

                return;
            }

            var refreshCampaigns = args.Any(a => string.Equals(a, "refreshCampaigns", StringComparison.CurrentCultureIgnoreCase));

            var manualDownloadUrl = args.Where(a => a.StartsWith("md:", StringComparison.CurrentCultureIgnoreCase)).Select(a => a[3..]).FirstOrDefault();

            foreach (var network in networks)
            {
                var name = await network.GetS("Name");
                var enabled = await network.GetB("Credentials.Enabled", true);
                if (!enabled)
                {
                    await Fw.Log(nameof(Main), $"Skipping({name}) because it is not enabled...");
                    continue;
                }

                await Fw.Log(nameof(Main), $"Starting({name})...");

                if (!string.IsNullOrWhiteSpace(manualDownloadUrl))
                {
                    await Fw.Log(nameof(Main), $"Starting ManualDownload({name}, {networkCampaignId}, {manualDownloadUrl})...");
                    await unsub.ManualDownload(network, networkCampaignId, manualDownloadUrl);
                    await Fw.Log(nameof(Main), $"Completed ManualDownload({name}, {networkCampaignId}, {manualDownloadUrl})...");
                    continue;
                }

                if (refreshCampaigns)
                {
                    try
                    {
                        await Fw.Log(nameof(Main), $"Starting GetCampaignsScheduledJobs({name}, {networkCampaignId})...");
                        var networkProvider = await Factory.GetInstance(Fw, network);
                        _ = await unsub.GetCampaignsScheduledJobs(network, networkProvider, skipQueuedCheck);
                        await Fw.Log(nameof(Main), $"Completed GetCampaignsScheduledJobs({name}, {networkCampaignId})...");
                    }
                    catch (HaltingException e)
                    {
                        await Fw.Error(nameof(UnsubJob), $"Network fatal error for {name}: {e.UnwrapForLog()}");
                        await Fw.Alert(nameof(UnsubJob), "Unsub Fatal Error", $"Network fatal error for {name}: {e.UnwrapForLog()}");
                        continue;
                    }
                    catch (Exception exScheduledUnsub)
                    {
                        await Fw.Error(nameof(Main), $"GetCampaignsScheduledJobs failed({name}): {exScheduledUnsub}");
                    }

                    continue;
                }

                var unsubMethod = await network.GetS("Credentials.UnsubMethod");

                if (unsubMethod == "ScheduledUnsubJob")
                {
                    if (!manualOnly)
                    {
                        try
                        {
                            await Fw.Log(nameof(Main), $"Starting ScheduledUnsubJob({name}, {networkCampaignId})...");
                            await unsub.ScheduledUnsubJob(network, networkCampaignId, skipQueuedCheck);
                            await Fw.Log(nameof(Main), $"Completed ScheduledUnsubJob({name}, {networkCampaignId})...");
                        }
                        catch (HaltingException e)
                        {
                            await Fw.Error(nameof(UnsubJob), $"Network fatal error for {name}: {e.UnwrapForLog()}");
                            await Fw.Alert(nameof(UnsubJob), "Unsub Fatal Error", $"Network fatal error for {name}: {e.UnwrapForLog()}");
                            continue;
                        }
                        catch (Exception exScheduledUnsub)
                        {
                            await Fw.Error(nameof(Main), $"ScheduledUnsubJob failed({name}): {exScheduledUnsub}");
                        }
                    }

                    if (await network.GetB("Credentials.IgnoreManualDirectory", false) != false)
                    {
                        try
                        {
                            await Fw.Log(nameof(Main), $"Starting AlsoDoManualDirectory({name})...");
                            await unsub.ManualDirectory(network, networkCampaignId);
                            await Fw.Log(nameof(Main), $"Completed AlsoDoManualDirectory({name})...");
                        }
                        catch (Exception exScheduledUnsub)
                        {
                            await Fw.Error(nameof(Main), $"AlsoDoManualDirectory failed({name}): {exScheduledUnsub}");
                        }
                    }
                }
                else if (unsubMethod == "ManualDirectory")
                {
                    try
                    {
                        await Fw.Log(nameof(Main), $"Starting ManualDirectory({name})...");
                        await unsub.ManualDirectory(network, networkCampaignId);
                        await Fw.Log(nameof(Main), $"Completed ManualDirectory({name})...");
                    }
                    catch (Exception exScheduledUnsub)
                    {
                        await Fw.Error(nameof(Main), $"ManualDirectory failed({name}): {exScheduledUnsub}");
                    }
                }
                else
                {
                    await Fw.Error(nameof(Main), $"Unknown UnsubMethod type: {unsubMethod}");
                }

                await Fw.Log(nameof(Main), $"Completed({name})...");
            }

            await Fw.Log(nameof(Main), "...Stopping");
        }
    }
}
