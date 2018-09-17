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
                            $"\"{zipFileName}\" -d {UnzippedDirectory}",
                            ZipFileDirectory,
                            timeout,
                            outs,
                            errs).ConfigureAwait(continueOnCapturedContext: false);
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
            int timeout = 1000 * 60 * 5, int parallel = 4)
        {
            var exitCode = await ProcessWrapper.StartProcess(
                        exeSort,
                        $"--parallel={parallel} {inputFile} --output={outputFile}"
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
                    Fs.QuotePathParts(exeGrep) + " -E -i -x '[0-9a-f]{32}' " + Fs.QuotePathParts(inf) +
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
                long top = numRec-1;
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

        public static async Task<bool> Unique(string oldFile, string newFile, string sourcePath,  int timeout = 1000 * 60 * 5)
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
