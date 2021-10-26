using System.Linq;
using Utility;
using Utility.GenericEntity;

// email_events_merged

namespace QuickTester
{
    internal class ClickhouseQueryGenerator
    {
        public static string GenerateClickhouseQuery(IGenericEntity ge)
        {
            string q = "SELECT email FROM datasets.email_events_merged WHERE "
                + GenerateClickhouseWhere(ge);
            return q;
        }

        public static string GenerateClickhouseWhere(IGenericEntity ge)
        {
            string r;
            var op = ge.GetD("").Single().Item1;
            if (op == "and" || op == "or") r = GenerateClickhouseNary(op, ge.GetE(op));
            else if (op == "filter" || op == "!") r = GenerateClickhouseUnary(op, ge.GetE(op));
            else if (op == "all")
                r = GenerateClickhouseIn(ge.GetS($"{op}[0]/var"), $"[{ge.GetLS($"{op}[1]/in[1]", true).Join(",")}]");
            else r = GenerateClickhouseBinary(op, ge.GetS($"{op}[0]/var"), ge.GetS($"{op}[1]", '\''));   // used to pass true to second getS
            return "(" + r + ")";
        }

        public static string GenerateClickhouseNary(string op, IGenericEntity ge) => ge.GetL("").Select(x => GenerateClickhouseWhere(x)).Join(" " + op + " ");

        public static string GenerateClickhouseUnary(string op, IGenericEntity ge)
        {
            string r = "";
            if (op == "!") r = "NOT " + GenerateClickhouseWhere(ge);
            else if (op == "filter")
            {
                // We materialize the list with ToArray just in case the GenericEntity doesn't preserve order (we iterate vars twice)
                var vars = ge.GetEs("[0]//var").Select(var => var.GetS("")).Distinct().ToArray();
                var whereClause = GenerateClickhouseWhere(ge.GetE("[0]"));
                for (var i = 0; i < vars.Length; i++)
                {
                    whereClause = whereClause.Replace(vars[i], $"x.{i + 1}");
                }

                r = "arrayFilter(x -> " + whereClause + ", arrayZip(" + string.Join(',', vars) + ")) <> []";
            }
            return r;
        }

        public static string GenerateClickhouseIn(string var, string set) => "hasAny(" + var + "," + set + ")";

        public static string GenerateClickhouseBinary(string op, string var, string val) => var + op + val;
    }
}
