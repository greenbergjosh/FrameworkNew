//using Microsoft.Extensions.Configuration;
//using System;
//using System.Collections.Generic;
//using System.Diagnostics;
//using System.IO;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;
//using Fw = Utility.FrameworkWrapper;

//namespace Utility
//{
//    public static class UnixWrapper
//    {
//        static string exeDiff, exeGrep, exeSort, exeTr, exeUniq, exeUnzip, _sep, platform, basePath;

//        static void ConfirmPlatform(ref string platform)
//        {
//            if ("Auto".Equals(platform, StringComparison.InvariantCultureIgnoreCase))
//            {
//                platform = Environment.OSVersion.Platform.ToString();
//            }
//        }

//        static Func<string, string> AutoConfigure()
//        {
//            if (basePath == null)
//            {
//                platform = platform ?? "Auto";
//                ConfirmPlatform(ref platform);
//                if (platform == "Win32NT") { basePath = @"C:\\""Program Files""\\Git\\usr\\bin\\"; }
//                else if (platform == "Unix") { basePath = "/usr/bin/"; }
//            }

//            return (string bin) => $"{basePath}{bin}";
//        }

//        public static Func<string, string> FwSettingsFuncCtor(Fw fw)
//        {
//            if (fw == null) return (string bin) => null;
//            const string configPath = "Config/UnixWrapper";

//            var cfg = fw.StartupConfiguration;
//            platform = cfg.GetS($"{configPath}/Platform");
//            ConfirmPlatform(ref platform);
//            basePath = cfg.GetS($"{configPath}/{platform}/BasePath");

//            return (string bin) =>
//            {
//                var z = cfg.GetS($"{configPath}/Paths/{bin}");
//                var x = $"{basePath}{z}";
//                return x;
//            };
//        }

//        public static void Config(Fw fw)
//        {
//            _sep = Path.DirectorySeparatorChar.ToString();
//            var GetFwConfig = FwSettingsFuncCtor(fw);
//            var GetAppSetting = AutoConfigure();
//            string GetConfig(string bin) { return GetFwConfig(bin) ?? GetAppSetting(bin); };

//            exeDiff = GetConfig("diff");
//            exeGrep = GetConfig("grep");
//            exeSort = GetConfig("sort");
//            exeTr = GetConfig("tr");
//            exeUniq = GetConfig("uniq");
//            exeUnzip = GetConfig("unzip");
//        }

//        static UnixWrapper()
//        {
//            Config(null);
//        }

//        public static async Task UnzipZip(string ZipFileDirectory, string zipFileName,
//            string UnzippedDirectory, int timeout = 1000 * 60 * 5)
//        {
//            var inf = $"{ZipFileDirectory}{_sep}{zipFileName}";
//            var outf = $"{UnzippedDirectory}";
//            var cmd = $"{exeUnzip} \"{inf}\" -d \"{outf}\"";

//            var err = await cmd.Shell(platform);
//        }

//        public static async Task SortFile(string sourcePath, string inputFile,
//            string outputFile, bool caseSensitive, bool unique,
//            int timeout = 1000 * 60 * 5, int parallel = 4, string mem = "")
//        {
//            var bufferFlag = (String.IsNullOrEmpty(mem) ? "" : (" --buffer-size=" + mem));
//            var caseFlag = caseSensitive ? "" : " -f ";
//            var uniqFlag = unique ? " -u " : "";

//            var inf = $"{sourcePath}{_sep}{inputFile}";
//            var outf = $"{sourcePath}{_sep}{outputFile}";
//            var cmd = $"{exeSort} {bufferFlag} {caseFlag} {uniqFlag} {inf} > {outf}";

//            var err = await cmd.Shell(platform);
//        }

//        public static async Task RemoveNonAsciiFromFile(string sourcePath, string inputFile,
//            string outputFile, int timeout = 1000 * 60 * 5)
//        {
//            var inf = $"{sourcePath}{_sep}{inputFile}";
//            var outf = $"{sourcePath}{_sep}{outputFile}";
//            var cmd = $"{exeTr} -cd '\\11\\12\\15\\40-\\176' < {inf} > {outf}";

//            var err = await cmd.Shell(platform);
//        }

//        public static async Task RemoveNonMD5LinesFromFile(string sourcePath, string inputFile,
//            string outputFile, int timeout = 1000 * 60 * 5)
//        {
//            var args = " -P -i '[0-9a-f]{32}' ";
//            var inf = $"{sourcePath}{_sep}{inputFile}";
//            var outf = $"{sourcePath}{_sep}{outputFile}";
//            var cmd = $"{exeSort} {args} {inf} > {outf}";

//            var err = await cmd.Shell(platform);
//        }

//        private static void OutputRedirection(object sendingProcess, DataReceivedEventArgs outLine)
//        {
//            try
//            {
//                if (outLine.Data != null) Console.WriteLine(outLine.Data);
//            }
//            catch (Exception ex)
//            {
//                Console.WriteLine(ex.Message);
//                return;
//            }
//        }

//        public static async Task<(List<string> found, List<string> notFound)> BinarySearchSortedMd5FileV2(string filePath, List<string> keys)
//        {
//            var notFound = new List<string>();
//            var found = new List<string>();
//            var unsubFile = new FileInfo(filePath);

//            using (var fs = unsubFile.OpenRead())
//            {
//                var lineLength = 0;
//                var buffer = new byte[34];
//                var end = fs.Length;

//                await fs.ReadAsync(buffer, 0, 34);

//                if (buffer[32] == 10) lineLength = 33;
//                else if (buffer[32] == 13 && buffer[33] == 10) lineLength = 34;
//                else throw new Exception("Unexpected line termination character");

//                var lineCount = end / (decimal)lineLength;

//                if (lineCount != Math.Ceiling(lineCount)) throw new Exception("Inconsistent line length in file");

//                var fLength = unsubFile.Length;

//                buffer = new byte[32];

//                foreach (var md5 in keys)
//                {
//                    var numRec = fLength / lineLength;
//                    var bottom = 0L;
//                    var top = numRec - 1;
//                    var f = false;

//                    while (bottom <= top)
//                    {
//                        var cur = (top + bottom) / 2;

//                        fs.Seek(lineLength * cur, SeekOrigin.Begin);

//                        await fs.ReadAsync(buffer, 0, 32);

//                        var cmp = Encoding.UTF8.GetString(buffer, 0, buffer.Length).ToLower().CompareTo(md5);

//                        if (cmp < 0) bottom = cur + 1;
//                        else if (cmp > 0) top = cur - 1;
//                        else
//                        {
//                            f = true;
//                            break;
//                        }
//                    }

//                    if (f) found.Add(md5);
//                    else notFound.Add(md5);
//                }
//            }

//            return (found, notFound);
//        }

//        public static async Task<(List<string> found, List<string> notFound)>
//            BinarySearchSortedMd5File(string filePath, List<string> keys)
//        {
//            var notFound = new List<string>();
//            var found = new List<string>();
//            var unsubFile = new FileInfo(filePath);

//            keys.Sort();

//            using (var enrtr = keys.GetEnumerator())
//            using (var fs = unsubFile.OpenRead())
//            {
//                enrtr.MoveNext();

//                var lineLength = 0;
//                var buffer = new byte[34];
//                var end = fs.Length;

//                await fs.ReadAsync(buffer, 0, 34);

//                if (buffer[32] == 10) lineLength = 33;
//                else if (buffer[32] == 13 && buffer[33] == 10) lineLength = 34;
//                else throw new Exception("Unexpected line termination character");

//                var lineCount = end / (decimal)lineLength;

//                if (lineCount != Math.Ceiling(lineCount)) throw new Exception("Inconsistent line length in file");

//                end -= lineLength;

//                buffer = new byte[32];

//                var top = 0L;
//                var offsetThreshold = lineLength * 3;

//                bool EOS(long index)
//                {
//                    return index > end;
//                }

//                bool? SortedBelow(string line, string key)
//                {
//                    var c = line.CompareTo(key);

//                    return c > 0 ? false : c < 0 ? true : null as bool?;
//                }

//                async Task<string> GetIndexValue(long index)
//                {
//                    fs.Seek(index, SeekOrigin.Begin);

//                    await fs.ReadAsync(buffer, 0, 32);

//                    return Encoding.UTF8.GetString(buffer, 0, 32);
//                }

//                async Task<(bool? found, long index, bool? descend)> BinaryJumps()
//                {
//                    var descend = true;
//                    var bottom = end;

//                    while (!EOS(top))
//                    {
//                        var lines = (bottom - top) / lineLength;
//                        var index = (((int)Math.Floor(lines / 2M)) * lineLength) + top;
//                        var line = await GetIndexValue(index);
//                        var d = SortedBelow(line, enrtr.Current);

//                        if (d == null) return (true, index, null);

//                        descend = d.Value;

//                        // ToDo: See if moving end index improves performance
//                        if (descend)
//                        {
//                            var ni = index;

//                            if (bottom - ni <= offsetThreshold) return (null, index, descend);

//                            top = ni;
//                        }
//                        else
//                        {
//                            var ni = index - 1;

//                            if (ni - top <= offsetThreshold) return (null, index, descend);

//                            bottom = ni;
//                        }
//                    }

//                    return (false, -1, null);
//                }

//                async Task<bool> search(long index, bool descend)
//                {
//                    string line = null;

//                    while (!EOS(index) && (line = await GetIndexValue(index)) != null)
//                    {
//                        var d = SortedBelow(line, enrtr.Current);

//                        if (d == null) return true;

//                        if (d == false)
//                        {
//                            if (descend)
//                            {
//                                top = index;

//                                return false;
//                            }
//                            else index -= lineLength;
//                        }
//                        else if (descend) index += lineLength;
//                        else return false;
//                    }

//                    return false;
//                }

//                while (!EOS(top) && enrtr.Current != null)
//                {
//                    var r = await BinaryJumps();

//                    if (r.found == true) found.Add(enrtr.Current);
//                    else if (r.found == false) notFound.Add(enrtr.Current);
//                    else if (r.index > -1)
//                    {
//                        if (await search(r.index, r.descend.Value)) found.Add(enrtr.Current);
//                        else notFound.Add(enrtr.Current);
//                    }
//                    else
//                    {
//                        while (enrtr.Current != null)
//                        {
//                            notFound.Add(enrtr.Current);
//                            enrtr.MoveNext();
//                        }
//                    }

//                    enrtr.MoveNext();
//                }
//            }

//            return (found, notFound);
//        }

//        public static async Task<bool> BinarySearchSortedMd5File(string sourcePath, string file, string key)
//        {
//            var lkey = key.ToLower();
//            var fPath = sourcePath + _sep + file;

//            var fLength = new FileInfo(fPath).Length;

//            if (fLength < 33) return false;

//            using (var fsSource = new FileStream(fPath, FileMode.Open, FileAccess.Read))
//            {
//                var lLength = 0;
//                var bytes = new byte[34];
//                var n = await fsSource.ReadAsync(bytes, 0, 34);

//                if (bytes[32] == 10) lLength = 33;
//                else if (bytes[32] == 13 && bytes[33] == 10) lLength = 34;
//                else throw new Exception("Unexpected line termination character");

//                var numRec = fLength / lLength;

//                long bottom = 0;
//                var top = numRec - 1;
//                while (bottom <= top)
//                {
//                    var cur = (top + bottom) / 2;
//                    fsSource.Seek(lLength * cur, SeekOrigin.Begin);
//                    var nextBytes = new byte[32];
//                    var ct = await fsSource.ReadAsync(nextBytes, 0, 32);
//                    var cmp = Encoding.UTF8.GetString(nextBytes, 0, nextBytes.Length)
//                        .ToLower().CompareTo(lkey);
//                    if (cmp < 0) bottom = cur + 1;
//                    else if (cmp > 0) top = cur - 1;
//                    else return true;
//                }
//            }

//            return false;
//        }

//        public static async Task<bool> DiffFiles(string oldFile, string newFile, string sourcePath,
//            string diffFile, int timeout = 1000 * 60 * 5)
//        {
//            var changed = "--changed-group-format='%>'";
//            var unchanged = "--unchanged-group-format=''";
//            var oldf = $"{sourcePath}{_sep}{oldFile}";
//            var newf = $"{sourcePath}{_sep}{newFile}";
//            var outf = $"{sourcePath}{_sep}{diffFile}";
//            var cmd = $"{exeDiff} {changed} {unchanged} {oldf} {newf} > {outf}";

//            var err = await cmd.Shell(platform);
//            return !err.IsNullOrWhitespace();
//        }

//        public static async Task<bool> Unique(string oldFile, string newFile, string sourcePath, int timeout = 1000 * 60 * 5)
//        {
//            var inf = $"{sourcePath}{_sep}{oldFile}";
//            var outf = $"{sourcePath}{_sep}{newFile}";
//            var cmd = $"{exeUniq} {inf} > {outf}";

//            var err = await cmd.Shell(platform);
//            return !err.IsNullOrWhitespace();
//        }

//        public static async Task<int> LineCount(string fileName) => (await File.ReadAllLinesAsync(fileName)).Count();

//        public static void DiffManual(string curFile, string newFile, string diffFile)
//        {
//            var curFileLineCount = 0;
//            var newFileLineCount = 0;
//            var deltaLineCount = 0;
//            using (var diff = new StreamWriter(diffFile))
//            {
//                using (var oldRdr = File.OpenText(curFile))
//                {
//                    using (var newRdr = File.OpenText(newFile))
//                    {
//                        var readOld = true;
//                        var readNew = true;
//                        var oldLine = string.Empty;
//                        var newLine = string.Empty;
//                        while (!newRdr.EndOfStream && !oldRdr.EndOfStream)
//                        {
//                            if (readOld) { oldLine = oldRdr.ReadLine(); curFileLineCount++; }
//                            if (readNew) { newLine = newRdr.ReadLine(); newFileLineCount++; }
//                            var cmp = newLine.ToLower().CompareTo(oldLine.ToLower());

//                            if (cmp == 0) { readOld = true; readNew = true; continue; }
//                            if (cmp > 0) { readOld = true; readNew = false; continue; }
//                            {
//                                diff.WriteLine();
//                                deltaLineCount++;
//                                readOld = false;
//                                readNew = true;
//                            }
//                        }
//                        while (!newRdr.EndOfStream)
//                        {
//                            diff.WriteLine();
//                            newFileLineCount++;
//                            deltaLineCount++;
//                        }
//                    }
//                }
//            }
//        }
//    }
//}
