﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Utility;
using Jw = Utility.JsonWrapper;

namespace SystemHealthChecks
{
    class Program
    {
        private static FrameworkWrapper fw = null;

        static async Task Main(string[] args)
        {
            try
            {
                fw = new FrameworkWrapper();

                var alertPayload = LowDiskSpaceChecks();

                if (!alertPayload.IsNullOrWhitespace())
                {
                    await fw.Err(ErrorSeverity.Alert, nameof(LowDiskSpaceChecks), ErrorDescriptor.EmailAlert, alertPayload);
                }
            }
            catch (Exception e)
            {
                if (fw == null) Console.WriteLine($"Failed to load {nameof(FrameworkWrapper)}: {e}");
                else await fw.Err(ErrorSeverity.Error, nameof(Main), ErrorDescriptor.Exception, e.ToString());
            }
        }

        private static string LowDiskSpaceChecks()
        {
            var alerts = new List<EmailAlertPayloadItem>();
            var config = fw.StartupConfiguration.GetE("Config/LowDiskSpace");
            var thresholdStr = config.GetS("PercentThreshold");
            var threshold = thresholdStr.ParseUInt();
            var drives = config.GetD("Drives");

            if (threshold.HasValue)
            {
                foreach (var drive in drives)
                {
                    try
                    {
                        var stats = GetLocalDriveDetails(drive.Item2);

                        if (stats.capacity == 0) alerts.Add(new DiskSpaceDetails(drive.Item1, "Drive unreachable"));
                        else
                        {
                            var percFree = stats.free * 100 / stats.capacity;

                            if (percFree < threshold)
                            {
                                alerts.Add(new DiskSpaceDetails(drive.Item1, Convert.ToInt32(percFree), Convert.ToInt32(stats.free / 1024), Convert.ToInt32(stats.used / 1024), Convert.ToInt32(stats.capacity / 1024)));
                            }
                        }
                    }
                    catch (Exception e)
                    {
                        alerts.Add(new DiskSpaceDetails(drive.Item1, $"Failed to retrieve data: {e}"));
                    }
                }
            }
            else
            {
                alerts.Add(new EmailAlertPayloadItem("Invalid Config", $"PercentThreshold missing or not valid string: PercentThreshold={thresholdStr.IfNullOrWhitespace("null")}"));
            }

            return alerts.Any() ? PL.N("Config", config.GetS("")).Add(PL.N("Alerts", JsonConvert.SerializeObject(alerts))).ToString() : null;
        }

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool GetDiskFreeSpaceEx(string lpDirectoryName,
            out ulong lpFreeBytesAvailable,
            out ulong lpTotalNumberOfBytes,
            out ulong lpTotalNumberOfFreeBytes);

        private static (ulong free, ulong used, ulong capacity) GetLocalDriveDetails(string path)
        {
            const ulong div = 1048576L; // Math.Pow(1024,2)
            var d = GetDiskFreeSpaceEx(path, out var freeBytes, out var totalBytes, out var totalFreeBytes);

            if (totalBytes == 0) return (0, 0, 0);

            return (free: freeBytes / div, used: (totalBytes - freeBytes) / div, capacity: totalBytes / div);
        }

    }

    public class DiskSpaceDetails : EmailAlertPayloadItem
    {
        public DiskSpaceDetails(string drive, string errorMsg) : base(drive, errorMsg) { }

        public DiskSpaceDetails(string drive, int freePercent, int freeGB, int usedGB, int capacityGB) : base(drive, null)
        {
            FreePercent = freePercent;
            FreeGB = freeGB;
            UsedGB = usedGB;
            CapacityGB = capacityGB;
        }

        public int FreePercent { get; }
        public int FreeGB { get; }
        public int UsedGB { get; }
        public int CapacityGB { get; }
    }
}
