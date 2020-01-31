////using CommandLine;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;

//namespace QuickTester
//{
//    public class CurlCommandLineParser
//    {
//        public static void Test()
//        {
//            var text = "curl -Lv file=filename.txt verbose simulate";
//            var args = text.Split();
//            //var result = CommandLine.Parser.Default.ParseArguments<Options>(args).MapResult((opts) => RunOptionsAndReturnExitCode(opts), //in case parser sucess
//            //    errs => HandleParseError(errs)); //in  case parser fail
//            //Console.WriteLine("Return code= {0}", result);
//        }

//        public static int RunOptionsAndReturnExitCode(Options o)
//        {
//            Console.WriteLine("Success");
//            var exitCode = 0;
//            var props = o.Props;
//            foreach (var prop in props)
//            Console.WriteLine("props= {0}", string.Join(",", props));
//            return exitCode;
//        }

//        //in case of errors or --help or --version
//        public static int HandleParseError(IEnumerable<Error> errs)
//        {
//            var result = -2;
//            Console.WriteLine("errors {0}", errs.Count());
//            if (errs.Any(x => x is HelpRequestedError || x is VersionRequestedError))
//                result = -1;
//            Console.WriteLine("Exit code {0}", result);
//            return result;
//        }
//    }

//    public class Options
//    {
//        [Value(0)]
//        public IEnumerable<string> Props
//        {
//            get;
//            set;
//        }

//        [Option('v', "verbose", Required = false, HelpText = "Set output to verbose messages.")]
//        public bool Verbose { get; set; }

//        [Option('L', "BigL", Required = false, HelpText = "Set output to verbose messages.")]
//        public bool BigL { get; set; }
//    }
//}
