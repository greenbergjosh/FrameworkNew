using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Utility;

namespace QuickTester
{
    public static class UnixWrapperTests
    {

        private static async Task Tests(string[] args)
        {
            var cwd = Directory.GetCurrentDirectory();
            try
            {
                var cmd = args[0];
                var watch = new Stopwatch();

                switch (cmd)
                {
                    case "search":
                        var searchListF = args[2];
                        var searchList = await File.ReadAllLinesAsync(
                            $"{cwd}{Path.DirectorySeparatorChar}{searchListF}");

                        watch.Restart();
                        var result = await UnixWrapper.BinarySearchSortedFile(
                            $"{cwd}{Path.DirectorySeparatorChar}{ args[1]}",
                            Hashing.Md5StringLength,
                            searchList.ToList());
                        watch.Stop();

                        Console.WriteLine($"Timing: {watch.ElapsedMilliseconds}; " +
                            $"Hits: {result.found.Count}; " +
                            $"Misses: {result.notFound.Count}");
                        break;

                    case "sort":
                        watch.Restart();
                        await UnixWrapper.SortFile(cwd, args[1], args[2], false, false);
                        watch.Stop();

                        Console.WriteLine($"Timing: {watch.ElapsedMilliseconds}");
                        break;

                    case "diff":
                        watch.Restart();
                        await UnixWrapper.DiffFiles(args[1], args[2], cwd, args[3]);
                        watch.Stop();

                        Console.WriteLine($"Timing: {watch.ElapsedMilliseconds}");
                        break;
                }
            }
            catch
            {
                Console.WriteLine("Usage:\n\t" +
                    "diff \toldFile \tnewFile \tdiffFile\n\t" +
                    "search \tsearchFile \tmd5KeyFile\n\t" +
                    "sort \tinputFile \toutputFile\n\t");
            }

        }
        
    }
}