﻿using System;
using Utility;
using System.Threading.Tasks;

namespace UnsubJob
{
    class Program
    {
        private static FrameworkWrapper Fw = new FrameworkWrapper();

        public static async Task Main(string[] args)
        {
            await Fw.Log(nameof(Main), "Starting...");

            // AppName = "UnsubJob"
            var nw = new UnsubLib.UnsubLib(Fw);
            IGenericEntity networks = null;

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

            try
            {
                string singleNetworkName = null;
                if (args.Length > 0 && !String.IsNullOrEmpty(args[0]))
                    singleNetworkName = args[0];

                networks = await nw.GetNetworks(singleNetworkName);
            }
            catch (Exception exGetNetworks)
            {
                await Fw.Error(nameof(Main), $"GetNetworksAndCreateLockFiles: {exGetNetworks}");
                return;
            }

            foreach (var n in networks.GetL(""))
            {
                var name = n.GetS("Name");

                await Fw.Log(nameof(Main), $"Starting({name})...");

                var unsubMethod = n.GetS("Credentials/UnsubMethod");

                if (unsubMethod == "ScheduledUnsubJob")
                {
                    try
                    {
                        await Fw.Log(nameof(Main), $"Starting ScheduledUnsubJob({name})...");
                        await nw.ScheduledUnsubJob(n);
                        await Fw.Log(nameof(Main), $"Completed ScheduledUnsubJob({name})...");
                    }
                    catch (Exception exScheduledUnsub)
                    {
                        await Fw.Error(nameof(Main), $"ScheduledUnsubJob failed({name}): {exScheduledUnsub}");
                    }

                    if (n.GetS("AlsoDoManualDirectory") == "True")
                    {
                        try
                        {
                            await Fw.Log(nameof(Main), $"Starting AlsoDoManualDirectory({name})...");
                            await nw.ManualDirectory(n);
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
                        await nw.ManualDirectory(n);
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
