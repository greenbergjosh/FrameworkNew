using System;
using System.IO;
using Utility;

namespace UnsubUtil
{
    internal class Program
    {
        private static async System.Threading.Tasks.Task Main(string[] args)
        {
            var fileName = args[0];
            var fi = new FileInfo(Path.Combine("./", fileName));
            var command = args[1];
            var outputFile = Path.Combine("./", $"{fileName}.{command}");

            Console.WriteLine($"Will: {command}");
            if (command == "clean")
            {

                using (var fs = fi.OpenText())
                using (var ws = File.CreateText(outputFile))
                {
                    string line;

                    while ((line = await fs.ReadLineAsync()) != null)
                    {
                        if (!line.IsNullOrWhitespace()) await ws.WriteLineAsync(Hashing.Utf8MD5HashAsHexString(line.Trim()));
                    }
                }
            }

            if (args[1] == "sort")
            {
                await UnixWrapper.SortFile("./", fileName, outputFile, false, true, 300000, 4);
            }
            Console.WriteLine($"Finished with {command}. Output file is {outputFile}");
        }
    }
}
