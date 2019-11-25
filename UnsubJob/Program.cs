using System;
using System.Collections.Generic;
using System.Linq;
using Utility;
using System.Threading.Tasks;
using Newtonsoft.Json;
using UnsubLib;
using UnsubLib.NetworkProviders;
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

            // AppName = "UnsubJob"
            var nw = new UnsubLib.UnsubLib(Fw);

            IEnumerable<IGenericEntity> networks = null;

            /*var other = new Factory.Other(Fw);
            var network = (await nw.GetNetworks("Amobee")).GetL("").First();

            await ProtocolClient.DownloadEzepo();
            var campaigns = await other.GetCampaigns(network);

            var uri = await other.GetSuppressionLocationUrl(network, "2402");
            
            var l = new UnsubLib.UnsubFileProviders.Unsubly(Fw);
            var canHandle = l.CanHandle(network, uri);
            var uri2 = await l.GetFileUrl(network, uri);

            await nw.DownloadSuppressionFiles(network, uri2, "test");*/
                    
            try
            {
                await Fw.Log(nameof(Main), "Starting CleanUnusedFiles");
                await nw.CleanUnusedFiles();
                await Fw.Log(nameof(Main), "Completed CleanUnusedFiles");
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
                                await nw.ScheduledUnsubJob(n, c);
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
                            await nw.ScheduledUnsubJob(n, networkCampaignId);
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

        public void Nothing()
        {
            //List<string> files = new List<string>()
            //{
            //    "0aa19e73-8c43-46c7-9a5f-124110d5d21c.txt.srt",
            //    "0aa19e73-8c43-46c7-9a5f-124110d5d21c.txt.srt",
            //    "0aa19e73-8c43-46c7-9a5f-124110d5d21c.txt.srt",
            //    "0aa19e73-8c43-46c7-9a5f-124110d5d21c.txt.srt",
            //    "0aa19e73-8c43-46c7-9a5f-124110d5d21c.txt.srt",
            //    "0aa19e73-8c43-46c7-9a5f-124110d5d21c.txt.srt",
            //    "0aa19e73-8c43-46c7-9a5f-124110d5d21c.txt.srt",
            //    "0aa19e73-8c43-46c7-9a5f-124110d5d21c.txt.srt",
            //    "0aa19e73-8c43-46c7-9a5f-124110d5d21c.txt.srt",
            //    "0aa19e73-8c43-46c7-9a5f-124110d5d21c.txt.srt",
            //    "0aa19e73-8c43-46c7-9a5f-124110d5d21c.txt.srt",
            //    "0aa19e73-8c43-46c7-9a5f-124110d5d21c.txt.srt"
            //};

            //ServicePointManager.DefaultConnectionLimit = 10;
            ////foreach (var c in files)
            //await Pw.ForEachAsync(files, 10, async c =>
            //{
            //    await Utility.ProtocolClient.DownloadFileFtp(@"e:\workspace\unsub",
            //    c,
            //    Guid.NewGuid().ToString() + ".tst", "localhost", "josh", "josh!123");
            //});

            // Test server signaling
            //HashSet<Tuple<string, string>> diffs = new HashSet<Tuple<string, string>>();
            //Dictionary<string, string> ndf = new Dictionary<string, string>();
            //diffs.Add(new Tuple<string, string>("a4afb09d-7ec9-420e-b214-3c9ad65121bd",
            //    "a4afb09d-7ec9-420e-b214-3c9ad65121be"));
            //diffs.Add(new Tuple<string, string>("feae7a23-ecd8-4278-9e74-e270b475bc60",
            //    "feae7a23-ecd8-4278-9e74-e270b475bc61"));
            //ndf.Add("95CDC8CA-F898-4516-BE04-5A1F4AD00B8F", "e128c734-f196-4912-b9d6-7cda39d14d7a");
            //ndf.Add("E0E96736-B403-40ED-9528-A26886FCFA6D", "fef122e7-e0b7-4ec9-921b-a9aece1f428c");
            //nw.SignalUnsubServerService(diffs, ndf).GetAwaiter().GetResult();
            // End test
        }
    }
}
