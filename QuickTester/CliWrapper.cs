using System;
using System.Threading.Tasks;
using CliWrap;


namespace QuickTester
{
    internal class CliWrapper
    {
        public static async Task TestCli()
        {
            try
            {
                await using var stdOut2 = Console.OpenStandardOutput();
                await using var stdErr2 = Console.OpenStandardError();

                var result = await Cli.Wrap("C:\\Program Files\\Git\\usr\\bin\\grep.exe")
                .WithArguments("bob a.txt")
                .WithWorkingDirectory("C:\\testfiles")
                .WithStandardOutputPipe(PipeTarget.ToStream(stdOut2))
                .WithStandardErrorPipe(PipeTarget.ToStream(stdErr2))
                .ExecuteAsync();

                var cmd = Cli.Wrap("C:\\Program Files\\Git\\usr\\bin\\grep.exe")
                .WithArguments("bob a.txt")
                .WithWorkingDirectory("C:\\testfiles") | (stdOut2, stdErr2);
                await cmd.ExecuteAsync();

                int c = 1;
                Console.WriteLine("c:" + c);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            
        }
        
}
}
