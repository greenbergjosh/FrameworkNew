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

            try
            {
                string inf = sourcePath + "\\" + inputFile;
                string outf = sourcePath + "\\" + outputFile;
                Process pProcess = new Process();
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
            catch (Exception ex)
            {
                throw;
            }
        }

        public static string exeGrep = @"C:\Program Files\Git\usr\bin\grep";

        public static async Task RemoveNonMD5LinesFromFile(string sourcePath, string inputFile,
            string outputFile, int timeout = 1000 * 60 * 5)
        {
            try
            {
                string inf = sourcePath + "\\" + inputFile;
                string outf = sourcePath + "\\" + outputFile;
                Process pProcess = new Process();
                pProcess.StartInfo.FileName = @"C:\Windows\System32\cmd.exe";
                pProcess.StartInfo.Verb = "runas";
                pProcess.StartInfo.Arguments = "/c " +
                    Fs.QuotePathParts(exeGrep) + " -P -i '[0-9a-f]{32}' " + Fs.QuotePathParts(inf) +
                    " > " + Fs.QuotePathParts(outf);
                pProcess.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                pProcess.StartInfo.UseShellExecute = true;
                pProcess.StartInfo.WorkingDirectory = @"C:\Windows\System32";
                pProcess.Start();
                await pProcess.WaitForExitAsync();
                pProcess.Close();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        static void OutputRedirection(object sendingProcess,
                              DataReceivedEventArgs outLine)
        {
            try
            {
                if (outLine.Data != null)
                    Console.WriteLine(outLine.Data);
                // or collect the data, etc
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return;
            }
        }

        public static async Task<(List<string> found, List<string> notFound)> BinarySearchSortedMd5File(string filePath, List<string> keys)
        {
            const int bufferSize = 2048;
            var notFound = new List<string>();
            var found = new List<string>();
            var unsubFile = new FileInfo(filePath);

            keys.Sort();

            using (var enrtr = keys.GetEnumerator())
            using (var fs = unsubFile.OpenRead())
            //using (var sr = new StreamReader(fs, Encoding.UTF8, true, bufferSize))
            {
                enrtr.MoveNext();

                var lineLength = 0;
                var buffer = new byte[34];
                var end = fs.Length;

                await fs.ReadAsync(buffer, 0, 34);

                if (buffer[32] == 10) lineLength = 33;
                else if (buffer[32] == 13 && buffer[33] == 10) lineLength = 34;
                else throw new Exception("Unexpected line termination character");

                var lineCount = end / (decimal)lineLength;

                if (lineCount != Math.Ceiling(lineCount)) throw new Exception("Inconsistent line length in file");

                end -= lineLength;

                buffer = new byte[32];

                var top = 0L;
                var offsetThreshold = lineLength * 3;

                bool EOS(long index)
                {
                    return index > end;
                }

                bool? SortedBelow(string line, string key)
                {
                    var c = line.CompareTo(key);

                    return c > 0 ? false : c < 0 ? true : null as bool?;
                }

                async Task<string> GetIndexValue(long index)
                {
                    fs.Seek(index, SeekOrigin.Begin);

                    await fs.ReadAsync(buffer, 0, 32);

                    return Encoding.UTF8.GetString(buffer, 0, 32);
                }

                async Task<(bool? found, long index, bool? descend)> BinaryJumps()
                {
                    var descend = true;
                    var bottom = end;

                    while (!EOS(top))
                    {
                        var lines = (bottom - top) / lineLength;
                        var index = (((int)Math.Floor(lines / 2M)) * lineLength) + top;
                        var line = await GetIndexValue(index);
                        var d = SortedBelow(line, enrtr.Current);

                        if (d == null) return (true, index, null);

                        descend = d.Value;

                        // ToDo: See if moving end index improves performance
                        if (descend)
                        {
                            var ni = index;

                            if (bottom - ni <= offsetThreshold) return (null, index, descend);

                            top = ni;
                        }
                        else
                        {
                            var ni = index - 1;

                            if (ni - top <= offsetThreshold) return (null, index, descend);

                            bottom = ni;
                        }
                    }

                    return (false, -1, null);
                }

                async Task<bool> search(long index, bool descend)
                {
                    string line = null;

                    while (!EOS(index) && (line = await GetIndexValue(index)) != null)
                    {
                        var d = SortedBelow(line, enrtr.Current);

                        if (d == null) return true;

                        if (d == false)
                        {
                            if (descend)
                            {
                                top = index;

                                return false;
                            }
                            else index -= lineLength;
                        }
                        else if (descend) index += lineLength;
                        else return false;
                    }

                    return false;
                }

                while (!EOS(top) && enrtr.Current != null)
                {
                    var r = await BinaryJumps();

                    if (r.found == true) found.Add(enrtr.Current);
                    else if (r.found == false) notFound.Add(enrtr.Current);
                    else if (r.index > -1)
                    {
                        if (await search(r.index, r.descend.Value)) found.Add(enrtr.Current);
                        else notFound.Add(enrtr.Current);
                    }
                    else
                    {
                        while (enrtr.Current != null)
                        {
                            notFound.Add(enrtr.Current);
                            enrtr.MoveNext();
                        }
                    }

                    enrtr.MoveNext();
                }

                //String line;

                //while ((line = await streamReader.ReadLineAsync()) != null)
                //{
                //    if (enrtr.Current == null) break;
                //    while (true)
                //    {
                //        if (enrtr.Current == null) break;

                //        var cmp = String.CompareOrdinal(enrtr.Current, line);

                //        if (cmp == 0)
                //        {
                //            enrtr.MoveNext();
                //            found.Add(enrtr.Current);
                //            break;
                //        }
                //        else if (cmp < 0)
                //        {
                //            notFound.Add(enrtr.Current);
                //            enrtr.MoveNext();
                //        }
                //        else break;
                //    }
                //}

            }

            return (found, notFound);
        }

        public static async Task<bool> BinarySearchSortedMd5File(string sourcePath, string file, string key)
        {
            string lkey = key.ToLower();
            string fPath = sourcePath + "\\" + file;

            long fLength = new System.IO.FileInfo(fPath).Length;
            if (fLength < 33) return false;

            using (FileStream fsSource = new FileStream(fPath, FileMode.Open, FileAccess.Read))
            {
                int lLength = 0;
                byte[] bytes = new byte[34];
                int n = await fsSource.ReadAsync(bytes, 0, 34);
                if (bytes[32] == 10) lLength = 33;
                else if (bytes[32] == 13 && bytes[33] == 10) lLength = 34;
                else throw new System.Exception("Unexpected line termination character");

                long numRec = fLength / lLength;

                long bottom = 0;
                long top = numRec - 1;
                while (bottom <= top)
                {
                    long cur = (top + bottom) / 2;
                    fsSource.Seek(lLength * cur, SeekOrigin.Begin);
                    byte[] nextBytes = new byte[32];
                    int ct = await fsSource.ReadAsync(nextBytes, 0, 32);
                    int cmp = Encoding.UTF8.GetString(nextBytes, 0, nextBytes.Length)
                        .ToLower().CompareTo(lkey);
                    if (cmp < 0) bottom = cur + 1;
                    else if (cmp > 0) top = cur - 1;
                    else return true;
                }
            }

            return false;
        }

        public static string exeDiff = @"C:\Program Files\Git\usr\bin\diff";

        public static async Task<bool> DiffFiles(string oldFile, string newFile, string sourcePath,
            string diffFile, int timeout = 1000 * 60 * 5)
        {
            StreamWriter swOut = new StreamWriter(sourcePath + "\\" + diffFile, true);
            bool timedOut = false;
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
            StreamWriter swOut = new StreamWriter(sourcePath + "\\" + newFile, true);
            bool timedOut = false;
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

        public static async Task<int> LineCount(string fileName)
        {
            return (await File.ReadAllLinesAsync(fileName)).Count();
        }

        public static void DiffManual(string curFile, string newFile, string diffFile)
        {
            int curFileLineCount = 0;
            int newFileLineCount = 0;
            int deltaLineCount = 0;
            //List<string> delta = new List<string>();
            using (StreamWriter diff = new StreamWriter(diffFile))
            {
                using (StreamReader oldRdr = File.OpenText(curFile))
                {
                    using (StreamReader newRdr = File.OpenText(newFile))
                    {
                        bool readOld = true;
                        bool readNew = true;
                        string oldLine = String.Empty;
                        string newLine = String.Empty;
                        while (!newRdr.EndOfStream && !oldRdr.EndOfStream)
                        {
                            if (readOld) { oldLine = oldRdr.ReadLine(); curFileLineCount++; }
                            if (readNew) { newLine = newRdr.ReadLine(); newFileLineCount++; }
                            int cmp = newLine.ToLower().CompareTo(oldLine.ToLower());
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
