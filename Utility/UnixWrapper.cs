using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Fs = Utility.FileSystem;

namespace Utility
{
    public static class UnixWrapper
    {
        // Should allow location of unix utilities to be configured
        public const string exeUnzip = @"C:\Program Files\Git\usr\bin\unzip";

        public static async Task UnzipZip(string ZipFileDirectory, string zipFileName,
            string UnzippedDirectory, int timeout = 1000 * 60 * 5)
        {
            //Directory.CreateDirectory(UnzippedDirectory);
            try
            {
                using var outs = new StringWriter();
                using var errs = new StringWriter();

                var exitCode = await ProcessWrapper.StartProcess(
                    exeUnzip,
                    $"\"{zipFileName}\" -d \"{UnzippedDirectory}\"",
                    ZipFileDirectory,
                    timeout,
                    outs,
                    errs).ConfigureAwait(continueOnCapturedContext: false);

                var err = errs.ToString();

                if (!err.IsNullOrWhitespace())
                {
                    throw new Exception($"Unzip failed: {err}");
                }
            }
            catch (TaskCanceledException)
            {
                throw;
            }
        }

        public const string exeSort = @"C:\Program Files\Git\usr\bin\sort";

        public static async Task SortFile(string sourcePath, string inputFile, string outputFile, bool caseSensitive, bool unique, int timeout = 1000 * 60 * 5, int parallel = 4, string mem = "") => _ = await ProcessWrapper.StartProcess(
                        exeSort,
                        $"--parallel={parallel} {inputFile}"
                            + (string.IsNullOrEmpty(mem) ? "" : (" --buffer-size=" + mem))
                            + $" --output={outputFile}"
                            + (caseSensitive ? "" : " -f") + (unique ? " -u" : ""),
                        sourcePath,
                        timeout,
                        null,
                        null).ConfigureAwait(continueOnCapturedContext: false);

        public const string exeTr = @"C:\Program Files\Git\usr\bin\tr";

        public static async Task RemoveNonAsciiFromFile(string sourcePath, string inputFile, string outputFile)
        {
            var inf = sourcePath + "\\" + inputFile;
            var outf = sourcePath + "\\" + outputFile;
            var pProcess = new Process();
            pProcess.StartInfo.FileName = @"C:\Windows\System32\cmd.exe";
            pProcess.StartInfo.Verb = "runas";
            pProcess.StartInfo.Arguments = "/c " +
                Fs.QuotePathParts(exeTr) + $" -cd '\\11\\12\\15\\40-\\176' < " +
                Fs.QuotePathParts(inf) + " > " + Fs.QuotePathParts(outf);
            pProcess.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
            pProcess.StartInfo.UseShellExecute = true;
            pProcess.StartInfo.WorkingDirectory = @"C:\Windows\System32";
            await pProcess.StartAndWaitForExitAsync();
            pProcess.Close();
        }

        public const string exeSed = @"C:\Program Files\Git\usr\bin\sed";

        public static async Task RemoveFirstLine(string sourcePath, string inputFile)
        {
            var inf = sourcePath + "\\" + inputFile;
            var pProcess = new Process();
            pProcess.StartInfo.FileName = @"C:\Windows\System32\cmd.exe";
            pProcess.StartInfo.Verb = "runas";
            pProcess.StartInfo.Arguments = "/c " +
                Fs.QuotePathParts(exeSed) + $" -i '1d' " +
                Fs.QuotePathParts(inf);
            pProcess.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
            pProcess.StartInfo.UseShellExecute = true;
            pProcess.StartInfo.WorkingDirectory = @"C:\Windows\System32";
            await pProcess.StartAndWaitForExitAsync();
            pProcess.Close();
        }

        public const string exeGrep = @"C:\Program Files\Git\usr\bin\grep";

        public static async Task RemoveNonPatternLinesFromFile(string sourcePath, string inputFile, string outputFile, string pattern)
        {
            var inf = sourcePath + "\\" + inputFile;
            var outf = sourcePath + "\\" + outputFile;
            var pProcess = new Process();
            pProcess.StartInfo.FileName = @"C:\Windows\System32\cmd.exe";
            pProcess.StartInfo.Verb = "runas";
            pProcess.StartInfo.Arguments = "/c " +
                Fs.QuotePathParts(exeGrep) + string.Format(" -x -P -i '{0}' ", pattern) + Fs.QuotePathParts(inf) +
                " > " + Fs.QuotePathParts(outf);
            pProcess.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
            pProcess.StartInfo.UseShellExecute = true;
            pProcess.StartInfo.WorkingDirectory = @"C:\Windows\System32";
            await pProcess.StartAndWaitForExitAsync();
            pProcess.Close();
        }

        public const string exeFile = @"C:\Program Files\Git\usr\bin\file";

        public static async Task<bool> IsZip(string logName, string file, FrameworkWrapper fw)
        {
            var resultFileName = Path.GetTempFileName();

            var process = new Process();
            process.StartInfo.FileName = @"C:\Windows\System32\cmd.exe";
            process.StartInfo.Verb = "runas";
            process.StartInfo.Arguments = $"/c {Fs.QuotePathParts(exeFile)} -b {Fs.QuotePathParts(file)} >> {Fs.QuotePathParts(resultFileName)}";
            process.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
            process.StartInfo.UseShellExecute = true;
            await process.StartAndWaitForExitAsync();
            process.Close();

            var result = await File.ReadAllTextAsync(resultFileName);
            _ = Fs.TryDeleteFile(resultFileName);

            await fw.Log($"{nameof(IsZip)}-{logName}", $"File {file}: {result}");
            return result?.Contains("zip", StringComparison.OrdinalIgnoreCase) == true;
        }

        public static async Task RemoveNonMD5LinesFromFile(string sourcePath, string inputFile, string outputFile) => await RemoveNonPatternLinesFromFile(sourcePath, inputFile, outputFile, "^[0-9a-f]{32}[\\r\\n]?");

        public static async Task RemoveNonSHA512LinesFromFile(string sourcePath, string inputFile, string outputFile) => await RemoveNonPatternLinesFromFile(sourcePath, inputFile, outputFile, "^(?:0[xX])?[0-9a-f]{128}[\\r\\n]?");

        private static void OutputRedirection(object sendingProcess, DataReceivedEventArgs outLine)
        {
            try
            {
                if (outLine.Data != null)
                {
                    Console.WriteLine(outLine.Data);
                }
                // or collect the data, etc
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return;
            }
        }

        public static async Task<bool> BinarySearchSortedFile(string filePath, int baseLineLength, string key) => (await BinarySearchSortedFile(filePath, baseLineLength, new List<string>() { key })).found.Count > 0;

        public static async Task<(List<string> found, List<string> notFound)> BinarySearchSortedFile(string filePath, int baseLineLength, List<string> keys)
        {
            var minLineLength = baseLineLength + 1;
            var maxLineLength = baseLineLength + 2;

            const int LF = 10;
            const int CR = 13;

            var notFound = new List<string>();
            var found = new List<string>();
            var unsubFile = new FileInfo(filePath);

            using (var fs = unsubFile.OpenRead())
            {
                var lineLength = 0;
                var buffer = new byte[maxLineLength];
                var end = fs.Length;

                _ = await fs.ReadAsync(buffer.AsMemory(0, maxLineLength));

                lineLength = buffer[baseLineLength] == LF
                    ? minLineLength
                    : buffer[baseLineLength] == CR && buffer[minLineLength] == LF
                        ? maxLineLength
                        : throw new Exception($"Unexpected line termination character on line with expected length of: {baseLineLength} with data: {Encoding.UTF8.GetString(buffer, 0, buffer.Length)}");

                var lineCount = end / (decimal)lineLength;

                if (lineCount != Math.Ceiling(lineCount))
                {
                    throw new Exception("Inconsistent line length in file");
                }

                var fLength = unsubFile.Length;

                buffer = new byte[baseLineLength];

                foreach (var key in keys)
                {
                    var keyLower = key.ToLower();
                    var numRec = fLength / lineLength;
                    var bottom = 0L;
                    var top = numRec - 1;
                    var f = false;

                    while (bottom <= top)
                    {
                        var cur = (top + bottom) / 2;

                        _ = fs.Seek(lineLength * cur, SeekOrigin.Begin);

                        _ = await fs.ReadAsync(buffer.AsMemory(0, baseLineLength));

                        var cmp = Encoding.UTF8.GetString(buffer, 0, buffer.Length).ToLower().CompareTo(keyLower);

                        if (cmp < 0)
                        {
                            bottom = cur + 1;
                        }
                        else if (cmp > 0)
                        {
                            top = cur - 1;
                        }
                        else
                        {
                            f = true;
                            break;
                        }
                    }

                    if (f)
                    {
                        found.Add(key);
                    }
                    else
                    {
                        notFound.Add(key);
                    }
                }
            }

            return (found, notFound);
        }

        public const string exeDiff = @"C:\Program Files\Git\usr\bin\diff";

        public static async Task<bool> DiffFiles(string oldFile, string newFile, string sourcePath,
            string diffFile, int timeout = 1000 * 60 * 5)
        {
            var swOut = new StreamWriter(sourcePath + "\\" + diffFile, true);
            var timedOut = false;
            try
            {
                var exitCode = await ProcessWrapper.StartProcess(
                exeDiff,
                "--changed-group-format=\"%>\" --unchanged-group-format=\"\" "
                    + oldFile + " "
                    + newFile,
                sourcePath,
                timeout,
                swOut,
                null).ConfigureAwait(continueOnCapturedContext: false);
            }
            catch (TaskCanceledException)
            {
                timedOut = true;
            }
            finally
            {
                swOut.Close();
            }

            return timedOut;
        }

        public const string exeUniq = @"C:\Program Files\Git\usr\bin\uniq";

        public static async Task<bool> Unique(string oldFile, string newFile, string sourcePath, int timeout = 1000 * 60 * 5)
        {
            var swOut = new StreamWriter(sourcePath + "\\" + newFile, true);
            var timedOut = false;
            try
            {
                var exitCode = await ProcessWrapper.StartProcess(
                    exeUniq,
                    "-i " + sourcePath + "\\" + oldFile,
                    sourcePath,
                    timeout,
                    swOut,
                    null).ConfigureAwait(continueOnCapturedContext: false);
            }
            catch (TaskCanceledException)
            {
                timedOut = true;
            }
            finally
            {
                swOut.Close();
            }

            return timedOut;
        }

        public static async Task<int> LineCount(string fileName) => (await File.ReadAllLinesAsync(fileName)).Length;

        public static void DiffManual(string curFile, string newFile, string diffFile)
        {
            var curFileLineCount = 0;
            var newFileLineCount = 0;
            var deltaLineCount = 0;

            using var diff = new StreamWriter(diffFile);
            using var oldRdr = File.OpenText(curFile);
            using var newRdr = File.OpenText(newFile);

            var readOld = true;
            var readNew = true;
            var oldLine = string.Empty;
            var newLine = string.Empty;
            while (!newRdr.EndOfStream && !oldRdr.EndOfStream)
            {
                if (readOld)
                {
                    oldLine = oldRdr.ReadLine();
                    curFileLineCount++;
                }

                if (readNew)
                {
                    newLine = newRdr.ReadLine();
                    newFileLineCount++;
                }

                var cmp = newLine.ToLower().CompareTo(oldLine.ToLower());
                if (cmp == 0)
                {
                    readOld = true;
                    readNew = true;
                    continue;
                }

                if (cmp > 0)
                {
                    readOld = true;
                    readNew = false;
                    continue;
                }

                {
                    diff.WriteLine();
                    deltaLineCount++;
                    readOld = false;
                    readNew = true;
                }
            }

            while (!newRdr.EndOfStream)
            {
                diff.WriteLine();
                newFileLineCount++;
                deltaLineCount++;
            }
        }

        public static async Task MergeFiles(string destinationFile, IEnumerable<string> inputFiles)
        {
            var pProcess = new Process();
            pProcess.StartInfo.FileName = @"C:\Windows\System32\cmd.exe";
            pProcess.StartInfo.Verb = "runas";
            pProcess.StartInfo.Arguments = "/c " +
                Fs.QuotePathParts(exeSed) + $" -n w{Fs.QuotePathParts(destinationFile)} {string.Join(' ', inputFiles.Select(Fs.QuotePathParts))}";
            pProcess.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
            pProcess.StartInfo.UseShellExecute = true;
            pProcess.StartInfo.WorkingDirectory = @"C:\Windows\System32";
            await pProcess.StartAndWaitForExitAsync();
            pProcess.Close();
        }
    }
}
