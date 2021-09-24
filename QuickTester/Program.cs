using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Utility;
using Utility.LongRunningWorkflow;
using UnsubLib;
using System.Collections.Generic;
using System.IO;
using Utility.GenericEntity;
using System.Text.RegularExpressions;
using System.Xml.XPath;
using System.Xml;
using System.Xml.Xsl;
using System;

namespace QuickTester
{
    internal class Program
    {
        public static Task<object> Md5ZipHandler(FileInfo f, string logContext)
        {
            var fileName = Guid.NewGuid();
            return Task.FromResult<object>(fileName);
        }

        public static async Task<string> ZipTester(FileInfo f)
        {
            return "";
        }

        public static void doUnsub()
        {
            
            string logContext = "";
            var _fw = new FrameworkWrapper();

            string unsubUrl = "https://api.unsubcentral.com/api/service/keys/Tez4VKyKFsNuatjgUdRjJZntL71gzqc6Gnk5aDk7LomlregKJtKyRrKnMFCQ4uHo?s=JZGc9cx&format=hash";
            string authString = "onpoint_global:iYkXDQMbwZfQVb6F4nWe";

            try
            {
                var dr = ProtocolClient.DownloadUnzipUnbuffered(unsubUrl, authString, ZipTester,
                  new Dictionary<string, Func<FileInfo, Task<object>>>()
                  {
                        { UnsubLib.UnsubLib.MD5HANDLER, f =>  Md5ZipHandler(f,logContext) },
                        { UnsubLib.UnsubLib.PLAINTEXTHANDLER, f =>   Md5ZipHandler(f,logContext) },
                        { UnsubLib.UnsubLib.DOMAINHANDLER, f =>   Md5ZipHandler(f,logContext) },
                        { UnsubLib.UnsubLib.SHA512HANDLER, f =>  Md5ZipHandler(f,logContext) },
                        { UnsubLib.UnsubLib.UNKNOWNHANDLER, f =>  Md5ZipHandler(f,logContext) }
                  },
                  "c:\\testunsub", //ClientWorkingDirectory
                  30 * 60, 1, _fw).GetAwaiter().GetResult();
            }
            catch (Exception ex)
            {
            }
        }


        private async static Task Main(string[] _args)
        {
            //XmlReader xmlReader = XmlReader.Create(new StringReader("<test></test>"));
            //XPathDocument document = new XPathDocument(xmlReader);
            //XPathNavigator navigator = document.CreateNavigator();

            //XPathScanner scanner = new XPathScanner(xpathPattern);
            //XPathParser parser = new XPathParser(scanner);
            //AstNode result = parser.ParsePattern(null);
            //if (scanner.Kind != XPathScanner.LexKind.Eof)
            //{
            //    throw XPathException.Create(Res.Xp_InvalidToken, scanner.SourceText);
            //}
            //return result;

            //// Returns a number.  
            //XPathExpression query1 = navigator.Compile("bookstore/book/price/text()*10");


            string rollupCfg = @"jsonforgrammar.txt";
            /*
            // The rollupGrammar is per rollup and will be configured in the rollupCfg json for that rollup
            string rollupGrammar = @"grammar.txt";

            string gstr = "<rlp_std_group_by> ::= SELECT <<agg_column_list:2:g/>> FROM (<<qry_derived_elements:1>>) ws GROUP BY <<key_col_list_without_aliases:3>>;";
            string[] gline = gstr.Split("::=");
            string prodName = gline[0].Trim();
            string prodValue = gline[1].Trim();
            List<(int matchOrder, string matchName)> matches = new();
            foreach (Match m in Regex.Matches(prodValue, @"<<[\w\:]+>>"))
            {
                string[] matchSplit = m.Value.Substring(2, m.Value.Length-4).Split(':');
                string matchName = matchSplit[0];
                int matchOrder = matchSplit[1] != "" ? Int32.Parse(matchSplit[1]) : 0;
                matches.Add((matchOrder, matchName));
            }
            matches.Sort((x, y) => -y.matchOrder.CompareTo(x.matchOrder));

            IGenericEntity ge3 = GenericEntityJson.Parse("{}");

            foreach (var m in matches)
            {
                string res = "";
                Type.GetType("QuickTester.EdwGrammar").GetMethod(m.matchName).Invoke(null, new object [] { ge3, ge3 });
                // call m.matchName(all, ctx)
                gstr.Replace($"<<{m.matchName}:{m.matchOrder}>>", res);
            }
            */


            string text = File.ReadAllText(rollupCfg);
            IGenericEntity ge = GenericEntityJson.Parse(text);
            ge = GenericEntityJson.Parse("{ \"names\": [\"bob\", \"john\", \"bill\"] }");
            Dictionary<string, string> d = EdwGrammar.GenerateSql(ge);
            return;

            //doUnsub();
            LinqToFilesystem.Test();
            await CliWrapper.TestCli();
            return; 

            //Config.Test();
            //await ClickhouseImportTest.ImportTest();
            //return;

            var ge2 = JsonWrapper.GenericEntityFromFile(@"json3.txt").GetAwaiter().GetResult();
            string q = ClickhouseQueryGenerator.generateClickhouseQuery(ge);
            Console.WriteLine(q);
            EdwTestDataGenerator.GenerateTestData();
            return;
       }
    }
}