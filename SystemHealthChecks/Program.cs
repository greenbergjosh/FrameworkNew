using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.EDW.Logging;
using Jw = Utility.JsonWrapper;

namespace SystemHealthChecks
{
    internal class Program
    {
        private static FrameworkWrapper _fw = null;

        private static async Task Main(string[] args)
        {
            try
            {
                _fw = new FrameworkWrapper();

                var alertPayload = await LowDiskSpaceChecks();

                if (!alertPayload.lowDiskSpace.IsNullOrWhitespace())
                {
                    await _fw.Err(ErrorSeverity.Warn, nameof(LowDiskSpaceChecks), ErrorDescriptor.EmailAlert, alertPayload.lowDiskSpace);
                }

                if (!alertPayload.unreachable.IsNullOrWhitespace())
                {
                    await _fw.Err(ErrorSeverity.Warn, "DiskUnreachable", ErrorDescriptor.EmailAlert, alertPayload.lowDiskSpace);
                }
            }
            catch (Exception e)
            {
                if (_fw == null) Console.WriteLine($"Failed to load {nameof(FrameworkWrapper)}: {e}");
                else await _fw.Err(ErrorSeverity.Error, nameof(Main), ErrorDescriptor.Exception, e.ToString());
            }
        }

        private static async Task<(string lowDiskSpace, string unreachable)> LowDiskSpaceChecks()
        {
            var alerts = new List<EmailAlertPayloadItem>();
            var unreachable = new List<EmailAlertPayloadItem>();
            var config = _fw.StartupConfiguration.GetE("Config/LowDiskSpace");
            var thresholdStr = config.GetS("PercentThreshold");
            var threshold = thresholdStr.ParseUInt();
            var drives = config.GetD("Drives").Select(d => (name: d.Item1.Trim(), path: d.Item2.Trim()));

            if (threshold.HasValue)
            {
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows)) LowDiskSpaceWindows(drives, threshold, alerts, unreachable);
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux)) await LowDiskSpaceLinux(drives, threshold, alerts, unreachable);
                else alerts.Add(new EmailAlertPayloadItem("Invalid Config", $"OS Platform not supported {RuntimeInformation.OSDescription} Config: {_fw.StartupConfiguration}"));
            }
            else
            {
                alerts.Add(new EmailAlertPayloadItem("Invalid Config", $"PercentThreshold missing or not valid string: PercentThreshold={thresholdStr.IfNullOrWhitespace("null")}"));
            }

            var res = (lowDiskSpace: (string)null, unreachable: (string)null);

            if (alerts.Any()) res.lowDiskSpace = Jw.Serialize(new { Config = JToken.Parse(config.GetS("")), Alerts = alerts });

            if (unreachable.Any()) res.unreachable = Jw.Serialize(new { Config = JToken.Parse(config.GetS("")), Alerts = unreachable });

            return res;
        }

        private static async Task LowDiskSpaceLinux(IEnumerable<(string name, string path)> drives, uint? threshold, List<EmailAlertPayloadItem> alerts, List<EmailAlertPayloadItem> unreachable)
        {
            var rx = new Regex(@"^(?<drive>[^\s]+)\s+(?<kBlocks>\d+)\s+(?<used>\d+)\s+(?<available>\d+)\s+(?<usePerc>\d+)%\s+(?<mountedOn>.+)$", RegexOptions.Compiled | RegexOptions.ExplicitCapture | RegexOptions.Multiline);
            var psi = new ProcessStartInfo
            {
                FileName = "sh",
                Arguments = "-c df",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true
            };

            var proc = new Process
            {
                StartInfo = psi
            };

            proc.Start();

            var error = proc.StandardError.ReadToEnd();
            var output = proc.StandardOutput.ReadToEnd();

            proc.WaitForExit();

            if (!error.IsNullOrWhitespace())
            {
                await _fw.Error(nameof(LowDiskSpaceLinux), $"Shell command df failed: {error}");
                unreachable.AddRange(drives.Select(d => new DiskSpaceDetails(d.name, $"Shell command df failed: {error}")));
                return;
            }

            await _fw.Log(nameof(LowDiskSpaceLinux), $"df output: {output}");

            var driveDetails = rx.Matches(output).Select(m => new
            {
                drive = m.Groups["drive"]?.Value.Trim(),
                usedPerc = m.Groups["usePerc"]?.Value.ParseInt(),
                used = m.Groups["used"]?.Value.ParseInt(),
                available = m.Groups["available"]?.Value.ParseInt()
            })
                .Where(d => d.usedPerc.HasValue)
                .ToDictionary(d => d.drive, d => d);

            foreach (var drive in drives)
            {
                if (driveDetails.ContainsKey(drive.path))
                {
                    var dd = driveDetails[drive.path];
                    var percFree = 100 - dd.usedPerc;
                    var used = dd.used ?? 0;
                    var available = dd.available ?? 0;
                    var capacity = used + available;

                    if(percFree < threshold) alerts.Add(new DiskSpaceDetails(drive.name, Convert.ToInt32(percFree), Convert.ToInt32(available / 1000), Convert.ToInt32(used / 1000), Convert.ToInt32(capacity / 1000)));
                }
                else unreachable.Add(new DiskSpaceDetails(drive.name, $"Failed to retrieve data"));
            }

        }

        private static void LowDiskSpaceWindows(IEnumerable<(string name, string path)> drives, uint? threshold, List<EmailAlertPayloadItem> alerts, List<EmailAlertPayloadItem> unreachable)
        {
            foreach (var drive in drives)
            {
                try
                {
                    var stats = GetLocalDriveDetails(drive.path);

                    if (stats.capacity == 0) unreachable.Add(new DiskSpaceDetails(drive.name, "Drive unreachable"));
                    else
                    {
                        var percFree = stats.free * 100 / stats.capacity;

                        if (percFree < threshold)
                        {
                            alerts.Add(new DiskSpaceDetails(drive.name, Convert.ToInt32(percFree), Convert.ToInt32(stats.free / 1024), Convert.ToInt32(stats.used / 1024),
                                Convert.ToInt32(stats.capacity / 1024)));
                        }
                    }
                }
                catch (Exception e)
                {
                    unreachable.Add(new DiskSpaceDetails(drive.Item1, $"Failed to retrieve data: {e}"));
                }
            }
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
