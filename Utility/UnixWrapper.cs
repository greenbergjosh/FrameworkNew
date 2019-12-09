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
        public static string exeUnzip = @"C:\Program Files\Git\usr\bin\unzip";

        public static async Task UnzipZip(string ZipFileDirectory, string zipFileName,
            string UnzippedDirectory, int timeout = 1000 * 60 * 5)
        {
            //Directory.CreateDirectory(UnzippedDirectory);
            try
            {
                using (var outs = new StringWriter())
                {
                    using (var errs = new StringWriter())
                    {
                        var exitCode = await ProcessWrapper.StartProcess(
                            exeUnzip,
                            $"\"{zipFileName}\" -d \"{UnzippedDirectory}\"",
                            ZipFileDirectory,
                            timeout,
                            outs,
                            errs).ConfigureAwait(continueOnCapturedContext: false);

                        var err = errs.ToString();

                        if (!err.IsNullOrWhitespace()) throw new Exception($"Unzip failed: {err}");
                    }
                }
            }
            catch (TaskCanceledException)
            {
                throw;
            }
        }

        public static string exeSort = @"C:\Program Files\Git\usr\bin\sort";

        public static async Task SortFile(string sourcePath, string inputFile,
            string outputFile, bool caseSensitive, bool unique,
            int timeout = 1000 * 60 * 5, int parallel = 4, string mem = "")
        {
            var exitCode = await ProcessWrapper.StartProcess(
                        exeSort,
                        $"--parallel={parallel} {inputFile}"
                            + (String.IsNullOrEmpty(mem) ? "" : (" --buffer-size=" + mem))
                            + $" --output={outputFile}"
                            + (caseSensitive ? "" : " -f") + (unique ? " -u" : ""),
                        sourcePath,
                        timeout,
                        null,
                        null).ConfigureAwait(continueOnCapturedContext: false);
        }

        public static string exeTr = @"C:\Program Files\Git\usr\bin\tr";

        public static async Task RemoveNonAsciiFromFile(string sourcePath, string inputFile,
            string outputFile, int timeout = 1000 * 60 * 5)
        {
            // This version is too slow
            //using (var inf = new FileStream(sourcePath + "\\" + inputFile, FileMode.Open))
            //{
            //    using (var outf = File.CreateText(sourcePath + "\\" + outputFile))
            //    {
            //          var exitCode = await ProcessWrapper.StartProcess(
            //            exeTr,
            //            $"-cd '\\11\\12\\15\\40-\\176'",
            //            sourcePath,
            //            timeout,
            //            outf,
            //            null,
            //            inf).ConfigureAwait(continueOnCapturedContext: false);
            //    }
            //}

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
            pProcess.Start();
            await pProcess.WaitForExitAsync();
            pProcess.Close();
        }

        public static string exeSed = @"C:\Program Files\Git\usr\bin\sed";

        public static async Task RemoveFirstLine(string sourcePath, string inputFile, int timeout = 1000 * 60 * 5)
        {
            // This version is too slow
            //using (var inf = new FileStream(sourcePath + "\\" + inputFile, FileMode.Open))
            //{
            //    using (var outf = File.CreateText(sourcePath + "\\" + outputFile))
            //    {
            //          var exitCode = await ProcessWrapper.StartProcess(
            //            exeTr,
            //            $"-cd '\\11\\12\\15\\40-\\176'",
            //            sourcePath,
            //            timeout,
            //            outf,
            //            null,
            //            inf).ConfigureAwait(continueOnCapturedContext: false);
            //    }
            //}

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
            pProcess.Start();
            await pProcess.WaitForExitAsync();
            pProcess.Close();
        }

        public static string exeGrep = @"C:\Program Files\Git\usr\bin\grep";

        public static async Task RemoveNonPatternLinesFromFile(string sourcePath, string inputFile,
            string outputFile, string pattern, int timeout = 1000 * 60 * 5)
        {
            try
            {
                var inf = sourcePath + "\\" + inputFile;
                var outf = sourcePath + "\\" + outputFile;
                var pProcess = new Process();
                pProcess.StartInfo.FileName = @"C:\Windows\System32\cmd.exe";
                pProcess.StartInfo.Verb = "runas";
                pProcess.StartInfo.Arguments = "/c " +
                    Fs.QuotePathParts(exeGrep) + string.Format(" -P -i '{0}' ", pattern) + Fs.QuotePathParts(inf) +
                    " > " + Fs.QuotePathParts(outf);
                pProcess.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                pProcess.StartInfo.UseShellExecute = true;
                pProcess.StartInfo.WorkingDirectory = @"C:\Windows\System32";
                pProcess.Start();
                await pProcess.WaitForExitAsync();
                pProcess.Close();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public static async Task RemoveNonMD5LinesFromFile(string sourcePath, string inputFile, string outputFile) => await RemoveNonPatternLinesFromFile(sourcePath, inputFile, outputFile, "[0-9a-f]{32}");
        // regex is tightened up from the one above (not sure if it would break existing checks, so leaving it alone)
        // 1. check from the beginning of the line to the end
        // 2. allow possible "0x" (case-insensitive) leading string in front of hex digest string
        // 3. include possible carriage return & linefeed as line termination characters
        public static async Task RemoveNonSHA512LinesFromFile(string sourcePath, string inputFile, string outputFile, int timeout = 1000 * 60 * 5) => await RemoveNonPatternLinesFromFile(sourcePath, inputFile, outputFile, "^(?:0[xX])?[0-9a-f]{128}[\\r\\n]?$");

        private static void OutputRedirection(object sendingProcess,
                              DataReceivedEventArgs outLine)
        {
            try
            {
                if (outLine.Data != null) Console.WriteLine(outLine.Data);
                // or collect the data, etc
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return;
            }
        }


        public static async Task<bool> BinarySearchSortedFile(string filePath, int baseLineLength, string key)
        {
            return (await BinarySearchSortedFile(filePath, baseLineLength, new List<string>() { key })).found.Count > 0;
        }

        public static async Task<(List<string> found, List<string> notFound)> BinarySearchSortedFile(string filePath, int baseLineLength, List<string> keys)
        {
            int minLineLength = baseLineLength + 1;
            int maxLineLength = baseLineLength + 2;

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

                await fs.ReadAsync(buffer, 0, maxLineLength);

                if (buffer[baseLineLength] == LF) lineLength = minLineLength;
                else if (buffer[baseLineLength] == CR && buffer[minLineLength] == LF) lineLength = maxLineLength;
                else throw new Exception($"Unexpected line termination character on line with expected length of: {baseLineLength} with data: {Encoding.UTF8.GetString(buffer, 0, buffer.Length)}");

                var lineCount = end / (decimal)lineLength;

                if (lineCount != Math.Ceiling(lineCount)) throw new Exception("Inconsistent line length in file");

                var fLength = unsubFile.Length;

                buffer = new byte[baseLineLength];

                foreach (var key in keys)
                {
                    var numRec = fLength / lineLength;
                    var bottom = 0L;
                    var top = numRec - 1;
                    var f = false;

                    while (bottom <= top)
                    {
                        var cur = (top + bottom) / 2;

                        fs.Seek(lineLength * cur, SeekOrigin.Begin);

                        await fs.ReadAsync(buffer, 0, baseLineLength);

                        var cmp = Encoding.UTF8.GetString(buffer, 0, buffer.Length).ToLower().CompareTo(key.ToLower());

                        if (cmp < 0) bottom = cur + 1;
                        else if (cmp > 0) top = cur - 1;
                        else
                        {
                            f = true;
                            break;
                        }
                    }

                    if (f) found.Add(key);
                    else notFound.Add(key);
                }
            }

            return (found, notFound);
        }


        public static string exeDiff = @"C:\Program Files\Git\usr\bin\diff";

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

        public static string exeUniq = @"C:\Program Files\Git\usr\bin\uniq";

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

        public static async Task<int> LineCount(string fileName) => (await File.ReadAllLinesAsync(fileName)).Count();

        public static void DiffManual(string curFile, string newFile, string diffFile)
        {
            var curFileLineCount = 0;
            var newFileLineCount = 0;
            var deltaLineCount = 0;
            //List<string> delta = new List<string>();
            using (var diff = new StreamWriter(diffFile))
            {
                using (var oldRdr = File.OpenText(curFile))
                {
                    using (var newRdr = File.OpenText(newFile))
                    {
                        var readOld = true;
                        var readNew = true;
                        var oldLine = string.Empty;
                        var newLine = string.Empty;
                        while (!newRdr.EndOfStream && !oldRdr.EndOfStream)
                        {
                            if (readOld) { oldLine = oldRdr.ReadLine(); curFileLineCount++; }
                            if (readNew) { newLine = newRdr.ReadLine(); newFileLineCount++; }
                            var cmp = newLine.ToLower().CompareTo(oldLine.ToLower());
                            //String.CompareOrdinal(newLine, oldLine);
                            if (cmp == 0) { readOld = true; readNew = true; continue; }
                            if (cmp > 0) { readOld = true; readNew = false; continue; }
                            {
                                //delta.Add(newLine);
                                diff.WriteLine();
                                deltaLineCount++;
                                readOld = false;
                                readNew = true;
                            }
                        }
                        while (!newRdr.EndOfStream)
                        {
                            //delta.Add(await newRdr.ReadLineAsync());
                            diff.WriteLine();
                            newFileLineCount++;
                            deltaLineCount++;
                        }
                    }
                }
            }
            //return delta;
        }
    }
}
