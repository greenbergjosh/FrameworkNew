using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using HtmlAgilityPack;
using MimeKit;
using Newtonsoft.Json;
using Utility;
using Utility.DataLayer;

namespace QuickTester
{
    internal class Program
    {
        private static void Main(string[] _args)
        {
            var ge = JsonWrapper.GenericEntityFromFile(@"json.txt").GetAwaiter().GetResult();
            string q = ClickhouseQueryGenerator.generateClickhouseQuery(ge);
        }
    }
}