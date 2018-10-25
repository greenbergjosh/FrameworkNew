using System;
using UnsubLib;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Collections.Generic;
using GenericEntity;
using Fs = Utility.FileSystem;
using Pw = Utility.ParallelWrapper;
using System.Threading;
using System.Threading.Tasks;
using System.Net;

namespace UnsubJob
{
    class Program
    {
        public static async Task Main(string[] args)
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
            string cs = configuration.GetConnectionString("DefaultConnection");

            await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                           "Main", "Tracking", "Starting...");

            UnsubLib.UnsubLib nw = new UnsubLib.UnsubLib("UnsubJob", cs);
            IGenericEntity networks = null;
            
            try
            {
                await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                    $"Main", "Tracking", $"Starting CleanUnusedFiles");

                await nw.CleanUnusedFiles();

                await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                    $"Main", "Tracking", $"Completed CleanUnusedFiles");
            }
            catch (Exception exClean)
            {
                await SqlWrapper.InsertErrorLog(cs, 1000, "UnsubJob",
                    $"Main", "Exception", $"CleanUnusedFiles:: " + exClean.ToString());
            }

            try
            {
                string singleNetworkName = null;
                if (args.Length > 0 && !String.IsNullOrEmpty(args[1]))
                    singleNetworkName = args[1];
                    
                networks = await nw.GetNetworks(args[1]);
            }
            catch (Exception exGetNetworks)
            {
                await SqlWrapper.InsertErrorLog(cs, 1000, "UnsubJob",
                           "Main",
                           "Exception", "GetNetworksAndCreateLockFiles: " + exGetNetworks.ToString());
                return;
            }            

            foreach (var n in networks.GetL(""))
            {
                await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                           "Main", "Tracking", $"Starting({n.GetS("Name")})...");

                string unsubMethod = n.GetS("Credentials/UnsubMethod");
                if (unsubMethod == "ScheduledUnsubJob")
                {
                    try
                    {
                        await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                           "Main", "Tracking", $"Starting ScheduledUnsubJob({n.GetS("Name")})...");
                        await nw.ScheduledUnsubJob(n);
                        await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                           "Main", "Tracking", $"Completed ScheduledUnsubJob({n.GetS("Name")})...");
                    }
                    catch (Exception exScheduledUnsub)
                    {
                        await SqlWrapper.InsertErrorLog(cs, 1000, "UnsubJob",
                            "Main", "Exception",
                            $"ScheduledUnsubJob failed({n.GetS("Name")}): " +  exScheduledUnsub.ToString());
                    }

                    if (n.GetS("AlsoDoManualDirectory") == "True")
                    {
                        try
                        {
                            await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                                "Main", "Tracking", $"Starting AlsoDoManualDirectory({n.GetS("Name")})...");
                            await nw.ManualDirectory(n);
                            await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                                "Main", "Tracking", $"Completed AlsoDoManualDirectory({n.GetS("Name")})...");
                        }
                        catch (Exception exScheduledUnsub)
                        {
                            await SqlWrapper.InsertErrorLog(cs, 1000, "UnsubJob",
                                "Main", "Exception",
                                $"AlsoDoManualDirectory failed({n.GetS("Name")}): " + exScheduledUnsub.ToString());
                        }
                    }
                }
                else if (unsubMethod == "ManualDirectory")
                {
                    try
                    {
                        await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                                "Main", "Tracking", $"Starting ManualDirectory({n.GetS("Name")})...");
                        await nw.ManualDirectory(n);
                        await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                                "Main", "Tracking", $"Completed ManualDirectory({n.GetS("Name")})...");
                    }
                    catch (Exception exScheduledUnsub)
                    {
                        await SqlWrapper.InsertErrorLog(cs, 1000, "UnsubJob",
                                "Main", "Exception",
                                $"ManualDirectory failed({n.GetS("Name")}): " + exScheduledUnsub.ToString());
                    }
                }
                else
                {
                    await SqlWrapper.InsertErrorLog(cs, 1000, "UnsubJob",
                            "Main", "Error", "Unknown UnsubMethod type: " + unsubMethod);
                }

                await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                           "Main", "Tracking", $"Completed({n.GetS("Name")})...");
            }

            await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                           "Main", "Tracking", $"...Stopping");
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
