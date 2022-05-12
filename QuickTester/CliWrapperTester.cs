using System.IO;
using System.Threading.Tasks;
using CliWrap;

namespace QuickTester
{
    // Arguments, Credentials, EnvironmentVariables, Standard(Error|Input|Output)Pipe, TargetFilePath, Validation, WorkingDirPath, |
    // public const string exeUnzip = @"C:\Program Files\Git\usr\bin\unzip";
    class CliWrapperTester
    {
        public const string exeUnzip = @"C:\Program Files\Git\usr\bin\unzip";

        public static async Task<int> Run()
        {
            /*
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
            */

            //Type tCli = typeof(CliWrap.Cli); 
            //Type tCommand = typeof(CliWrap.Command);
            //Type tCredentials = typeof(CliWrap.Credentials);
            //Type tCommandResult = typeof(CliWrap.CommandResult);
            //Type tPipeSource = typeof(CliWrap.PipeSource);
            //Type tPipeTarget = typeof(CliWrap.PipeTarget);
            //Type tFile = typeof(File);
            //Type tStream = typeof(Stream); 
            //Type tDictStringMaybeString = typeof(Dictionary<string, string?>);
            //Type tString = typeof(String);
            //Type tEnumPipeTarget = typeof(IEnumerable<PipeTarget>);
            //Type tEncoding = typeof(Encoding);
            //Type tActionString = typeof(Action<string>);
            //Type tFuncStringTask = typeof(Func<string, Task>);
            //Type tBool = typeof(bool);
            //Type tCancellationToken = typeof(CancellationToken);
            //Type tByteArray = typeof(byte[]);
            //Type tStringBuilder = typeof(StringBuilder);

            //var methods = new Dictionary<string, MethodBase>();

            //methods["Wrap"] = tCli.GetMethod("Wrap", new Type[] { tString }); 
            //methods["WithArguments"] = tCommand.GetMethod("WithArguments", new Type[] { tString });
            //methods["WithWorkingDirectory"] = tCommand.GetMethod("WithWorkingDirectory", new Type[] { tString });
            //methods["WithEnvironmentVariables"] = tCommand.GetMethod("WithEnvironmentVariables", new Type[] { tDictStringMaybeString } );
            //methods["ExecuteAsync"] = tCommand.GetMethod("ExecuteAsync", new Type[] { tCancellationToken });
            //methods["CreateCredentials"] = tCredentials.GetConstructor(new Type[] { tString, tString, tString });
            //methods["WithCredentials"] = tCommand.GetMethod("WithCredentials", new Type[] { tCredentials });

            //methods["FromBytes"] = tPipeSource.GetMethod("FromBytes", new Type[] { tByteArray });
            //methods["FromCommand"] = tPipeSource.GetMethod("FromCommand", new Type[] { tCommand });
            //methods["FromFile"] = tPipeSource.GetMethod("FromFile", new Type[] { tString });
            //methods["FromStream"] = tPipeSource.GetMethod("FromStream", new Type[] { tStream });
            //methods["FromStreamFlush"] = tPipeSource.GetMethod("FromStream", new Type[] { tStream, tBool });
            //methods["FromString"] = tPipeSource.GetMethod("FromString", new Type[] { tString });
            //methods["FromStringEncoding"] = tPipeSource.GetMethod("FromString", new Type[] { tString, tEncoding });
            //methods["GetEncoding"] = tEncoding.GetMethod("GetEncoding", new Type[] { tString });

            //methods["Merge"] = tPipeTarget.GetMethod("Merge", new Type[] { tEnumPipeTarget });
            //methods["ToDelegateAction"] = tPipeTarget.GetMethod("ToDelegate", new Type[] { tActionString });
            //methods["ToDelegateFunc"] = tPipeTarget.GetMethod("ToDelegate", new Type[] { tFuncStringTask });
            //methods["ToDelegateActionEncoding"] = tPipeTarget.GetMethod("ToDelegate", new Type[] { tActionString, tEncoding });
            //methods["ToDelegateFuncEncoding"] = tPipeTarget.GetMethod("ToDelegate", new Type[] { tFuncStringTask, tEncoding });
            //methods["ToFile"] = tPipeTarget.GetMethod("ToFile", new Type[] { tString });
            //methods["ToStream"] = tPipeTarget.GetMethod("ToStream", new Type[] { tStream });
            //methods["ToStreamFlush"] = tPipeTarget.GetMethod("ToStream", new Type[] { tStream, tBool });
            //methods["ToStringBuilder"] = tPipeTarget.GetMethod("ToStringBuilder", new Type[] { tString });
            //methods["ToStringBuilderEncoding"] = tPipeTarget.GetMethod("ToStringBuilder", new Type[] { tString, tEncoding });

            //methods["ToStringBuilderEncoding"] = tFile.GetMethod("OpenRead", new Type[] { tString });
            //methods["ToStringBuilderEncoding"] = tFile.GetMethod("Create", new Type[] { tString });

            //var result = await Cli.Wrap(exeUnzip)
            //        .WithArguments($"\"{zipFileName}\" -d \"{UnzippedDirectory}\"")
            //        .WithWorkingDirectory(ZipFileDirectory)
            //        .ExecuteAsync(cancellationTokenSource.Token);

            /*
            {
              "Executable": "C:\Program Files\Git\usr\bin\unzip",
              "Arguments": "\"CorporateVision-FinalMerge-7-9-2020.zip\" -d \"C:\\TestCliWrap\\ResultDir\"",
              "WorkingDirectory": "C:\\TestCliWrap",
              "Credentials" : {
                "username": "",
                "password": "",
                "domain": ""
              },
              "Timeout": 300000
            }
            {
              "Executable": "C:\Program Files\Git\usr\bin\unzip",
              "Arguments": "\"CorporateVision-FinalMerge-7-9-2020.zip\" -d \"C:\\TestCliWrap\\ResultDir\"",
              "WorkingDirectory": "C:\\TestCliWrap",
              "Timeout": 300000
            }
            */

            //Command c = Cli.Wrap(GetS("Executable"));
            //c = c.WithArguments(GetS("Arguments"));
            //c = c.WithWorkingDirectory(GetS("WorkingDirectory"));
            //CommandResult r = await c.ExecuteAsync(new CancellationTokenSource(GetI("Timeout")).Token);

            /*
            Command c = (Command)methods["Wrap"].Invoke(null, new object[] { GetS("Executable") });
            c = (Command)methods["WithArguments"].Invoke(c, new object[] { GetS("Arguments") });
            c = (Command)methods["WithWorkingDirectory"].Invoke(c, new object[] { GetS("WorkingDirectory") });
            c = (Command)methods["WithCredentials"].Invoke(c, new object[] {
                methods["CreateCredentials"].Invoke(new object[] { GetS("domain"), GetS("username"), GetS("password") })
            });
            CommandResult c5 = await ((CommandTask<CommandResult>)methods["ExecuteAsync"].Invoke(c, new object[] {
                (new CancellationTokenSource(GetI("Timeout"))).Token
            }));

            Command c = Cli.Wrap(GetS("Executable"));
            c = c.WithArguments(GetS("Arguments"));
            c = c.WithWorkingDirectory(GetS("WorkingDirectory"));
            c = c.WithCredentials(new Credentials(GetS("domain"), GetS("username"), GetS("password")));
            CommandResult r = await c.ExecuteAsync(new CancellationTokenSource(GetI("Timeout")).Token);
            */

            /*
            string ZipFileDirectory = "C:\\TestCliWrap";
            string zipFileName = "CorporateVision-FinalMerge-7-9-2020.zip";
            string UnzippedDirectory = "C:\\TestCliWrap\\ResultDir";
            int timeout = 1000 * 60 * 5;
            var cancellationTokenSource = new CancellationTokenSource(GetI("Timeout"));
            var cancellationTokenSource = new CancellationTokenSource(timeout);            

            string exe = GetS("Executable");
            string args = GetS("Arguments");
            string workingDirectory = GetS("WorkingDirectory");
            Credentials credentials = methods["CreateCredentials"].Invoke(new object[] { GetS("domain"), GetS("username"), GetS("password") });
            var cancellationTokenSource = new CancellationTokenSource(GetI("Timeout"));

            Command c1 = (Command)w.Invoke(null, new object[] { exeUnzip });
            Command c2 = (Command)wa.Invoke(c1, new object[] { $"\"{zipFileName}\" -d \"{UnzippedDirectory}\"" }); 
            Command c3 = (Command)wwd.Invoke(c2, new object[] { ZipFileDirectory });
            Command c4 = (Command)wc.Invoke(c3, new object[] { cc.Invoke(new object[] { "domain", "username", "password" }) } );
            CommandResult c5 = await ((CommandTask<CommandResult>)ea.Invoke(c3, new object[] { cancellationTokenSource.Token }));
            */

            await using var input = File.OpenRead("input.txt");
            await using var output = File.Create("output.txt");

            _ = await Cli.Wrap("foo")
                .WithStandardInputPipe(PipeSource.FromStream(input))
                .WithStandardOutputPipe(PipeTarget.ToStream(output))
                .ExecuteAsync();

            
            return 1;
        }
    }
}
