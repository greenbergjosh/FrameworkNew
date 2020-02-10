using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UnsubLib;
using UnsubLib.NetworkProviders;
using Utility;
using Utility.GenericEntity;

namespace UnsubJob
{
    class Program
    {
        private static FrameworkWrapper Fw = null;

        public static async Task Main(string[] args)
        {

            Fw = new FrameworkWrapper();

            await Fw.Log(nameof(Main), "Starting...");

            var nw = new UnsubLib.UnsubLib(Fw);

            IEnumerable<IGenericEntity> networks = null;

            try
            {
                if (args.Any(a => string.Equals(a, "skipClean", StringComparison.CurrentCultureIgnoreCase)))
                {
                    await Fw.Log(nameof(Main), "Skipping CleanUnusedFiles");
                }
                else
                {
                    await Fw.Log(nameof(Main), "Starting CleanUnusedFiles");
                    await nw.CleanUnusedFiles();
                    await Fw.Log(nameof(Main), "Completed CleanUnusedFiles");
                }
            }
            catch (Exception exClean)
            {
                await Fw.Error(nameof(Main), $"CleanUnusedFiles:: {exClean}");
            }

            if (args.Any(a => String.Equals(a, "useLocal", StringComparison.CurrentCultureIgnoreCase)))
            {
                nw.UseLocalNetworkFile = true;
            }

            if (args.Any(a => String.Equals(a, "singleThread", StringComparison.CurrentCultureIgnoreCase)))
            {
                nw.MaxParallelism = 1;
            }

            var manualOnly = args.Any(a => string.Equals(a, "mo", StringComparison.CurrentCultureIgnoreCase));
            var singleNetworkName = args.Where(a => a.StartsWith("n:", StringComparison.CurrentCultureIgnoreCase)).Select(a => a.Substring(2)).FirstOrDefault();
            string networkCampaignId = null;

            var skipQueuedCheck = args.Any(a => string.Equals(a, "skipQueuedCheck", StringComparison.CurrentCultureIgnoreCase));

            if (singleNetworkName != null) networkCampaignId = args.Where(a => a.StartsWith("c:", StringComparison.CurrentCultureIgnoreCase)).Select(a => a.Substring(2)).FirstOrDefault();

            try
            {
                var res = await nw.GetNetworks(singleNetworkName);

                networks = res?.GetL("");

                if (networks == null)
                {
                    await Fw.Error(nameof(Main), $"GetNetworks DB call failed. Response: {res?.GetS("")}");
                    return;
                }

                if (!networks.Any())
                {
                    await Fw.Error(nameof(Main), $"Network(s) not found {args.Join(" ")}  Response: {res?.GetS("")}");
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
                var campaigns = args.Where(a => a.StartsWith("c:", StringComparison.CurrentCultureIgnoreCase)).Select(a => a.Substring(2)).ToList();

                try
                {
                    foreach (var n in networks)
                    {
                        var np = Factory.GetInstance(Fw, n);

                        foreach (var c in campaigns)
                        {
                            try
                            {
                                await nw.ScheduledUnsubJob(n, c, skipQueuedCheck);
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

            foreach (var n in networks)
            {
                var name = n.GetS("Name");

                await Fw.Log(nameof(Main), $"Starting({name})...");

                var unsubMethod = n.GetS("Credentials/UnsubMethod");

                if (unsubMethod == "ScheduledUnsubJob")
                {
                    if (!manualOnly)
                    {
                        try
                        {
                            await Fw.Log(nameof(Main), $"Starting ScheduledUnsubJob({name})...");
                            await nw.ScheduledUnsubJob(n, networkCampaignId, skipQueuedCheck);
                            await Fw.Log(nameof(Main), $"Completed ScheduledUnsubJob({name})...");
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

                    if (n.GetS("Credentials/IgnoreManualDirectory").ParseBool() != false)
                    {
                        try
                        {
                            await Fw.Log(nameof(Main), $"Starting AlsoDoManualDirectory({name})...");
                            await nw.ManualDirectory(n, true);
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
                        await nw.ManualDirectory(n, true);
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
