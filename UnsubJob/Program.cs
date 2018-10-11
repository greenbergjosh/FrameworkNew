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
            await Utility.ProtocolClient.UploadFile(
                                @"c:\workspace\unsub\2f4d4b49-4f9b-4ec9-97cb-21b1c3cef676.txt",
                                "Unsub/2f4d4b49-4f9b-4ec9-97cb-21b1c3cef676.txt.upl",
                                "ftpback-bhs6-85.ip-66-70-176.net",
                                "ns557038.ip-66-70-182.net",
                                "kerBVnPFmJ");
            return;

            IConfigurationRoot configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
            string cs = configuration.GetConnectionString("DefaultConnection");

            await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                           "Main", "Starting...", "");

            UnsubLib.UnsubLib nw = new UnsubLib.UnsubLib("ThirdPartyUnsub", cs);
            IGenericEntity networks = null;
            try
            {
                networks = await nw.GetNetworksAndCreateLockFiles();
            }
            catch (Exception exGetNetworks)
            {
                await SqlWrapper.InsertErrorLog(cs, 1000, "ThirdPartyUnsub",
                           $"GetNetworksAndCreateLockFiles",
                           "Main failed", exGetNetworks.ToString());
                return;
            }            

            foreach (var n in networks.GetL(""))
            {
                await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                           "Main", "Starting...", n.GetS("Name"));

                string unsubMethod = n.GetS("Credentials/UnsubMethod");
                if (unsubMethod == "ScheduledUnsubJob")
                {
                    try
                    {
                        //if (n.GetS("Name") == "bypass")
                        await nw.ScheduledUnsubJob(n);
                    }
                    catch (Exception exScheduledUnsub)
                    {
                        await SqlWrapper.InsertErrorLog(cs, 1000, "ThirdPartyUnsub",
                            $"ScheduledUnsubJob::" + n.GetS("Name"), 
                            "Main failed " + n.GetS("Name"), exScheduledUnsub.ToString());
                    }

                    if (n.GetS("AlsoDoManualDirectory") == "True")
                    {
                        try
                        {
                            await nw.ManualDirectory(n);
                        }
                        catch (Exception exScheduledUnsub)
                        {
                            await SqlWrapper.InsertErrorLog(cs, 1000, "ThirdPartyUnsub",
                                $"AlsoDoManual::" + n.GetS("Name"),
                                "Main failed " + n.GetS("Name"), exScheduledUnsub.ToString());
                        }
                    }
                }
                else if (unsubMethod == "ManualDirectory")
                {
                    try
                    {
                        await nw.ManualDirectory(n);
                    }
                    catch (Exception exScheduledUnsub)
                    {
                        await SqlWrapper.InsertErrorLog(cs, 1000, "ThirdPartyUnsub",
                            $"ManualDirectory::" + n.GetS("Name"), 
                            "Main failed " + n.GetS("Name"), exScheduledUnsub.ToString());
                    }
                }
                else
                {
                    await SqlWrapper.InsertErrorLog(cs, 1000, "ThirdPartyUnsub",
                            "Main", "Unknown UnsubMethod type", unsubMethod);
                }

                await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                           "Main", "Completed...", n.GetS("Name"));
            }

            await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                           "Main", "...Stopping", "");
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
